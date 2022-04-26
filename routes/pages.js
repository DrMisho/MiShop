const express = require('express')
const router = express.Router();
const Page = require('../models/page');

// get /
router.get('/',(req,res)=>{
    Page.findOne({slug: 'home'}, (error,page)=>{
        if(error)
        {
            console.log(error);
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