const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product : { type: mongoose.Schema.Types.ObjectId ,ref : "product" ,  required: true ,  },
        title : {type : String , required:true},
        image : {type : String , required : true},
        price : {type : Number,required : true},
        quantity : {type : Number , required : true , min : 1}
    },
    {
    timestamps : true
})

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true
        },
        items : [orderItemSchema],

        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,

        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'UPI', 'NetBanking'],
            default: 'UPI',
        },
        orderStatus: {
            type: String,
            enum: ["Pending ", "Delivered ", "Out For Delivery"],
            default: "Pending"
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Processing", "Paid", "Failed"],
            default: "Processing"
        },
        totalPrice: {
            type: Number,
            required: true
        },
        shippingAddress: {
            type: String
        },
        returnStatus: {
            type: String,
            enum: ["Not Requested", "Requested", "Approved", "Returned", "Rejected"],
            default: "Not Requested"
        },
        returnReason: {
            type: String
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("order", orderSchema);