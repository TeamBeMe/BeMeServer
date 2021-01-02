const { Answer, Question, Comment, Scrap }  = require('../models/');
const models = require('../models/index');
const { sequelize } = require('../models/index');

module.exports = {

    // 7개 각 질문의 가장 인기가 많은 답변 하나씩 가져오기
    getSevenAnswers : async(latSevenAnswer) => {
        try {
            // [0] 우선 해당 유저의 최근 7개 질문 id를 가져와야 한다 - latSevenAnswer
            // [1] id 리스트 한바퀴 돌면서 (for...of) [answer+comment조인 테이블]에서 해당 Answer.question_id를 가지는 Answer 중
            // comment수 내림차순대로 findAll
            // [2] findAll 결과값의 배열 첫번째 data return
            // 근데 모오오오든 게시물을 가져와서 코멘트 수 구하는건 비효율적이지 않나? 최근 50개 정도만 가져오는 방법?
            let answersArr = [];
            
            for await (answer of latSevenAnswer) {
                const question_id = answer.Question.id;
                console.log(question_id)

 
                const popAnswer = await Answer.findAll({
                    include: [{
                        model: Comment,
                        attributes: []
                    }],
                    attributes: ['id', 'question_id', 'content',
                    [sequelize.fn('count', sequelize.col('Comments.content')), 'comment_count']],
                    where: {
                        question_id: question_id
                    },
                    group: ['id'], // 아직 이해 x
                    order: [[sequelize.literal('comment_count'), 'DESC']]
                });
                answersArr.push(popAnswer[0]);
            };

            return answersArr

        } catch (error) {
            throw error;
        }
    },
}