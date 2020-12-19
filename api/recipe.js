const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe');

router.get('/all', async (req, res) =>{
    try {
        let RecipeData = await Recipe.find().select("-__v");
        return res.status(200).json({allRecipe: RecipeData});
    } catch (error) {
        return res.status(400).json({ msg: "có lỗi xảy ra"});
    }
});

router.get('/detail/:id', async (req, res) => {
    try {
        let RecipeDetail = await Recipe.findById(req.params.id);
        return res.status(200).json({detailRecipe: RecipeDetail});
    } catch (error) {
        return res.status(400).json({ msg: "có lỗi xảy ra"});
    }
});

module.exports = router;