const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/allProduct', async (req, res) =>{
    try {
        let ProductData = await Product.find().select("-__v");
        return res.status(200).json({dataAllProduct: ProductData});
    } catch (error) {
        return res.status(400).json({ msg: "có lỗi xảy ra"});
    }
});

router.get('/productDetail/:id', async (req, res) => {
    try {
        let ProductDetailData = await Product.findById(req.params.id);
        return res.status(200).json({dataProductDetail: ProductDetailData});
    } catch (error) {
        return res.status(400).json({ msg: "có lỗi xảy ra"});
    }
});

router.get('/productByCate', async (req, res) => {
    try {
        let ProductByCateData = await Product.find({cateId: req.query.cateId});
        return res.status(200).json({dataProductByCate: ProductByCateData});
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: error});
        
    }
});

module.exports = router;