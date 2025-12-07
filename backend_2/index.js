const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");

//definindo o ejs como view engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));



//conexão com banco de dados
connection.authenticate().then(() => {
    console.log("bd on");
}).catch((errorMsg) => {
    console.log(errorMsg);
});

app.listen(8080, () => {
    console.log("server ta on");
});