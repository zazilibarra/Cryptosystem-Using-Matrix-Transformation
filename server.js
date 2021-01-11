const express = require('express');
const path = require('path');
const app = express();
const router = require('./src/routes/index');

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, './src/views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', router);

app.listen(app.get('port'), () => {
    console.log("Server en el puerto: ", app.get('port'))
})