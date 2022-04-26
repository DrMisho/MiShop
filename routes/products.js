const express = require('express')
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/catagory')
const fs = require('fs-extra')
var auth = require('../config/auth');
var isUser = auth.isUser;
// get /
router.get('/',(req,res)=>{
    Product.find((error,products)=>{
        if(error)
        {
            console.log(error);
        } 
        
        else
        {
         res.render('all_products',
         {
            title: 'All Products',
            products: products
         });
        }
     })
    
})

router.get('/:category',(req,res)=>{

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug},(error,category)=>{

        Product.find({category: categorySlug},(error,products)=>{
            if(error)
            {
                console.log(error);
            } 
            
            else
            {
             res.render('cat_products',
             {
                title: category.title,
                products: products
             });
            }
         })
    })

    
    
})

router.get('/:category/:product',(req,res)=>{

    var galleryImages = null;
    var loggin = (req.isAuthenticated()) ? true : false;
    Product.findOne({slug: req.params.product},(error,product)=>{
        if(error)
        {
            console.log(error)
        }
        else
        {
            var galleryDir = 'public/product_images/' + product._id + '/gallery'
            fs.readdir(galleryDir,(error,files)=>{
                if(error)
                {
                    console.log(error)
                }
                else
                {
                    galleryImages = files;
                    res.render('product',{
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggin: loggin
                    })
                }
            });
        }
    })
    
})

router.get('/:slug',(req,res)=>{

    var slug = req.params.slug;

    Page.findOne({slug: slug}, (error,page)=>{
       if(error)
       {
           consolr.log(error);
       } 
       if(!page)
       {
           res.redirect('/');
       }
       else
       {
        res.render('index',
        {
            title: page.title,
            content: page.content
        });
       }
    })
    
    
})

module.exports = router;