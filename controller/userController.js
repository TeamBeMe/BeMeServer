const util = require('../modules/util');
const message = require('../modules/responseMessage');
const code = require('../modules/statusCode');
const { User, Comment, Answer, RecentSearch} = require('../models');
const jwt = require('../modules/jwt');
const { userService } = require('../service');
const {Op} = require('sequelize');
const { formatRecentActivity } = require('../service/userService');



module.exports = {
    signup: async (req, res) => {
        const { email, nickname, password} = req.body;
        
        if (! email || ! password || ! nickname) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }

        try {
            // 이미 존재하는 email, nickname 인지 확인
            const paramsExist = await userService.isEmailNicknameExist(email, nickname);
            if ( paramsExist ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, paramsExist));
            }

            // hashedPassword 생성
            const {salt, hashedPassword} = await userService.hashPassword(password);
            
            
            const image = await userService.getImageUrl(req.file);
             
            const user = await User.create({
                email,
                password : hashedPassword,
                nickname,
                salt,
                profile_img : image
            });

            await Answer.create({
                public_flag: 0,
                user_id: user.id,
                question_id: 1,
                answer_idx: 1,
            })
            
            return res.status(code.CREATED).send(util.success(code.CREATED, message.SIGN_UP_SUCCESS, {id : user.id, email : user.email, nickname : user.nickname, profile_img : user.profile_img}));
            
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    signin: async (req, res) => {
        const { nickname, password } = req.body;
        if (! nickname || ! password ) {
            return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
        }
        try {
            const user = await User.findOne({
                where : {
                    nickname
                },
            });

            if (! user) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NO_USER));
            }

            const isValidPassword = await userService.isValidPassword(user, password)
            if (! isValidPassword) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.MISS_MATCH_PW));
            }

            const { token } = await jwt.sign(user);
            
            // 연속 출석수 갱신
            // userService.updateVisit(user);

            return res.status(code.OK).send(util.success(code.OK, message.SIGN_IN_SUCCESS, { token }));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }

    },
    // 최근 활동 가져오기
    getActivity: async (req, res) => {
        try {
            let { page } = req.query;
            // page default 1
            if (! page) {
                page = 1;
            }
            const user_id = req.decoded.id;
            // 댓글 기록 가져오기
            let comments = await Comment.findAll({
                include : [{
                    model : Answer,
                    where : {
                        user_id
                    },
                    attributes: [],
                },{
                    model : User,
                }],
                where : {
                    user_id:{ [Op.not]: user_id},
                },
                order : [['createdAt', 'DESC']],
            });
            // 내가 쓴 댓글에 대댓글 기록 가져오기
            let second_comments = await Comment.findAll({
                include : [{
                    model : Comment,
                    as : 'Parent',
                    where : {
                        user_id
                    },
                    attributes: []
                },{
                    model : User,
                }],
                where : {
                    user_id:{ [Op.not]: user_id},
                },
                order: [['createdAt','DESC']],
            });
            // 나를 팔로잉한 기록 가져오기
            let followers = await User.findAll({
                include : {
                    model: User,
                    as : 'Follower',
                    where : {
                        id : user_id,
                    },
                    attributes: []
                },
                raw : true,
            });

            let results = [];
            comments = await formatRecentActivity(comments, 'comment');
            second_comments = await formatRecentActivity(second_comments, 'comment');
            followers = await formatRecentActivity(followers, 'follow', user_id);

            results = results.concat(comments, second_comments, followers)
            // createdAt으로 답변 정렬
            results.sort( (a,b) => b.createdAt.getTime() - a.createdAt.getTime());
            const pagination = await userService.makeActivityPagination(results, page);
            return res.status(code.OK).send(util.success(code.OK, message.GET_RECENT_ACTIVITY_SUCCESS, pagination));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    }, 
    // 아이디 검색하기
    getIdSearch: async (req, res) => {
        try {
            let {query, range} = req.query;

            const user_id = req.decoded.id;

            if (! query) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            if (! range) {
                range = 'all';
            }
            if (range != 'all' && range != 'follower' && range != 'followee') {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.OUT_OF_VALUE));
            }
            const user = await userService.idSearch(query, range, user_id);
            // 검색 결과가 자기 자신이면,
            if ( user && user.id == user_id) {
                return res.status(code.OK).send(util.success(code.OK, message.SEARCHING_MY_SELF, {}));
            }
            return res.status(code.OK).send(util.success(code.OK, message.SEARCH_ID_SUCCESS, user));
        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    // 검색 기록 가져오기 (전체)
    getRecentSearch: async (req, res) => {
        try {
            const user_id = req.decoded.id;

            // 최근 검색 기록 찾기
            let recentSearch = await RecentSearch.findAll({
                where: {
                    user_id,
                },
                attributes: ['searched_id'],
                raw: true,
            });
            //console.log(recentSearch)

            // 최근 검색 기록 없을 때
            if (recentSearch.length < 1) {
                return res.status(code.OK).send(util.success(code.OK, message.NO_RECENT_SEARCH));
            }

            // 최근 검색 기록 있을 때
            const searchedUsers = [];

            for (rs of recentSearch) {
                let searchedUser = await User.findOne({
                    where: {
                        id: rs.searched_id,
                    },
                    attributes: ['id', 'nickname', 'profile_img'],
                    raw: true,
                });
                searchedUsers.push(searchedUser);
            }
            
            return res.status(code.OK).send(util.success(code.OK, message.GET_RECENT_SEARCH_SUCCESS, searchedUsers));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },

    deleteRecentSearch: async (req,res) => {
        try {
            const user_id = req.decoded.id;
            const searched_id = req.params.searchedId;
            if (!searched_id) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }

            const searchedUser = await User.findByPk(searched_id);
            if(!searchedUser) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.INVALID_USER_ID));
            }

            const deleteRs = await RecentSearch.destroy({
                where: {
                    user_id,
                    searched_id
                }
            })

            return res.status(code.OK).send(util.success(code.OK, message.DELETE_RECENT_SEARCH_SUCCESS));

        } catch (err) {
            console.error(err);
            return res.status(code.INTERNAL_SERVER_ERROR).send(util.fail(code.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR));
        }
    },
    // 닉네임 중복검사
    nicknameCheck: async (req, res) => {
        try {
            const { nickname } = req.query;
            if (! nickname ) {
                return res.status(code.BAD_REQUEST).send(util.fail(code.BAD_REQUEST, message.NULL_VALUE));
            }
            const user = await User.findOne({
                where : {
                    nickname,
                }
            });
            if ( user ) {
                return res.status(code.OK).send(util.success(code.OK, message.ALREADY_NICKNAME, { nicknameExist : true}));
            }
            return res.status(code.OK).send(util.success(code.OK, message.NOT_EXIST_NICKNAME, { nicknameExist : false}));
        } catch (err) {
            console.error(err);
        }
    }
    
}