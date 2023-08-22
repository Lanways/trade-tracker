# Trade Tracker API
一個使用 Node.js + Express 建構的後端，搭配 Postgres 關連式資料庫，打造的 API Server。
* [Live Demo of Trade-Tracker](https://owenlu0125.github.io/StockChart/login)

![](https://i.imgur.com/FElqO52.png)
## 使用 Docker Compose 快速啟動專案
首先，請確保您的機器已經安裝了 Docker和 Docker Compose。如果尚未安裝，可以參照以下官方文件進行安裝：
* [Docker installation guide](https://docs.docker.com/get-docker/)
* [Docker Compose installation guide](https://docs.docker.com/compose/install/)
1. 啟動您的終端機或命令提示字元，然後將此專案克隆到您的電腦上：
```
git clone https://github.com/Lanways/trade-tracker.git
```
2. 依照[.env.example](https://github.com/Lanways/trade-tracker/blob/master/.env.example)環境變數建立.env檔案。
```
touch .env
```
3. 啟動 Docker Compose
在終端機中，進入到專案的根目錄，並使用以下命令啟動專案：
```
docker-compose up -d
```
* 此命令將啟動並運行所有的服務。預設情況下，您的應用會在 http://localhost:3000 上運行。

4. 查詢container name。 
```
docker container ls
```
5. 進入資料庫容器。
```
docker exec -it <your_container_name> psql -U postgres
```
6. 建立資料庫。
```
CREATE DATABASE trade_tracker;
```
看到返回CREATE DATABASE代表建立成功，使用Ctrl + D 或輸入以下指令退出CLI
```
exit
```
7. 進入應用容器。
```
docker exec -it <your_container_name> /bin/bash
```
8. 執行腳本建立資料表及種子。
```
node main.js
```
9. 此時資料庫已經有完整的種子資料，可以參閱[API Docs](https://romantic-rubidium-021.notion.site/Trade-Tracker-API-Docs-6c97b6fef83c4d63a8ad5d8405d0d03d?pvs=4)並使用[API測試工具](https://www.postman.com/)開始測試。

10. 停止 Docker Compose
想要停止專案時，只需在專案的根目錄終端機中執行：
```
docker-compose down
```
## 本地部屬說明
1. 請先確認有安裝 Node.js 與 npm。
2. 啟動您的終端機或命令提示字元，然後將此專案克隆到您的電腦上。
```
git clone https://github.com/Lanways/trade-tracker.git
```
3. 進入專案資料夾。
```
cd trade-tracker
```
4. 安裝所需套件。
```
npm install
```
5. 在pgAdmin建立資料庫。
```
create database trade_tracker;
```
6. 依照[.env.example](https://github.com/Lanways/trade-tracker/blob/master/.env.example)建立.env檔案。
```
touch .env
```
7. 啟動腳本建立資料庫資料表及種子資料。
```
node main.js
```
8. 迅速啟動伺服器，請執行以下命令（如果想以開發模式啟動，使用npm run dev，確保您已安裝nodemon）。
```
npm run start
```
9. 伺服器將在 http://localhost:3000 上啟動運行。
```
express server is running on localhost:3000
```
10. 若要暫停使用伺服器，請在終端機按下 Ctrl + C (macOS: Command + C)。
## 路由列表

請參考API文件說明以獲得詳細的路由清單、必要參數和回傳格式。
* [API Docs](https://romantic-rubidium-021.notion.site/Trade-Tracker-API-Docs-6c97b6fef83c4d63a8ad5d8405d0d03d?pvs=4)

建議使用API測試工具進行測試。

* [Postman](https://www.postman.com/)

也可以在瀏覽器網址列輸入 http://localhost:3000/api/ 接著加上想要測試的路由，例如：
```
http://localhost:3000/api/signin
```
## 測試帳號
| Account   | Password |
|:---------:|:--------:|
| account1  | 12345    |
| account2  | 12345    |
| account3  | 12345    |
| account4  | 12345    |
| account5  | 12345    |
| account6  | 12345    |
| account7  | 12345    |
| account8  | 12345    |
| account9  | 12345    |
| account10  | 12345    |
## 開發工具
  * bcryptjs 2.4.3
  * cors 2.8.5
  * dotenv 8.2.0
  * express 4.18.2
  * faker 5.5.3
  * imgur 1.0.2
  * multer 1.4.5-lts.1
  * passport 0.6.0
  * passport-jwt 4.0.1
  * passport-local 1.0.0
  * pg 8.11.1