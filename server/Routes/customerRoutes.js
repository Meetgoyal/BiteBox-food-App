const express = require('express')
const router = express.Router();
const restaurant = require('../Models/restaurantModel');
const order = require('../Models/OrderModel');
const cart = require('../Models/cartModel');
const complaint = require('../Models/complaintModel');
router.post('/fetchRestaurants', async (req, res) => {

    try {
        const { city, state, country } = req.body;
        const query = {};
        if (city) query['address.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
        if (state) query['address.state'] = { $regex: new RegExp(`^${state}$`, 'i') };
        if (country) query['address.country'] = { $regex: new RegExp(`^${country}$`, 'i') };
        const restaurantsData = await restaurant.find(query);

        if (restaurantsData.length > 0) {
            res.send({
                data: restaurantsData,
                success: true
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/review', async (req, res) => {
    try {
        const { customerId, resId, rating, comment } = req.body;

        const currRes = await restaurant.findById(resId);
        if (!currRes) {
            return res.status(404).send({
                success: false,
                message: "Restaurant not found"
            });
        }

        const newReview = {
            customer: customerId,
            comment,
            rating
        };

        currRes.reviews.push(newReview);
        await currRes.save();
        const totalRating = currRes.reviews.reduce((sum, review) => sum + review.rating, 0);
        currRes.rating = Math.floor(totalRating / currRes.reviews.length);

        await currRes.save();


        const populatedRestaurant = await restaurant.findById(resId).populate({
            path: 'reviews.customer',
            select: 'name email'
        });

        res.status(200).send({
            success: true,
            message: "Review added successfully",
            data: populatedRestaurant
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "An error occurred while adding the review",
            error: error.message
        });
    }
});

router.post('/createCart', async (req, res) => {
    try {
        const { userId, items } = req.body;
        let isExistCart = await cart.findOne({ user: userId });

        if (!isExistCart) {
            const newCart = new cart({
                user: userId,
                items: items.map(newItem => ({
                    restaurant: newItem.restaurant,
                    product: newItem._id,
                    quantity: newItem.quantity
                }))
            });

            await newCart.save();
            const populatedCart = await cart.findById(newCart._id)
                .populate('user')
                .populate('items.product')
                .populate('items.restaurant').exec();

            res.send({
                success: true,
                cart: populatedCart,
                message: "New cart created!"
            });
        } else {
            items.forEach(newItem => {
                const existingItem = isExistCart.items.find(item =>
                    item.product.toString() === newItem._id &&
                    item.restaurant.toString() === newItem.restaurant
                );

                if (existingItem) {
                    existingItem.quantity = Number(existingItem.quantity) + Number(newItem.quantity);
                } else {
                    isExistCart.items.push({
                        restaurant: newItem.restaurant,
                        product: newItem._id,
                        quantity: newItem.quantity
                    });
                }
            });

            await isExistCart.save();
            const populatedCart = await cart.findById(isExistCart._id)
                .populate('user')
                .populate('items.product')
                .populate('items.restaurant').exec();

            res.send({
                success: true,
                cart: populatedCart,
                message: "Cart updated successfully!"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: "Server error while creating/updating cart",
            error: error.message
        });
    }
});

router.get('/fetchCart', async (req, res) => {
    try {
        const cartdata = await cart.findOne({ user: req.query.id }).populate('user')
            .populate('items.product')
            .populate('items.restaurant')
            .exec();
        if (cartdata) {
            res.send({
                success: true,
                cart: cartdata
            })
        }
        else {
            res.send({
                success: false,
                cart: null
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/updateCart', async (req, res) => {
    try {
        const { userId, newCart } = req.body;

        // Validate input
        if (!userId || !newCart) {
            return res.status(400).json({
                success: false,
                message: "Missing userId or newCart in request"
            });
        }

        const updatedCart = await cart.findOneAndUpdate(
            { user: userId },
            {
                items: newCart.items.map(item => ({
                    product: item.product._id || item.product,
                    restaurant: item.restaurant._id || item.restaurant,
                    quantity: item.quantity
                }))
            },
            {
                new: true, // Return the updated document
                upsert: true // Create if doesn't exist
            }
        )
            .populate('items.product') // Populate product details
            .populate('items.restaurant'); // Populate restaurant details

        res.send({
            success: true,
            cart: updatedCart,
            message: "Cart updated successfully"
        });

    } catch (error) {
        console.error("Cart update error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update cart",
            error: error.message
        });
    }
});

router.post('/createOrder', async (req, res) => {
    try {
        const { customer, cartItems, totalAmount, paymentMethod, deliveryAddress } = req.body;
        const currOrder = new order({
            customer: customer,
            items: cartItems,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            deliveryAddress: deliveryAddress
        });
        await currOrder.save();
        if (currOrder) {
            res.send({
                success: true,
                orderData: currOrder,
                message: "Order Placed Sucessfully!"
            })
        }
        else {
            res.send({
                success: false,
                message: "Order not Placed Sucessfully!"

            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/fetchOrder', async (req, res) => {
    try {
        const { orderId } = req.query;
        const orderData = await order.findOne({ _id: orderId })
            .populate("customer")
            .populate('items.product') // Populate product details
            .populate('items.restaurant');
        ;
        if (orderData) {
            res.send({
                success: true,
                order: orderData
            })
        }
        else {
            res.send({
                success: false,
                order: orderData
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/deleteCart', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id);
        const dele = await cart.findByIdAndDelete(id);
        console.log(dele);
        if (dele) {
            res.send({
                success: true
            })
        }
    } catch (error) {
        console.log(error);
    }

})

router.get('/getOrders',async(req,res)=>{
    try {
        const orders = await order.find({customer : req.query.id});
        console.log(orders);
        if(orders){
            res.send({
                success : true,
                orders : orders
            })
        }
        else{
            res.send({
                success : false
            })
        }
    } catch (error) {
        console.lof(error);
    }
})

router.post('/complaint',async(req,res)=>{
    try {
        const { name , email , message } = req.body.data;
        const complaintData = new complaint({
            name,
            email,
            message
        });
        await complaintData.save();
        if(complaintData){
            res.send({
                success : true
            })
        }
        else{
            res.send({
                success : false
            })
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;