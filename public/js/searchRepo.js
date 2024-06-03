let btn=document.querySelector('.btn');
btn.addEventListener('click',(ev)=>{
    let inp=document.querySelector('input');
    let repoName=inp.value;
    if(repoName.length>0){
        let repo=document.querySelectorAll('.repo');
        let ifFound=false;
        repo.forEach((r)=>{
            if(r.firstElementChild.innerText===repoName){
                r.firstElementChild.style.backgroundColor='yellow';
                r.scrollIntoView();
                ifFound=true;
            }
            else{
                r.firstElementChild.style.backgroundColor='';
            }
        })
        inp.value='';
        if(!ifFound){
            alert('Repo not found');
        }
    }
})