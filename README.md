# 오운완

사용자들의 오늘 한 운동을 기록하기 위한 REST API

MongoDB, ExpressJS 스택

* JWT로 사용자 로그인
* 그날 한 운동(Workout)과 세부적인 루틴(Routine)을 기록하고 이미지 업로드

requirements
* mongodb
* postman

```console
npm install
brew services start mongodb-community@6.0
npm run dev
```

## postman
[사용링크](https://www.postman.com/material-cosmonaut-91512792/workspace/todays-workout/collection/21982422-9df9d40e-2f7e-4f74-9b50-7e27ecf48645?ctx=documentation)

## 몇가지 예시 및 방법
### User
1. Create User - 유저 생성을 먼저 한다
<img width="1322" alt="Screen Shot 2022-09-29 at 2 34 15 PM" src="https://user-images.githubusercontent.com/40656716/192947084-f3ae9d6f-1504-4081-ab7c-aaddcd15e752.png">

2. Login User - 계정 생성 후 로그인
<img width="1287" alt="Screen Shot 2022-09-29 at 2 34 37 PM" src="https://user-images.githubusercontent.com/40656716/192947125-55bad1e6-5af5-476a-b731-f5268a2d3973.png">

### Workouts
1. Create Workout - 오늘 일지 생성; 이미지 업로드 필수 
<img width="1304" alt="Screen Shot 2022-09-29 at 2 33 44 PM" src="https://user-images.githubusercontent.com/40656716/192947004-b38de40f-1f5f-401d-8444-86d0cbbfdea1.png">
2. Read User Workouts
<img width="1298" alt="Screen Shot 2022-09-29 at 2 36 34 PM" src="https://user-images.githubusercontent.com/40656716/192947373-36efdcb3-500c-4241-be09-4ea63a7cf4ff.png">
3. Read User Contributions - 운동날짜만 호출
<img width="1323" alt="Screen Shot 2022-09-29 at 2 37 20 PM" src="https://user-images.githubusercontent.com/40656716/192947484-2eed643d-12ed-4891-b531-e27703b3ff5d.png">
4. Update User's Workout
<img width="1329" alt="Screen Shot 2022-09-29 at 2 38 41 PM" src="https://user-images.githubusercontent.com/40656716/192947673-15f4e7d3-9b61-4da5-9852-586b4facf988.png">
5. Read Today's Image from Workout
<img width="1295" alt="Screen Shot 2022-09-29 at 2 39 15 PM" src="https://user-images.githubusercontent.com/40656716/192947768-22527bd8-8140-493b-bf5c-553bd768908e.png">

### Routines
1. Create Routine into Workout by id - 오늘의 운동 일지의 루틴 생성
<img width="1291" alt="Screen Shot 2022-09-29 at 2 45 06 PM" src="https://user-images.githubusercontent.com/40656716/192948852-6d6a61c9-0369-4b67-afb0-dfee2c023c09.png">
2. Update User's Routine
<img width="1309" alt="Screen Shot 2022-09-29 at 2 54 11 PM" src="https://user-images.githubusercontent.com/40656716/192950266-5a3fa388-02e2-4865-8366-e1a9babc9ff7.png">

