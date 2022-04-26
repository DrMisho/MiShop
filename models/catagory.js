const mongoose = require('mongoose');

const CatagorySchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
    }
})

const Catagory = module.exports = mongoose.model('Catagory', CatagorySchema);