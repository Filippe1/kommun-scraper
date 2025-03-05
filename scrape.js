const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { URL } = require('url');

// Configuration
const baseUrl = 'https://herbsaremyworld.com'; // Replace with the website you want to scrape
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

// Function to extract content from a page
function extractContent(html) {
    const $ = cheerio.load(html);
    const title = $('title').text();
    const headings = [];
    const paragraphs = [];

    // Extract headings (h1, h2, h3)
    $('h1, h2, h3').each((i, element) => {
        headings.push($(element).text());
    });

    // Extract paragraphs
    $('p').each((i, element) => {
        paragraphs.push($(element).text());
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

async function crawl(url, depth = 0, maxDepth = 3) {
    if (visitedUrls.has(url) || depth > maxDepth || pageCount >= maxPages || !isRelevantUrl(url) || isImageUrl(url)) return;
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

// Function to save all content to a Markdown file
function saveToMarkdown() {
    let markdownContent = '';

    allContent.forEach((page) => {
        markdownContent += `# ${page.title}\n\n`;
        markdownContent += `**URL:** [${page.url}](${page.url})\n\n`;

        markdownContent += '## Headings\n\n';
        page.headings.forEach((heading) => {
            markdownContent += `- ${heading}\n`;
        });

        markdownContent += '\n## Paragraphs\n\n';
        page.paragraphs.forEach((paragraph) => {
            markdownContent += `${paragraph}\n\n`;
        });

        markdownContent += '---\n\n'; // Separator between pages
    });

    fs.writeFileSync('output.md', markdownContent);
    console.log('All content saved to output.md');
}

// Start crawling from the base URL
(async () => {
    await crawl(baseUrl);
    saveToMarkdown();
})();