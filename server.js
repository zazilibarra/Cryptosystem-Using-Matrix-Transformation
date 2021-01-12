const express = require('express');
const bodyParser = require('body-parser');
var formidable = require('express-form-data');

const path = require('path');
const app = express();
const router = require('./src/routes/index');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(formidable.parse({ keepExtensions: true }));
app.use(express.static('public'));

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, './src/views'));
app.set('view engine', 'ejs');

app.use('/', router);

app.listen(app.get('port'), () => {
    console.log("Server en el puerto: ", app.get('port'))
})