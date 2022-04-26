const express = require('express')
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcryptjs')

// get /
router.get('/register',(req,res)=>{
    
    res.render('register',{
        title: 'Register'
    })
    
})


router.post('/register',(req,res)=>{

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;

    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('email','email is required').isEmail();
    req.checkBody('username','Username is required').notEmpty();
    req.checkBody('password','Password is required').notEmpty();
    req.checkBody('password2','Password do not match!').equals(password);

    var errors = req.validationErrors();
    if(errors)
    {
        res.render('register',{
            errors: errors,
            user: null,
            title: 'Register'
        })
    }
    else
    {
        User.findOne({username: username},function(error,user){
            if(error)
            {
                console.log(error);
            }
            if(user)
            {
                req.flash('danger','Username exists, change another one');
                res.redirect('/users/register');
            }
            else
            {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                })

                bcrypt.genSalt(10, function(error,salt){
                    bcrypt.hash(user.password, salt, function(error,hash){
                        if(error)
                        {
                            console.log(error)
                        }
                        user.password = hash;
                        user.save(function(error){
                            if(error)
                            {
                                console.log(error);
                            }
                            else
                            {
                                req.flash('success','You are now registered');
                                res.redirect('/users/login');
                            }
                        })
                    })
                })
            }
        })
    }

    
})

router.get('/login', function (req, res) {

    if (res.locals.user) res.redirect('/');
    
    res.render('login', {
        title: 'Login'
    });

});

router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    
});

router.get('/logout', function (req, res) {

    req.logout();
    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');

});

module.exports = router;