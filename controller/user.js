const axios=require('axios');
const {getCommitsCategoryWise,getIssuesCategoryWise,compByForks,compByIssues,compByName,compByStars}=require('../utils/utils');
const User=require('../models/user');
const redis=require('redis');
var base64 = require('base-64');
var utf8 = require('utf8');
let seconds=3600;
let client;
async function connectToRedis(){
    try{
        client = redis.createClient({
            host: '127.0.0.1',
            port: 6379
        });
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
    }catch(err){
        console.log('Error in redis');
    }
}
module.exports.getHome=async (req,res,next)=>{
    if(req.isAuthenticated()){
        return res.redirect('/profile');
    }
    res.render('home',
        {isLoggedIn:req.isAuthenticated()}
    );
}

module.exports.getUser=async (req,res,next)=>{
    let {username}=req.query;
    try{
        if(client===undefined){
            connectToRedis();
        }
        //check in cache first
        let cachedUser=await client.get(`User_${username}`);
        let user;
        if(cachedUser){
            user=JSON.parse(cachedUser);
        }
        else{
            user=await axios.get(`https://api.github.com/users/${username}`);
            user=user.data;
            await client.set(`User_${username}`,JSON.stringify(user),{EX: seconds,NX: true});
        }
        if(req.isAuthenticated()){
            let user=await User.findOne({username:req.user.username});
            if(user.searchHistory.indexOf(username)==-1){
                user.searchHistory.unshift(username);
                let size=user.searchHistory.length;
                if(size>6){
                    user.searchHistory.splice(6,size-6);
                }
            }
            await user.save();
        }
        console.log(user);
        let cachedRepo=await client.get(`Repos_${username}`);
        let repos;
        if(cachedRepo){
            repos=JSON.parse(cachedRepo);
        }
        else{
            repos=await axios.get(`https://api.github.com/users/${username}/repos`);
            repos=repos.data;
            await client.set(`Repos_${username}`,JSON.stringify(repos),{EX: seconds,NX: true});
        }
        res.render('repos',{
            repos:repos,
            user:user
        })
    }catch(err){
        res.send(err);
    }
}

module.exports.getRepo=async (req,res,next)=>{
    let {username,repo}=req.params;
    try{
        if(client===undefined){
            connectToRedis();
        }
        let readmeCache=await client.get(`readme_${username}_${repo}`);
        let readme;
        if(readmeCache){
            readme=JSON.parse(readmeCache);
        }
        else{
            const { data } = await axios.get(`https://api.github.com/repos/${username}/${repo}/contents`);
            const readmeFile = data.find(d => d.name.toLowerCase() === 'readme.md');
            if (readmeFile) {
                const readmeResponse = await axios.get(readmeFile.url);
                readme = readmeResponse.data;
                await client.set(`readme_${username}_${repo}`, JSON.stringify(readme), { EX: seconds, NX: true });
            }
        }
        let commits;
        let cachedCommit=await client.get(`commits_${username}_${repo}`);
        if(cachedCommit){
            commits=JSON.parse(cachedCommit);
        }
        else{
            commits=await axios.get(`https://api.github.com/repos/${username}/${repo}/commits`);
            commits=commits.data;
            await client.set(`commits_${username}_${repo}`,JSON.stringify(commits),{EX: seconds,NX: true});
        }


        let cachedIssues=await client.get(`issues${username}_${repo}`);
        let issues;
        if(cachedIssues){
            issues=JSON.parse(cachedIssues);
        }
        else{
            issues=await axios.get(`https://api.github.com/repos/${username}/${repo}/issues`);
            issues=issues.data;
            await client.set(`issues_${username}_${repo}`,JSON.stringify(issues),{EX: seconds,NX: true});
        }

        var bytes = base64.decode(readme.content);
        var text = utf8.decode(bytes);
        console.log(text);
        res.render('repo_page',{
            repo,
            username,
            commits:getCommitsCategoryWise(commits.slice(0,10)),
            issues:getIssuesCategoryWise(issues),
            readme:text
        })
    }catch(err){
        res.send(err);
    }
}

module.exports.getContributors=async (req,res,next)=>{
    let {username,repo}=req.params;
    try{
        if(client===undefined){
            connectToRedis();
        }
        let cachedContributors=await client.get(`contributors_${username}_${repo}`);
        let contributors;
        if(cachedContributors){
            contributors=JSON.parse(cachedContributors);
        }
        else{
            contributors=await axios.get(`https://api.github.com/repos/${username}/${repo}/contributors`);
            contributors=contributors.data;
            await client.set(`contributors_${username}_${repo}`,JSON.stringify(contributors),{EX: seconds,NX: true});
        }
        res.render('contributor',{
            contributors
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
    try{
        let user=await User.findOne({username:req.user.username});
        let userSearched=user.searchHistory;
    res.render('profile',{
        user:req.user,
        userSearched:userSearched
    });
    }catch(err){
        res.send(err);
    }
}

module.exports.getRepoSortByStars=async (req,res,next)=>{
    let {username}=req.params;
    try{
        if(client===undefined){
            connectToRedis();
        }
        let cachedUser=await client.get(`User_${username}`);
        let user;
        if(cachedUser){
            user=JSON.parse(cachedUser);
        }
        else{
            user=await axios.get(`https://api.github.com/users/${username}`);
            user=user.data;
            await client.set(`User_${username}`,JSON.stringify(user),{EX: seconds,NX: true});
        }
        let cachedRepo=await client.get(`Repos_${username}`);
        let repos;
        if(cachedRepo){
            repos=JSON.parse(cachedRepo);
        }
        else{
            repos=await axios.get(`https://api.github.com/users/${username}/repos`);
            repos=repos.data;
            await client.set(`Repos_${username}`,JSON.stringify(repos),{EX: seconds,NX: true});
        }
        repos.sort(compByStars);
        res.render('repos',{
            repos,
            user
        })
    }catch(err){
        res.send(err);
    }   
}
module.exports.getRepoSortByForks=async (req,res,next)=>{
    let {username}=req.params;
    try{
        if(client===undefined){
            connectToRedis();
        }
        let cachedUser=await client.get(`User_${username}`);
        let user;
        if(cachedUser){
            user=JSON.parse(cachedUser);
        }
        else{
            user=await axios.get(`https://api.github.com/users/${username}`);
            user=user.data;
            await client.set(`User_${username}`,JSON.stringify(user),{EX: seconds,NX: true});
        }
        let cachedRepo=await client.get(`Repos_${username}`);
        let repos;
        if(cachedRepo){
            repos=JSON.parse(cachedRepo);
        }
        else{
            repos=await axios.get(`https://api.github.com/users/${username}/repos`);
            repos=repos.data;
            await client.set(`Repos_${username}`,JSON.stringify(repos),{EX: seconds,NX: true});
        }
        repos.sort(compByForks);
        res.render('repos',{
            repos,
            user
        })
    }catch(err){
        res.send(err);
    }   
}
module.exports.getRepoSortByIssues=async (req,res,next)=>{
    let {username}=req.params;
    try{
        if(client===undefined){
            connectToRedis();
        }
        let cachedUser=await client.get(`User_${username}`);
        let user;
        if(cachedUser){
            user=JSON.parse(cachedUser);
        }
        else{
            user=await axios.get(`https://api.github.com/users/${username}`);
            user=user.data;
            await client.set(`User_${username}`,JSON.stringify(user),{EX: seconds,NX: true});
        }
        let cachedRepo=await client.get(`Repos_${username}`);
        let repos;
        if(cachedRepo){
            repos=JSON.parse(cachedRepo);
        }
        else{
            repos=await axios.get(`https://api.github.com/users/${username}/repos`);
            repos=repos.data;
            await client.set(`Repos_${username}`,JSON.stringify(repos),{EX: seconds,NX: true});
        }
        repos.sort(compByIssues);
        res.render('repos',{
            repos,
            user
        })
    }catch(err){
        res.send(err);
    }   
}
module.exports.getRepoSortByName=async (req,res,next)=>{
    let {username}=req.params;
    try{
        if(client===undefined){
            connectToRedis();
        }
        let cachedUser=await client.get(`User_${username}`);
        let user;
        if(cachedUser){
            user=JSON.parse(cachedUser);
        }
        else{
            user=await axios.get(`https://api.github.com/users/${username}`);
            user=user.data;
            await client.set(`User_${username}`,JSON.stringify(user),{EX: seconds,NX: true});
        }
        let cachedRepo=await client.get(`Repos_${username}`);
        let repos;
        if(cachedRepo){
            repos=JSON.parse(cachedRepo);
        }
        else{
            repos=await axios.get(`https://api.github.com/users/${username}/repos`);
            repos=repos.data;
            await client.set(`Repos_${username}`,JSON.stringify(repos),{EX: seconds,NX: true});
        }
        repos.sort(compByName);
        res.render('repos',{
            repos,
            user
        })
    }catch(err){
        res.send(err);
    }   
}