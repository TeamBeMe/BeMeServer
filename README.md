# BeMeServer📓


## dependencies module (package.json)

```
  "dependencies": {
    "aws-sdk": "^2.820.0",
    "body-parser": "^1.19.0",
    "crypto": "^1.0.1",
    "express": "^4.17.1",
    "firebase-admin": "^9.4.2",
    "jsonwebtoken": "^8.5.1",
    "moment": "^2.29.1",
    "morgan": "^1.10.0",
    "multer": "^1.4.2",
    "multer-s3": "^2.9.0",
    "mysql2": "^2.2.5",
    "node-schedule": "^1.3.2",
    "sequelize": "^6.3.5"
  },
```
- aws-sdk : aws s3 파일 업로드 도구

- body-parser : Request body 에서 parameter 추출

- crypto : 패스워드 암호화 및 인증

- express : 웹, 서버 개발 프레임워크

- firebase-admin: fcm 사용을 위한 파이어베이스 모듈

- jsonwebtoken : JWT(Json Web Token) 생성 및 인증

- moment: utc 시간을 한국 시간대로 변경

- morgan: 로그 기록 도구

- multer : 파일 업로드 도구

- multer-s3 : AWS S3 파일 업로드 도구

- mysql2: mysql2 모듈

- node-schedule: 매일 같은 시간대에 질문 업로드를 위한 도구

- sequelize: MySQL을 지원하는 Node.js ORM.

  

## ER diagram
<img width="840" alt="스크린샷 2021-01-15 오전 1 07 26" src="https://user-images.githubusercontent.com/59338503/104616922-36593600-56ce-11eb-999e-4cb37edd1f99.png">



## 서버 아키텍쳐
<img width="830" alt="스크린샷 2021-01-15 오전 3 03 27" src="https://user-images.githubusercontent.com/59338503/104632951-c5237e00-56e1-11eb-8de0-2d851395a2b7.png">



## 핵심 기능 설명

### 홈화면 
- 매일 같은 시간 질문 업로드
- 질문 변경, 질문 더 받기
- 답변하기

### 둘러보기 탭
- 다른 사람 글 둘러보기
- 상세페이지 가져오기
- 댓글, 대댓글 작성하기
- 스크랩, 유저 차단하기

### 팔로잉 탭
- 팔로이, 팔로워 글 불러오기

### 마이페이지 탭
- 내가 쓴 글 불러오기
- 다른 사람 페이지의 글 불러오기
- 내가 스크랩한 글 불러오기
- 연속 출석 기록 가져오기

### 알림
- 매일 같은 시간에 질문 알림 받기
- 팔로우, 댓글 발생시 알림 받기



## 팀별 역할 분담

### 김가영
- 백앤드 리드 개발자
- DB 설계 및 구축
- 회원가입, 로그인, 차단 등 유저 관리 기능 구현
- 팔로잉탭 기능 구현
- 답변 댓글 기능 구현
- 답변 상세 페이지 기능 구현
- 마이페이지 연속 출석일 기능 구현
- 알림 기능 구현

### 김지현
- DB 설계 및 구축
- 매일 같은 시간 질문 업로드 기능 구현
- 질문 변경, 질문 더 받기, 공개 여부 수정 기능 구현
- 답변 스크랩 기능 구현
- 답변 둘러보기 기능 구현

