let inp = document.querySelector('form input');
let searchBox = document.querySelector('.search-sugg');
let timeout = null;

inp.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(getSuggestions, 300);
});

async function getSuggestions() {
    let username = inp.value;
    if (username.length > 0) {
        searchBox.innerHTML = '';
        try {
            console.log('api called');
            let response = await axios.get(`https://api.github.com/search/users?q=${username}`);
            let users = response.data.items.slice(0, 10);
            users.forEach((u) => {
                let li = document.createElement('li');
                li.innerHTML = `🔍 <a href="/search?username=${u.login}">${u.login}</a>`;
                searchBox.appendChild(li);
            });
            searchBox.style.visibility = 'visible';
        } catch (err) {
            searchBox.innerHTML = 'No suggestions right now';
            searchBox.style.visibility = 'visible';
        }
    } else {
        searchBox.style.visibility = 'hidden';
    }
}
