module.exports = {
    NULL_VALUE: "필요한 값이 없습니다.",
    OUT_OF_VALUE: "파라미터 값이 잘못 되었습니다.",
  
    /* 토큰 */
    EMPTY_TOKEN: '토큰 값이 없습니다.',
    EXPIRED_TOKEN: '토큰 값이 만료되었습니다.',
    INVALID_TOKEN: '유효하지 않은 토큰값입니다.',
    AUTH_SUCCESS: '인증에 성공했습니다.',
    ISSUE_SUCCESS: '새로운 토큰이 생성되었습니다.',
  
    /* User */
    USER_UNAUTHORIZED : '해당 유저에게 권한이 없습니다',
    NO_USER: "존재하지않는 유저 id 입니다.",
  
    /* 회원가입 */
    SIGN_UP_SUCCESS: "회원 가입 성공.",
    SIGN_UP_FAIL: "회원 가입 실패.",
    SIGN_IN_SUCCESS: "로그인 성공.",
    SIGN_IN_FAIL: "로그인 실패.",
    ALREADY_ID: "존재하는 ID 입니다.",
    ALREADY_EMAIL: "이미 존재하는 이메일 입니다.",
    ALREADY_NICKNAME: '이미 존재하는 닉네임입니다',
    NO_EMAIL: '존재하지 않는 이메일 입니다.',
    MISS_MATCH_PW: "비밀번호가 일치하지 않습니다",

    /**탐색 */
    GET_CATEGORY_SUCCESS: '카테고리 가져오기 성공',

    /* 답변 등록 */
    POST_ANSWER_SUCCESS: "답변 등록 성공",
    POST_ANSWER_FAIL: "답변 등록 실패",
    UPDATE_ANSWER_SUCCESS : "답변 수정 성공",
    INVALID_ANSWER_ID: "존재하지 않는 답변 id 값입니다",
    UPDATE_ANSWER_FAIL: "답변 수정 실패",
    ALREADY_POSTED_ANSWER : '이미 답변이 등록된 질문입니다',
    USER_NO_ANSWERS: '유저가 작성한 답변이 존재하지 않습니다',

    /* 답변 불러오기 */
    GET_ANSWER_SUCCESS: "답변 불러오기 성공",
    GET_ANSWER_FAIL: "답변 불러오기 실패",
    USER_NO_ANSWERS: '유저에게 질문이 존재하지 않습니다',
    
    /* 질문 받기 */
    GET_QUESTION_SUCCESS: "질문 받아오기 성공",
    GET_QUESTION_FAIL: "질문 받아오기 실패",

    /* 공개여부 수정 */
    UPDATE_PUBLICFLAG_SUCCESS: "공개여부 수정 성공",
    UPDATE_PUBLICFLAG_FAIL: "공개여부 수정 실패",

    /* 질문 변경하기 */
    CHANGE_QUESTION_SUCCESS: "질문 변경하기 성공",
    CHANGE_QUESTION_FAIL: "질문 변경하기 실패",

    /* 답변 삭제 */
    DELETE_ANSWER_SUCCESS: "답변 삭제 성공",
    DELETE_ANSWER_FAIL: "답변 삭제 실패",

    /* 새로운 질문 받기 */
    RECEIVE_NEWQUESTION_SUCCESS: "새로운 질문 받기 성공",
    RECEIVE_NEWQUESTION_FAIL: "새로운 질문 받기 실패",
    NO_MORE_QUESTION: "새로운 질문이 없습니다",

    /* '나와 다른 생각들' 답변 7개 불러오기 */
    GET_ANOTHER_ANSWERS_SUCCESS: "다른 답변 7개 가져오기 성공",
    GET_ANOTHER_ANSWERS_FAIL: "다른 답변 7개 가져오기 실패",
    NO_ANSWERED_QUESTION: "아직 답한 질문이 없습니다",

    /* 나와 다른 생각들 답변 7개 상세보기 */
    INVALID_SORTING_QUERY: "잘못된 최신 / 흥미 쿼리",
    GET_SPECIFIC_ANSWERS_SUCCESS: "한 질문에 대한 답변 모아보기 성공",
    GET_SPECIFIC_ANSWERS_FAIL: "한 질문에 대한 답변 모아보기 실패",
    INVALID_QUESTION_ID: "존재하지 않는 question id 입니다",

    /* 다른 글 둘러보기 */
    GET_EXPLORATION_RESULT_SUCCESS: "다른 글 둘러보기 성공",
    NO_RESULT: "탐색 결과가 없습니다",
    INVALID_CATEGORY_ID: "존재하지 않는 category id 입니다",

    /* 스크랩 하기, 스크랩 취소하기 */
    DO_SCRAP_SUCCESS: "스크랩 성공",
    UNDO_SCRAP_SUCCESS: "스크랩 취소 성공",

    /* 댓글 */
    POST_COMMENT_SUCCESS: "댓글 생성하기 성공",
    POST_COMMENT_BLOCKED : "댓글이 허용되지 않은 답변입니다",
    INVALID_PARENT_ID : '잘못된 parent_id 입니다',
    CHECK_PUBLIC_FLAG: '댓글 공개 여부를 확인하세요',
    MODIFY_COMMENT_SUCCESS : "댓글 수정하기 성공",
    INVALID_COMMENT_ID : '존재하지 않는 댓글 id 입니다.',
    DELETE_COMMENT_SUCCESS: '댓글 삭제하기 성공',
    GET_DETAIL_ANSWER_SUCCESS: '상세페이지 가져오기 성공',

    /**팔로잉 */
    FOLLOWING_MYSELF : '자기 자신은 팔로우할 수 없습니다',
    FOLLOWING_SUCCESS : '팔로우 성공',
    UN_FOLLOWING_SUCCESS : '팔로우 취소 성공',
    FOLLOWING_LIST_SUCCESS : '팔로워, 팔로이 가져오기 성공',
    GET_FOLLOW_ANSWERS_SUCCESS : '팔로워, 팔로이 게시글 가져오기 성공',
    DELETE_FOLLOWING_SUCCESS : '팔로우 삭제 성공',
    NOT_MY_FOLLOEWR : '팔로워가 아닙니다',
    
    /**마이페이지 */
    GET_OTHER_ANSWER_SUCCESS: '다른 사람 게시글 가져오기 성공',
    GET_OTHER_PROFILE_SUCCESS: '다른 사람 프로필 정보 가져오기 성공',
    GET_MY_ANSWER_SUCCESS : '마이페이지 게시글 가져오기 성공',
    GET_MY_PROFILE_SUCCESS: '내 프로필 정보 가져오기 성공',
    GET_MY_SCRAP_SUCCESS: '내가 스크랩한 글 가져오기 성공',
    UPDATE_MY_PROFILE_IMG_SUCCESS: "내 프로필 사진 변경 성공",

    /* 검색 */
    SEARCH_ID_SUCCESS: "아이디 검색 성공",
    NO_USER_NICKNAME: "검색 결과가 없습니다",
    SEARCHING_MY_SELF: "자기 자신을 검색하였습니다",


    /* 최초 답변 하러가기 */
    GET_QUESTION_ID_SUCCESS: "답변해야 할 질문 가져오기 성공",
    GET_TODAY_QUESTION_ID_SUCCESS: "답변해야 할 오늘 질문 가져오기 성공",

    /* 페이징 */
    NO_MORE_PAGE: "더이상 페이지가 없습니다",
    NO_INVALID_PAGE: "유효하지 않은 페이지입니다",

    /* 최근 검색 가져오기 */
    GET_RECENT_SEARCH_SUCCESS: "최근 검색 가져오기 성공",
    NO_RECENT_SEARCH: "최근 검색 기록이 없습니다",

    /* 최근 검색 기록 삭제하기 */
    DELETE_RECENT_SEARCH_SUCCESS: "최근 검색 기록 삭제 완료",
    INVALID_USER_ID: "존재하지 않는 user id 입니다",

    /**알림뷰 */
    GET_RECENT_ACTIVITY_SUCCESS: '최근 활동 가져오기 성공',



    /* 서버에러 */
    INTERNAL_SERVER_ERROR: "서버 내부 오류",
  }
  