let mongoose=require('mongoose');
let {Schema}=mongoose;
let userSchema=new Schema({
    username:{
        type:String,
    },
    password:String,
    githubId:String,
    githubImg:String,
    searchHistory: {
        type: [String],
        default: [] 
    }
})

module.exports=mongoose.model('users',userSchema)