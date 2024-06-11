
async function main(){
    let readmeElement = document.getElementById('readme');
    let markdownText = readmeElement.innerText;
    let htmlContent = marked.parse(markdownText);
    const clean = DOMPurify.sanitize(htmlContent);
    readmeElement.innerHTML = clean;
}

document.addEventListener('DOMContentLoaded', main);