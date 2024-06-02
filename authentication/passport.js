const passport=require('passport');
const GitHubStrategy=require('passport-github2');
const User=require('../models/user');
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3333/auth/github/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try{
        console.log(profile);
        let user=await User.findOne({githubId:profile.id});
        if(user){
            return done(null,user);
        }
        
        user=await User.create({githubId:profile.id});
        return done(null,user);
    }catch(err){
        done(err);
    }

    // User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  
  passport.deserializeUser(async function(id, done) {
    try{
        let user=await User.findOne({_id:id});
        if(!user) return done(null,false);
        return done(null,user);
    }catch(err){
        done(err);
    }
    // User.findById(id, function (err, user) {
    //   done(err, user);
    // });
  });
module.exports=passport;