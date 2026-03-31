const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : [true, "Name is required"],
            trim : true,
            minlength : 2,
            maxlength : 50
        },
        email : {
            type : String,
            required : [true, "Email is required"],
    },   
       password : {
            type : String,
            required : [true, "Password is required"],
            minlength : 6,
            select : false
        },
        role : {
            type : String,
            enum : ["seller", "buyer"],
            default : "buyer"
        },
        storeName : { type : String, default : "" },
        storeDescription : { type : String, default : "" }, 
        address : {
            street : { type : String, default : "" },
            city : { type : String, default : "" },
            state : { type : String, default : "" },
            pinCode : { type : String, default : "" },
            country : { type : String, default : "" }
        },
        avatar : { type : String, default : "" },
        isVerified : { type : Boolean, default : false },
        paymentMethods : [
            {
                type : {
                    type : String,
                    enum : ["card", "upi"],
                    required : true
                },
                // For Card
                cardNumber : { type : String, default : "" },
                cardholderName : { type : String, default : "" },
                expiryMonth : { type : String, default : "" },
                expiryYear : { type : String, default : "" },
                cvv : { type : String, default : "" },
                isDefault : { type : Boolean, default : false },
                // For UPI
                upiId : { type : String, default : "" },
                createdAt : { type : Date, default : Date.now }
            }
        ],
        cart : [
            {
                product : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "Product",
                    required : true
                },
                quantity : {
                    type : Number,
                    required : true,
                    min : 1,
                    default : 1
                }
            }
        ]

    },

    {
        timestamps : true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);