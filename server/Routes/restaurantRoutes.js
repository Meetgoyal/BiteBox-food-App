const express = require('express');
const router = express.Router();
const restaurant = require('../Models/restaurantModel');
const menu = require('../Models/menuItemModel');
router.post('/addRest', async (req, res) => {
    try {
        const restaurantData = req.body.restaurantData;
        const ownerData = req.body.ownerData;
        const isExist = await restaurant.findOne({ email: restaurantData.email });
        if (isExist) {
            res.send({
                success: false,
                message: "restaurant already registered!"
            })
        }
        else {
            var newRestaurant = await restaurant.create({
                ...restaurantData,
                owner: ownerData._id
            });
            newRestaurant = await newRestaurant.populate("owner");
            if (newRestaurant) {
                res.send({
                    restaurant: newRestaurant._id,
                    success: true,
                    message: "restaurant successfully registered"
                })
            }
            else {
                res.send({
                    success: false,
                    message: "restaurant cant able to"
                })
            }
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/fetchRestaurant', async (req, res) => {
    try {
        const resId = req.query.id;
        const restaurantData = await restaurant.findOne({ _id: resId });
        if (restaurantData) {
            res.send({
                success: true,
                resData: restaurantData
            })
        }
        else {
            res.send({
                success: false,
                message: "error"
            })
        }
    } catch (error) {
        console.log(error);
    }
})





router.post('/addItem', async (req, res) => {
    try {
        const { data: menuItem, resId } = req.body;
        const restaurantData = await restaurant.findById(resId);
        if (!restaurantData) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        const isExist = await menu.findOne({
            name: menuItem.name,
            restaurant: resId
        });

        if (isExist) {
            return res.status(409).json({
                success: false,
                message: "Menu item with this name already exists in your restaurant"
            });
        }

        var newItem = await menu.create({
            ...menuItem,
            restaurant: resId
        });
        newItem = await newItem.populate("restaurant");
        await restaurant.findByIdAndUpdate(resId, {
            $push: { menu: newItem._id }
        });

        return res.status(201).json({
            success: true,
            message: "Menu item added successfully",
            menuItem: newItem,
            restaurant: {
                _id: restaurant._id,
                name: restaurant.name
            }
        });
    } catch (error) {
        console.log(error);
    }
})

router.get('/menu', async (req, res) => {
    try {
        const resId = req.query.id;
        const menuData = await menu.find({ restaurant: resId });
        if (menuData) {
            res.send({
                success: true,
                menu: menuData
            })
        }
        else {
            res.semd({
                success: false,
                message: "not found"
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/fetchallRestaurants', async (req, res) => {
    try {
        const owner_id = req.query.id;
        const allRestaurants = await restaurant.find({ owner: owner_id });
        if (allRestaurants) {
            res.send({
                success: true,
                data: allRestaurants
            })
        }
        else {
            res.send({
                success: false,
                message: "data not found"
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/deleteRestaurant', async (req, res) => {
    try {
        const id = req.body.id;
        const done = await restaurant.deleteOne({ _id: id });
        if (done) {
            res.send({
                success: true,
                message: "Successfully Deleted!"
            })
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;