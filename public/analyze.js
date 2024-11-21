(async () => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');

    if (!url) {
        document.body.innerHTML = '<p>Error: No URL provided for analysis.</p>';
        return;
    }

    const response = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(url)}`
    });

    const data = await response.json();
    const resultsContainer = document.getElementById('analysisResults');
    resultsContainer.innerHTML = `
        <li><strong>Title:</strong> ${data.title}</li>
        <li><strong>Description:</strong> ${data.description}</li>
        <li><strong>H1:</strong> ${data.h1}</li>
    `;
})();
