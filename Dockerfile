# 使用官方 Node.js 映像作為基礎映像
FROM node:14

# 創建並設置工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝應用程式的依賴項
RUN npm install

# 複製應用程式的源碼
COPY . .

# 宣告你的應用程式會在哪個埠上運行
EXPOSE 3000

# 指定 Docker 容器啟動時要執行的命令
CMD [ "npm", "start" ]
