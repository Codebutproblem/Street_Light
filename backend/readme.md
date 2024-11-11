# Hướng dẫn Cách chạy project

Trước khi chạy BE thì nhớ bật docker desktop, trong package.json và docker-compose.yml đã setup sẵn docker để sử dụng rabbitMQ.

NOTE: Nếu không chạy docker desktop thì sẽ bị lỗi ko gọi được docker dưới terminal

## Chạy project dưới terminal

bash

```
npm start
```

## Route API

#### Login: http://localhost:8087/api/v1/signin

#### SignUp: http://localhost:8087/api/v1/signup

#### change Light: http://localhost:8087/api/v1/changeLight

#### change schedule: http://localhost:8087/api/v1/changeSchedule

#### change brightness: http://localhost:8087/api/v1/changeBrightness
