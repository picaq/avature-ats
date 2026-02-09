const fs = require('fs');
const got = require('got').default;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
// Try to require the input file and normalize its exports into an array
// const axios = require('axios');

// 1. Pool of User-Agents and Header Sets
const headersPool = [
    // Common desktop browser
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    },
    // Another desktop browser
    {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.5'
    },
    // Mobile browser
    {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    }
];

// 2. Function to get random headers
function getRandomHeaders() {
    const randomIndex = Math.floor(Math.random() * headersPool.length);
    return headersPool[randomIndex];
}


const wait = ms => new Promise(response => setTimeout(response, ms));

let applicationURLs = [];

try {
  const data = require('./input_file_unique.txt');

  if (Array.isArray(data)) {
    applicationURLs = data;
  } else if (data && Array.isArray(data.applicationURLs)) {
    applicationURLs = data.applicationURLs;
  } else if (typeof data === 'string') {
    applicationURLs = data.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  } else if (data && typeof data === 'object') {
    // try to find the first array or string value
    for (const val of Object.values(data)) {
      if (Array.isArray(val)) {
        applicationURLs = val;
        break;
      }
      if (typeof val === 'string') {
        applicationURLs = val.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        break;
      }
    }
  }
} catch (err) {
  // fallback: read file contents and extract http(s) links
  try {
    const content = fs.readFileSync('./input_file.txt', 'utf8');
    const matches = content.match(/https?:\/\/[^\s'"\)\>]+/g) || [];
    applicationURLs = Array.from(new Set(matches));
  } catch (readErr) {
    console.error('Could not load or parse input_file.txt:', readErr.message);
    process.exit(1);
  }
}

applicationURLs = applicationURLs.map(url => url.trim()).filter(url => url.length > 0);

const applicationData = [];

(async () => {
  for (const url of applicationURLs) {
    try {
      const response = await got(url, {
        headers: getRandomHeaders()
      });
      const dom = new JSDOM(response.body);
      const document = dom.window.document;
      const jobTitle = document.querySelector('h2') ? document.querySelector('h2').textContent.trim() : url.split(/.*JobDetail\/|\/\d*/)[1].replace('-', ' ');
      const jobDescription = document.querySelector('[class*="article"] p:not([class*="hidden"])')
        ? [...document.querySelectorAll('[class*="article"] p:not([class*="hidden"])')].map(p => p.textContent.trim()).join('\n')
        : '';
      const datePosted = document.querySelector('.date-posted') ? document.querySelector('.date-posted').textContent.trim() : '';
      const location = document.querySelector('.location') ? document.querySelector('.location').textContent.trim() : '';

      console.log(` ${url} - 
        Title: ${jobTitle} - description: ${jobDescription.slice(0, 200)}`);
      applicationData.push({
        applicationURL: url,
        jobTitle,
        jobDescription,
        DatePosted: datePosted,
        Location: location
      });
    } catch (err) {
      console.log(`Error fetching ${url}:`, err.message);
      applicationData.push({
        applicationURL: url,
        jobTitle: "",
        jobDescription: "",
        DatePosted: "",
        Location: ""
      });
    }
    await wait(2); // delay between requests
  }

  console.log(`applicationURLs count: ${applicationData.length}`);
  fs.writeFileSync('output_file.json', JSON.stringify(applicationData, null, 2));
  module.exports = { applicationURLs: applicationData };
})().catch(err => {
  console.error('Error processing URLs:', err);
  process.exit(1);
});
