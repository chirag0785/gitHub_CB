// Format date to "day month year" format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

// Categorize commits by their date
function getCommitsCategoryWise(commits) {
    let category = {};
    commits.forEach((c) => {
        let date = formatDate(c.commit.author.date);
        if (!category[date]) {
            category[date] = [];
        }
        category[date].push(c);
    });
    return category;
}

// Fetch commits from the GitHub repository
async function getCommits(username, repo) {
    const response = await axios.get(`https://api.github.com/repos/${username}/${repo}/commits`);
    return response.data;
}

// Main function to fetch data and create the chart
async function main() {
    try {
        let username = document.querySelector('#username').innerText;
        let repo = document.querySelector('#repo').innerText;

        // Initialize month labels and corresponding data array
        const xValues = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        const yValues = new Array(12).fill(0);  // Initialize yValues with 12 zeros
        const barColors = "red";

        // Map month names to their respective indices
        const getMonth = {
            'January': 0,
            'February': 1,
            'March': 2,
            'April': 3,
            'May': 4,
            'June': 5,
            'July': 6,
            'August': 7,
            'September': 8,
            'October': 9,
            'November': 10,
            'December': 11
        };

        // Fetch and process commits data
        const data = await getCommits(username, repo);
        const commits = getCommitsCategoryWise(data);

        for (const key in commits) {
            const str = key.split(' ');
            if (str[2] === '2022') {  // Ensure the year is 2023
                yValues[getMonth[str[1]]] += commits[key].length;
            }
        }

        // Create the bar chart using Chart.js
        new Chart(document.getElementById("myChart"), {
            type: "bar",
            data: {
                labels: xValues,
                datasets: [{
                    backgroundColor: barColors,
                    data: yValues
                }]
            }
        });
    } catch (error) {
        console.error('Error fetching commit data:', error);
    }
}

// Run the main function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', main);
