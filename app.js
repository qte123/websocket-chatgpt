const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// 启用CORS支持
app.use(cors());

// 设置静态文件目录（放置前端代码的文件夹）
app.use(express.static('public'));

// 启动服务器
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
