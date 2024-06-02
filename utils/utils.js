
function formatDate(dateString) {
    const date = new Date(dateString);

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}
module.exports.getCommitsCategoryWise=function(commits){
    let category={};
    commits.forEach((c)=>{
        let date=formatDate(c.commit.author.date);
        if(!category[date]){
            category[date]=[];
        }
        category[date].push(c);
    })
    return category;
}

module.exports.getIssuesCategoryWise=function(issues){
    let category={};
    issues.forEach((i)=>{
        let date=formatDate(i.created_at);
        if(!category[date]){
            category[date]=[];
        }
        category[date].push(i);
    })
    return category;
}

module.exports.compByStars=function(r1,r2){
    return (r1.stargazers_count - r2.stargazers_count);
}
module.exports.compByForks=function (r1,r2){
    return (r1.forks - r2.forks);
}

module.exports.compByIssues=function (r1,r2){
    return (r1.open_issues-r2.open_issues);
}
module.exports.compByName=function (r1,r2){
    return (r1.name - r2.name);
}