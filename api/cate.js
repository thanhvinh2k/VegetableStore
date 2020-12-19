const express = require('express');
const router = express.Router();
const Cate = require('../models/cate');

router.get('/allCate', async (req, res) =>{
    try {
        let CateData = await Cate.find().select("-_id -__v");
        return res.status(200).json({dataAllCate: CateData});
    } catch (error) {
        return res.status(400).json({ msg: "có lỗi xảy ra"});
    }
});

router.get('/cateDetail/:id', async (req, res) => {
    try {
        let CateDetailData = await Cate.findById(req.params.id);
        return res.status(200).json({dataCateDetail: CateDetailData});
    } catch (error) {
        return res.status(400).json({ msg: "có lỗi xảy ra"});
    }
});

module.exports = router;