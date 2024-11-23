# iot-street-lighting

# Hướng dẫn Cách chạy Backend

Trước khi chạy BE yêu cầu bật Docker desktop, trong package.json và docker-compose.yml đã setup sẵn docker để sử dụng rabbitMQ. Server chạy trên port 8087

NOTE: Nếu không chạy docker desktop thì sẽ bị lỗi ko gọi được docker dưới terminal

## Tải dependency cho project
bash
```
npm i --force
```

## Chạy project dưới terminal

bash

```
npm start
```

## Các Route API

#### Login: http://localhost:8087/api/v1/signin

#### SignUp: http://localhost:8087/api/v1/signup

#### change Light: http://localhost:8087/api/v1/changeLight

#### change schedule: http://localhost:8087/api/v1/changeSchedule

#### change brightness: http://localhost:8087/api/v1/changeBrightness


## Kết quả dự án

1. Giao diện

![dashboard](image1.png)

![dashboard](image.png)

![gps of devices](image2.png)

![signUp](image3.png)

![signIn](image4.png)
