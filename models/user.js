let mongoose=require('mongoose');
let {Schema}=mongoose;
let userSchema=new Schema({
    username:{
        type:String,
    },
    password:String,
    githubId:String,
})

module.exports=mongoose.model('users',userSchema)