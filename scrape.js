const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { URL } = require('url');

// Configuration
const baseUrl = 'https://www.nacka.se/nyheter-start/'; // Replace with the website you want to scrape
const visitedUrls = new Set(); // Track visited URLs to avoid duplicates
const allContent = []; // Store all scraped content

// Function to fetch HTML content of a page
async function fetchPage(url) {
    try {
        const { data: html } = await axios.get(url);
        return html;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
}

// Function to extract links from a page
function extractLinks(html, baseUrl) {
    const $ = cheerio.load(html);
    const links = [];

    $('a').each((i, element) => {
        const href = $(element).attr('href');
        if (href) {
            const absoluteUrl = new URL(href, baseUrl).href; // Convert relative URLs to absolute
            links.push(absoluteUrl);
        }
    });

    return links;
}

function cleanText(text) {
    return text
        .replace(/\t+/g, ' ')   // remove tabs (\t → space)
        .replace('\n', ' ')   // removes \n from text
        .replace(/[^\x00-\x7F]+/g, '') // remove non-UTF8/stray chars (optional)
        .trim();
}

// Function to extract content from a page
function extractContent(html) {
    const $ = cheerio.load(html);
    const title = $('title').text();
    const headings = [];
    const paragraphs = [];

    // Extract headings (h1, h2, h3)
    $('h1, h2, h3').each((i, element) => {
        headings.push(cleanText($(element).text()));
    });

    // Extract paragraphs
    $('p').each((i, element) => {
        paragraphs.push(cleanText($(element).text()));
    });

    return {
        title,
        headings,
        paragraphs,
    };
}


// exclude irrelevant file paths: 
const excludedPaths = ['admin', 'login', 'tag', 'category', 'search'];
const excludedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico']; 

function isRelevantUrl(url) {
    return !excludedPaths.some(path => url.includes(path));
}
function isImageUrl(url) {
    // Remove query parameters and fragments
    const cleanUrl = url.split('?')[0].split('#')[0];
    return excludedExtensions.some(ext => cleanUrl.toLowerCase().endsWith(ext));
}

// Recursive function to crawl the website
const maxPages = 50; // Limit to 50 pages
let pageCount = 0;

// Add a list of restricted URLs
const restrictedUrls = [
    'https://www.nacka.se/nyheter-start/#content',
    'https://www.nacka.se/nyheter-start/#header',
    'https://www.nacka.se/nyheter-start/?page'
    // Add more full URLs here
];

// Check if a URL is restricted
function isRestrictedUrl(url) {
    return restrictedUrls.some(restricted => url.startsWith(restricted));
}




async function crawl(url, depth = 0, maxDepth = 3) {
    if (visitedUrls.has(url) || depth > maxDepth || pageCount >= maxPages || !isRelevantUrl(url) || isImageUrl(url) ||
    isRestrictedUrl(url)) return;
    visitedUrls.add(url);
    pageCount++;

    console.log(`Crawling: ${url} (Depth: ${depth}, Page: ${pageCount})`);

    const html = await fetchPage(url);
    if (!html) return;

    const content = extractContent(html);
    allContent.push({ url, ...content });

    const links = extractLinks(html, baseUrl);
    for (const link of links) {
        if (link.startsWith(baseUrl)) {
            await crawl(link, depth + 1, maxDepth);
        }
    }
}


// Minimum URL length (adjust as needed)
const minUrlLength = 44;


// Function to save all content to a JSON file
// Function to save all content to a JSON file with URL length filter
function saveToJson() {
    const jsonData = allContent
        .filter(page => page.url.length >= minUrlLength) // 🔎 Filter by URL length
        .map(page => ({
            url: page.url,
            content: {
                title: page.title,
                headings: page.headings,
                paragraphs: page.paragraphs
            }
        }));

    fs.writeFileSync('./output/nyheter.json', JSON.stringify(jsonData, null, 2));
    console.log(`All content saved to nyheter.json (filtered by min URL length ${minUrlLength})`);
}


// Start crawling from the base URL
(async () => {
    await crawl(baseUrl);
    saveToJson();
})();

