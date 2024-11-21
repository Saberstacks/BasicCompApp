const http = require('http');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const PORT = 3000;

http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        serveFile(res, './public/index.html', 'text/html');
    } else if (req.url.startsWith('/search') && req.method === 'POST') {
        handleSearch(req, res);
    } else if (req.url.startsWith('/analyze') && req.method === 'POST') {
        handleAnalyze(req, res);
    } else if (req.url.startsWith('/public') && req.method === 'GET') {
        serveStaticFile(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
}).listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Serve static files
function serveStaticFile(req, res) {
    const filePath = path.join(__dirname, req.url);
    const ext = path.extname(filePath);
    const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript'
    }[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

// Serve HTML files
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

// Handle search
async function handleSearch(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const query = new URLSearchParams(body).get('query');
        if (!query) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Query is required' }));
        }

        const mockResults = [
            { title: 'Plumber in Miami', url: 'https://example.com/plumber-miami' },
            { title: 'Best Plumbing Services', url: 'https://example.com/best-plumbing' },
            { title: 'Affordable Plumbing Miami', url: 'https://example.com/affordable-plumbing' }
        ];

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ results: mockResults }));
    });
}

// Handle analyze
async function handleAnalyze(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const url = new URLSearchParams(body).get('url');
        if (!url) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'URL is required' }));
        }

        try {
            const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const html = await response.text();
            const $ = cheerio.load(html);

            const metadata = {
                title: $('title').text() || 'N/A',
                description: $('meta[name="description"]').attr('content') || 'N/A',
                h1: $('h1').text() || 'N/A'
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(metadata));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to analyze website' }));
        }
    });
}
