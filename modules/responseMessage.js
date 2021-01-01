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
    READ_USER_SUCCESS: "사용자 조회 성공",
    READ_USER_ALL_SUCCESS: "전체 사용자 조회 실패",
    READ_USER_FAIL: "사용자 조회 성공",
    READ_USER_ALL_FAIL: "전체 사용자 조회 실패",
    UPDATE_USER_SUCCESS: "사용자 업데이트 성공",
    UPDATE_USER_FAIL: "사용자 업데이트 실패",
    DELETE_USER_SUCCESS: "사용자 삭제 성공",
    DELETE_USER_FAIL: "사용자 삭제 실패",
    USER_UNAUTHORIZED : '해당 유저에게 권한이 없습니다',
  
    /* 회원가입 */
    SIGN_UP_SUCCESS: "회원 가입 성공.",
    SIGN_UP_FAIL: "회원 가입 실패.",
    SIGN_IN_SUCCESS: "로그인 성공.",
    SIGN_IN_FAIL: "로그인 실패.",
    ALREADY_NICKNAME: "존재하는 닉네임입니다.",
    NO_USER: "존재하지않는 유저입니다.",
    ALREADY_EMAIL: "존재하는 이메일 입니다.",
    NO_EMAIL: '존재하지 않는 이메일 입니다.',
    MISS_MATCH_PW: "비밀번호가 일치하지 않습니다",

    /* 답변 등록 */
    POST_ANSWER_SUCCESS: "답변 등록 성공",
    POST_ANSWER_FAIL: "답변 등록 실패",
    UPDATE_ANSWER_SUCCESS : "답변 수정 성공",
    INVALID_ANSWER_ID: "존재하지 않는 답변 id 값입니다",
    ALREADY_POSTED_ANSWER : "이미 답변이 등록된 질문입니다",
    UPDATE_ANSWER_FAIL: "답변 수정 실패",

    /* 답변 불러오기 */
    GET_ANSWER_SUCCESS: "답변 불러오기 성공",
    GET_ANSWER_FAIL: "답변 불러오기 실패",

    /** 댓글 */
    POST_COMMENT_SUCCESS: "댓글 생성하기 성공",
    POST_COMMENT_BLOCKED : "댓글이 허용되지 않은 답변입니다",
    INVALID_PARENT_ID : '잘못된 parent_id 입니다',
    CHECK_PUBLIC_FLAG: '댓글 공개 여부를 확인하세요',
    MODIFY_COMMENT_SUCCESS : "댓글 수정하기 성공",
    INVALID_COMMENT_ID : '존재하지 않는 댓글 id 입니다.',
    
    /* 서버에러 */
    INTERNAL_SERVER_ERROR: "서버 내부 오류",
  }
  