document.getElementById('searchForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const query = document.getElementById('query').value;
    const response = await fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `query=${encodeURIComponent(query)}`
    });

    const data = await response.json();
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (data.results) {
        data.results.forEach(result => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${result.title}</strong>
                <button onclick="analyzeSite('${result.url}')">Analyze</button>
            `;
            resultsContainer.appendChild(li);
        });
    }
});

function analyzeSite(url) {
    window.open(`/analyze?url=${encodeURIComponent(url)}`, '_blank');
}
