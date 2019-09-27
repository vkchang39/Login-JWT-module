const express = require("express");
const path = require('path')
const userRouter = require("./routers/user");
require("./db/mongoose");

const app = express();
const port = process.env.PORT;
const publicDirectoryPath = path.join(__dirname, '../public')
// app.get("/", function (req, res) {
//   return res.redirect("/public/index.html");
// }).listen(port);

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}))
app.use(userRouter);
app.use(express.static(publicDirectoryPath));

app.listen(port, () => {
  console.log('Server is up on port ' + port)
})