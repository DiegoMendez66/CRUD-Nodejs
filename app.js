const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer({ dest: 'uploads/'});

app.set('view engine','ejs');
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use('/', require('./router'));
app.use(upload.single('imagen'));
app.use(express.static('uploads'))

app.listen(3000, ()=>{
    console.log('SERVER corriendo en http://localhost:3000');
});