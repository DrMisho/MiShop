const express = require('express')
const router = express.Router();
var Category = require('../models/catagory');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// GET /admin/categories/
router.get('/',isAdmin, (req,res)=>{
    Category.find({},function(error,cat){
        if(error)
        {
            return console.log(error);
        } 
        res.render('admin/categories',{
            categories: cat
        })
    })
})

// GET /admin/categories/add-category
router.get('/add-category',isAdmin, (req,res)=>{
    const title = '';
    res.render('admin/add_category',{
        title: title,
    })
})

// POST /admin/categories/add-category
router.post('/add-category', (req,res)=>{
    req.checkBody('title', 'Title must have a value').notEmpty();

    const title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();
    if(errors)
    {
        console.log(errors)
        res.render('admin/add_category',{
            errors: errors,
            title: title,
        })
    }
    else
    {
        Category.findOne({slug: slug}, (error, cat)=>{
            if(cat)
            {
                req.flash('danger','Category Title exists, choose another one')
                res.render('admin/add_category',{
                    title: title
                })
            }
            else 
            {
                var category = new Catagory({
                    title: title,
                    slug: slug
                })
                category.save((error)=>{
                    if(error)
                    {
                        return console.log(error);
                    }
                    Category.find((error,categories)=>{
                        if(error)
                        {
                            console.log(error);
                            
                        }
                        else
                        {
                            req.app.locals.categories = categories
                        }
                    })
                    req.flash('success','Category Added')
                    res.redirect('/admin/categories')
                })
            }
        })

    }

    
})

// GET /admin/categories/edit-category
router.get('/edit-category/:id',isAdmin, (req,res)=>{
    Category.findById(req.params.id, (error,cat)=>{
        if(error)
        {
            return console.log(error);
        }
        res.render('admin/edit_category',{
            title: cat.title,
            id: cat._id
        })
    })
    
})

// POST /admin/categories/edit-category
router.post('/edit-category/:id', function(req,res){
    req.checkBody('title', 'Title must have a value').notEmpty();

    const title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    const id = req.params.id;

    var errors = req.validationErrors();
    if(errors)
    {
        res.render('admin/edit_category',{
            errors: errors,
            title: title,
            id: id
        })
    }
    else
    {

        Category.findOne({slug: slug, _id:{'$ne':id}}, function(error, cat){
            if(cat)
            {
                req.flash('danger','Category Title exists, choose another one')
                res.render('admin/edit_category',{
                    title: title,
                    id: id
                })
            }
            else 
            {
                
                Category.findById(id, function(error,cat){
                    if(error)
                    {
                        return console.log(error);
                    }
                    cat.title = title;
                    cat.slug = slug;

                    cat.save((error)=>{
                        if(error)
                        {
                            return console.log(error);
                        }
                        Category.find((error,categories)=>{
                            if(error)
                            {
                                console.log(error);
                                
                            }
                            else
                            {
                                req.app.locals.categories = categories
                            }
                        })
                        req.flash('success','Category Edited')
                        res.redirect('/admin/categories/edit-category/'+cat.id)
                    });
                });
            }
                
            
        });
       

    }

    
});

// GET /admin/categories/delete-category
router.get('/delete-category/:id',isAdmin, (req,res)=>{
    Category.findByIdAndRemove(req.params.id, (error)=>{
        if(error)
        {
            return console.log(error);
        }
        Category.find((error,categories)=>{
            if(error)
            {
                console.log(error);
                
            }
            else
            {
                req.app.locals.categories = categories
            }
        })
        req.flash('success','Category Deleted')
        res.redirect('/admin/categories/')
    })
})

module.exports = router;