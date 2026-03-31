const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        price : {
            type : Number,
            required : true,
            min : 0
        },
        discountPrice : {
            type : Number,
            default : 0
        },
        category : {
            type : String,
            required : true,
            enum : ["Lights", "Wires", "Cables", "Switch", "Plates", "Heaters", "Fans", "Geysers"]
        },
        images : [{
            type : String
        }],
        stock : {
            type : Number,
            default : 1,
            min : 0
        },
        ratings : {
            type : Number,
            default : 0
        },
        numReviews : {
            type : Number,
            default : 0
        },  

        seller : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true
        },

        isFeatured : {
            type : Boolean,
            default : false 
        },
        tags : [{
            type : String
        }]
    },
    {
        timestamps : true
    }
);


productSchema.virtual("discountPercent").get(function() {
    if (!this.discountPrice || this.discountPrice >= this.price) return 0;
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);