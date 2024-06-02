const axios=require('axios');
const {getCommitsCategoryWise,getIssuesCategoryWise,compByForks,compByIssues,compByName,compByStars}=require('../utils/utils');
module.exports.getHome=async (req,res,next)=>{

    res.render('home',
        {isLoggedIn:req.isAuthenticated()}
    );
}

module.exports.getUser=async (req,res,next)=>{
    let {username}=req.query;
    try{
        let user=await axios.get(`https://api.github.com/users/${username}`);
        user=user.data;
        console.log(user);
        let {data}=await axios.get(`https://api.github.com/users/${username}/repos`);
        res.render('repos',{
            repos:data,
            user:user
        })
    }catch(err){
        res.send(err);
    }
}

module.exports.getRepo=async (req,res,next)=>{
    let {username,repo}=req.params;
    try{
        let commits=await axios.get(`https://api.github.com/repos/${username}/${repo}/commits`);
        commits=commits.data;

        let issues=await axios.get(`https://api.github.com/repos/${username}/${repo}/issues`);
        issues=issues.data;
        res.render('repo_page',{
            repo,
            username,
            commits:getCommitsCategoryWise(commits.slice(0,10)),
            issues:getIssuesCategoryWise(issues),
        })
    }catch(err){
        res.send(err);
    }
}

module.exports.getContributors=async (req,res,next)=>{
    let {username,repo}=req.params;
    try{
        let {data}=await axios.get(`https://api.github.com/repos/${username}/${repo}/contributors`);
        res.render('contributor',{
            contributors:data
        });
    }catch(err){
        res.send(err);
    }
}

module.exports.getCommitActivity=async (req,res,next)=>{
    let {username,repo}=req.params;
    try{
        
        res.render('commit_activity',{
            username,
            repo
        })
    }catch(err){
        res.send(err);
    }
}

module.exports.getProfile=async (req,res,next)=>{
    if(!req.isAuthenticated()) return res.redirect('/');
    res.render('profile',{
        user:req.user
    });
}

module.exports.getRepoSortByStars=async (req,res,next)=>{
    let {username}=req.params;
    try{
        let user=await axios.get(`https://api.github.com/users/${username}`);
        user=user.data;
        let {data}=await axios.get(`https://api.github.com/users/${username}/repos`);
        data.sort(compByStars);
        res.render('repos',{
            repos:data,
            user
        })
    }catch(err){

    }   
}
module.exports.getRepoSortByForks=async (req,res,next)=>{
    let {username}=req.params;
    try{
        let user=await axios.get(`https://api.github.com/users/${username}`);
        user=user.data;
        let {data}=await axios.get(`https://api.github.com/users/${username}/repos`);
        data.sort(compByForks);
        res.render('repos',{
            repos:data,
            user
        })
    }catch(err){

    }   
}
module.exports.getRepoSortByIssues=async (req,res,next)=>{
    let {username}=req.params;
    try{
        let user=await axios.get(`https://api.github.com/users/${username}`);
        user=user.data;
        let {data}=await axios.get(`https://api.github.com/users/${username}/repos`);
        data.sort(compByIssues);
        res.render('repos',{
            repos:data,
            user
        })
    }catch(err){

    }   
}
module.exports.getRepoSortByName=async (req,res,next)=>{
    let {username}=req.params;
    try{
        let user=await axios.get(`https://api.github.com/users/${username}`);
        user=user.data;
        let {data}=await axios.get(`https://api.github.com/users/${username}/repos`);
        data.sort(compByName);
        res.render('repos',{
            repos:data,
            user
        })
    }catch(err){

    }   
}