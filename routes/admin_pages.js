const express = require('express')
const router = express.Router();
var Page = require('../models/page');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// GET /admin/pages/
router.get('/',isAdmin, (req,res)=>{
    Page.find({}).sort({sorting: 1}).exec((error, pages)=>{
        res.render('admin/pages',{
            pages: pages
        })
    })
})

// GET /admin/pages/add-page
router.get('/add-page',isAdmin, (req,res)=>{
    const title = '';
    const slug = '';
    const content = '';
    res.render('admin/add_page',{
        title: title,
        slug: slug,
        content: content
    })
})

// POST /admin/pages/add-page
router.post('/add-page', (req,res)=>{
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    const title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == '')
        slug = title.replace(/\s+/g, '-').toLowerCase();
    const content = req.body.content;

    console.log(title);
    console.log(slug);
    console.log(content);
    var errors = req.validationErrors();
    if(errors)
    {
        console.log(errors)
        res.render('admin/add_page',{
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
    }
    else
    {
        Page.findOne({slug: slug}, (error, page)=>{
            if(page)
            {
                req.flash('danger','Page slug exists, choose another one')
                res.render('admin/add_page',{
                    title: title,
                    slug: slug,
                    content: content
                })
            }
            else 
            {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                })
                page.save((error)=>{
                    if(error)
                    {
                        return console.log(error);
                    }

                    Page.find({}).sort({sorting: 1}).exec((error, pages)=>{
                        if(error)
                        {
                            console.log(error);
                        }
                        else
                        {
                            req.app.locals.pages = pages
                        }
                    })

                    req.flash('success','Page Added')
                    res.redirect('/admin/pages')
                })
            }
        })

    }

    
})

// sort pages function
function sortPages(ids, callback)
{
    var count = 0;
    for(var i= 0; i<ids.length; i++)
    {
        var id = ids[i];
        count++;
        (function(count){
            Page.findById(id, (error,page)=>{
                page.sorting = count;
                page.save((error)=>{
                    if(error)
                    {
                        return console.log(error);
                    }
                    count++;
                    if(count >= ids.length)
                    {
                        callback();
                    }
                })
            })
        })(count);
    }
}

// POST /admin/pages/reorder-page
router.post('/reorder-page', (req,res)=>{
    console.log('reorder-page');
    var ids = req.body['id[]'];
    
    sortPages(ids,()=>{
        Page.find({}).sort({sorting: 1}).exec((error, pages)=>{
            if(error)
            {
                console.log(error);
                
            }
            else
            {
                req.app.locals.pages = pages
            }
        })
    })
    
})

// GET /admin/pages/edit-page
router.get('/edit-page/:id',isAdmin, (req,res)=>{
    var id = req.params.id
    Page.findById(id, (error,page)=>{
        if(error)
        {
            return console.log(error);
        }
        res.render('admin/edit_page',{
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        })
    })
    
})

// POST /admin/pages/edit-page
router.post('/edit-page/:id', function(req,res){
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    const title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == '')
        slug = title.replace(/\s+/g, '-').toLowerCase();
    const content = req.body.content;
    const id = req.params.id;

    var errors = req.validationErrors();
    if(errors)
    {
        console.log(errors)
        res.render('admin/edit_page',{
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        })
    }
    else
    {
        if (id.match(/^[0-9a-fA-F]{24}$/))
        {
            Page.findOne({slug: slug, _id:{'$ne':id}}, function(error, page){
                if(page)
                {
                    req.flash('danger','Page slug exists, choose another one')
                    res.render('admin/edit_page',{
                        title: title,
                        slug: slug,
                        content: content,
                        id: id
                    })
                }
                else 
                {
                    
                    Page.findById(id, function(error,page){
                        if(error)
                        {
                            return console.log(error);
                        }
                        page.title = title;
                        page.slug = slug;
                        page.content = content;

                        page.save((error)=>{
                            if(error)
                            {
                                return console.log(error);
                            }
                            Page.find({}).sort({sorting: 1}).exec((error, pages)=>{
                                if(error)
                                {
                                    console.log(error);
                                    
                                }
                                else
                                {
                                    req.app.locals.pages = pages
                                }
                            })
                            req.flash('success','Page Edited')
                            res.redirect('/admin/pages/edit-page/'+ id)
                        });
                    });
                }
                    
                
            });

        

        }

    }

    
});

// GET /admin/pages/delete-page
router.get('/delete-page/:id',isAdmin, (req,res)=>{
    Page.findByIdAndRemove(req.params.id, (error)=>{
        if(error)
        {
            return console.log(error);
        }
        Page.find({}).sort({sorting: 1}).exec((error, pages)=>{
            if(error)
            {
                console.log(error);
                
            }
            else
            {
                req.app.locals.pages = pages
            }
        })
        req.flash('success','Page Deleted')
        res.redirect('/admin/pages/')
    })
})

module.exports = router;