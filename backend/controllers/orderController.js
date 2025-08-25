import order from "../models/order.js";
import Order from "../models/order.js";

export const createOrder = async (req, res) => {
  try{
    const{
      customerName,
      customerPhone,
      customerEmail,
      items,
      total,
      paymentMethod,
    } = req.body;

    console.log("Incoming Order:", req.body);

    if (!customerName || !customerPhone || !total || !paymentMethod){
      return res.status(400).json({
        error: "missing required fields",
        required: ["customerName", "customerPhone", "total", "paymentMethod"],
        received: {customerName, customerPhone, total, paymentMethod},
      });
    }

    const newOrder = new Order({
      customerName,
      customerPhone,
      customerEmail,
      items,
      total,
      paymentMethod,
    });
    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });
  }catch(err){
    console.error("Order creation failed", err.message);

    if (err.name === "Validation Error"){
      return res.status(400).json({
        error: "Validation Failed",
        details: err.error,
      });
    }
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

export const getOrders = async (req, res) => {
  try{
    const orders = await Order.find().sort({createdAt: -1});
    res.status(200).json(orders);
  }catch (err){
    console.error("error fetching orders:", err.message);
    res.status(500).json({error: 'Failed to fetch orders'});
  }
};