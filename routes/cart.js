const express = require('express')
const router = express.Router();
const Product = require('../models/product');

// get /
router.get('/add/:product',(req,res)=>{
    var slug = req.params.product;
    Product.findOne({slug: slug}, (error,product)=>{
        if(error)
        {
            console.log(error);
        } 
        if(typeof req.session.cart == "undefined") // if this is the first element that we buy
        {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                quantity: 1,
                price: parseFloat(product.price).toFixed(2),
                image: '/product_images/' + product._id + '/' + product.image
            })
        }
        else
        {
            var cart = req.session.cart;
            var newItem = true;

            for(var i=0; i< cart.length; i++)
            {
                if(cart[i].title == slug)
                {
                    cart[i].quantity++;
                    newItem = false;
                    break;
                }
            }
            if(newItem)
            {
                cart.push({
                    title: slug,
                    quantity: 1,
                    price: parseFloat(product.price).toFixed(2),
                    image: '/product_images/' + product._id + '/' + product.image
                })
            }
        }

        //console.log(req.session.cart);
        req.flash('success','Product Added')
        res.redirect('back')
     })
    
})


router.get('/checkout',(req,res)=>{

    if(req.session.cart && req.session.cart.length == 0)
    {
        delete req.session.cart
        res.redirect('/cart/checkout')
    }
    else
    {
        res.render('checkout',{
            title: 'Checkout',
            cart: req.session.cart
        })
    }
    

})


router.get('/update/:product',(req,res)=>{

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;
    for(var i=0 ;i< cart.length; i++)
    {
        if(cart[i].title == slug)
        {
            switch(action)
            {
                case "add":
                    cart[i].quantity++;
                    break;
                case "remove":
                    cart[i].quantity--;
                    if(cart[i].quantity < 1)
                        cart.splice(i,1);
                    break;
                case "clear":
                    cart.splice(i,1);
                    if(cart.length == 0)
                    {
                        delete req.session.cart;
                    }
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }
    req.flash('success','Cart Updated')
    res.redirect('/cart/checkout')

})

router.get('/clear',(req,res)=>{

    delete req.session.cart;
    req.flash('success','Cart Cleared')
    res.redirect('/cart/checkout')

})

router.get('/buynow', function (req, res) {

    delete req.session.cart;
    
    res.sendStatus(200);

});

module.exports = router;