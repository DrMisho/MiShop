const express = require('express')
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var Product = require('../models/product');
var Category = require('../models/catagory');


// GET /admin/products/
router.get('/',isAdmin, (req,res)=>{
    var count;

    Product.count((error,c)=>{
        count = c;
    })

    Product.find((error, products)=>{
        res.render('admin/products',{
            products: products,
            count: count
        })
    })
})

// GET /admin/products/add-product
router.get('/add-product',isAdmin, (req,res)=>{
    const title = '';
    const desc = '';
    const price = '';
    Category.find((error,categories)=>{

        res.render('admin/add_product',{
            title: title,
            desc: desc,
            categories: categories,
            price: price
        })
    })
    
})

// POST /admin/products/add-product
router.post('/add-product', (req,res)=>{

    if(req.files)
    {
        var imageFile = req.files.image.name;
    }
    else
    {
        var imageFile = ""
    }
    console.log(imageFile);
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an Image').isImage(imageFile);

    const title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;

    var errors = req.validationErrors();
    if(errors)
    {
        Category.find((error,categories)=>{

            res.render('admin/add_product',{
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            })
        })
    }
    else
    {
        Product.findOne({slug: slug}, (error, product)=>{
            if(product)
            {
                req.flash('danger','Product slug exists, choose another one')
                Category.find((error,categories)=>{

                    res.render('admin/add_product',{
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    })
                })
            }
            else 
            {
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    proce: price2,
                    category: category,
                    image: imageFile
                })
                product.save((error)=>{
                    if(error)
                    {
                        return console.log(error);
                    }
                    
                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    if(imageFile != "")
                    {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;
                        productImage.mv(path,(error)=>{
                            return console.log(error)
                        })
                    }

                    req.flash('success','Product Added')
                    res.redirect('/admin/products');
                })
            }
        })

    }

    
})

// GET /admin/products/edit-product
router.get('/edit-product/:id',isAdmin, (req,res)=>{

    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Category.find(function (err, categories) {

        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });

    });
})

// POST /admin/products/add-product
router.post('/edit-product/:id', function(req,res){


    
    if(req.files)
    {
        var imageFile = req.files.image.name;
    }
    else
    {
        var imageFile = ""
    }
    console.log(imageFile);
    
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an Image').isImage(imageFile);

    const title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;
    const pimage = req.body.pimage;
    const id = req.params.id;

    var errors = req.validationErrors();
    if(errors)
    {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id)
    }
    else
    {
        Product.findOne({slug: slug, _id: {'$ne': id}}, (error,p)=>{
            if(error)
            {
                return console.log(error);
            }
            if(p)
            {
                req.flash('danger','Product title exists, chose another')
                res.redirect('/admin/products/edit-product/' + id)
            }
            else
            {
                Product.findById(id, (error,p)=>{
                    if(error)
                    {
                        return console.log(errro);
                    }
                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if(imageFile != "")
                    {
                        p.image = imageFile;
                    }
                    p.save((error)=>{
                        if(error)
                        {
                            return console.log(error);
                        }
                        if(imageFile != "")
                        {
                            if(pimage != "")
                            {
                                fs.remove('public/product_images/'+ id + '/'+ pimage, (error)=>{
                                    if(error)
                                    {
                                        return console.log(error);
                                    }
                                })
                            }
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;
                            productImage.mv(path,(error)=>{
                                return console.log(error)
                        })

                        }
                        req.flash('success','Product Edited')
                        res.redirect('/admin/products/edit-product/' + id)
                    })
                })
            }
        })
    }
});

// POST /admin/products/product-gallery
router.post('/product-gallery/:id', function (req, res) {

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});

// GET /admin/products/delete-image
router.get('/delete-image/:image',isAdmin, (req,res)=>{
    
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbsImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;
    fs.remove(originalImage,(error)=>{
        if(error)
        {
            console.log(error);

        }
        else
        {
            fs.remove(thumbsImage,(error)=>{
                if(error)
                {
                    console.log(error);

                }
                else
                {
                    req.flash('success','image deleted');
                    res.redirect('/admin/products/edit-product/'+ req.query.id);
                }

            })
        }

    })
})

// GET /admin/products/delete-product
router.get('/delete-product/:id',isAdmin, (req,res)=>{
    
    var id = req.params.id;
    var path = 'public/products_images/'+ id;

    fs.remove(path,(error)=>{
        if(error)
        {
            console.log(error);
        }
        else
        {
            Product.findByIdAndRemove(id,(error)=>{
                if(error)
                {
                    console.log(error);
                }
            })
            req.flash('success','product deleted');
            res.redirect('/admin/products');
        }
    })
})

module.exports = router;