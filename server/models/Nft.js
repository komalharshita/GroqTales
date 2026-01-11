const { timeStamp } = require('console');
const mongoose = require('mongoose');

const NftSchema = new mongoose.Schema(
    {
        storyId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Story',
            required:[true,"Please provide associated story ID"],
        },
        storyHash:{
            type:String,
            required:true,
            validate:{
                validator:function(v){
                    return /^0x([A-Fa-f0-9]{64})$/.test(v);
                },
                message:'Invalid Keccak256 hash format'
            }
        },      
        metadataURI:{
            type:String,
            required:[true,"Please provide metadata URI"],
            trim:true,
        },
        metadata:{
            type:Object,
            required:[true,"Please provide metadata"],
        },
        mintedAt:{
            type:Date,
            required:true,
            default:Date.now,
        },
        mintedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:[true,"Please provide current owner"],
        },
        price:{
            type:Number,
            default:0,  
        },
        isListed:{
            type:Boolean,
            default:false,
        },
    },
    { timeStamps:true }
);

const Nft = mongoose.model('Nft',NftSchema);

module.exports = Nft;