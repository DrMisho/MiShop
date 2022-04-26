const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database')
const app = express();
const bodyParser = require('body-parser')
const session = require('express-session')
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const passport = require('passport');

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');


app.use(express.static('public'));

app.locals.errors = null;

var Page = require('./models/page');
Page.find({}).sort({sorting: 1}).exec((error, pages)=>{
    if(error)
    {
        console.log(error);
        
    }
    else
    {
        app.locals.pages = pages
    }
})

const Category = require('./models/catagory')
Category.find((error,categories)=>{
    if(error)
    {
        console.log(error);
        
    }
    else
    {
        app.locals.categories = categories
    }
})

app.use(fileUpload());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
//    cookie: { secure: true }
}))

app.use(expressValidator({
    errorFormatter: function(param,msg,value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']'
        }
        return{
            param: formParam,
            msg: msg,
            value: value
        }
    },
    customValidators: {
        isImage: function(value, filename){
            var extension = (path.extname(filename)).toLowerCase();
            switch(extension){
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}))

app.use(require('connect-flash')());

app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


require('./config/passport')(passport)

app.use(passport.initialize());
app.use(passport.session());


app.get('*',(req,res,next)=>{
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
})

mongoose.connect(config.database);
const db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log('connected successfully')
})

// set routes
const pages = require('./routes/pages')
const products = require('./routes/products.js')
const cart = require('./routes/cart.js')
const users = require('./routes/users.js')
const adminPages = require('./routes/admin_pages');
const adminCategories = require('./routes/admin_categories');
const adminProducts = require('./routes/admin_products');
const { read } = require('fs');


app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProducts);
app.use('/products',products)
app.use('/cart',cart)
app.use('/users',users)
app.use('/',pages)


const port = 3000;
app.listen(port, ()=>{
    console.log(`app is listening to port ${port}`)
})
