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

// incremental output settings
const OUT_ND = 'application_urls.ndjson';
const PROGRESS_FILE = 'progress.json';
const FINAL_JSON = 'application_urls.json';
const FAILURES_JSON = 'failures.json';
const REQUEST_DELAY = 300; // ms between requests
const MAX_RETRIES = 3; // retry failed fetches this many times
const RETRY_DELAY = 1000; // ms between retries

// determine where to resume from
let startIndex = 0;
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    const p = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    if (typeof p.lastProcessed === 'number') startIndex = p.lastProcessed + 1;
  } catch (e) {
    // ignore and fallback
  }
} else if (fs.existsSync(OUT_ND)) {
  try {
    const lines = fs.readFileSync(OUT_ND, 'utf8').split(/\r?\n/).filter(Boolean).length;
    startIndex = lines;
  } catch (e) {}
}

console.log(`Starting processing at index ${startIndex} / ${applicationURLs.length}`);

(async () => {
  const failed = [];

  for (let i = startIndex; i < applicationURLs.length; i++) {
    const url = applicationURLs[i];
    let obj = {
      applicationURL: url,
      jobTitle: "",
      jobDescription: "",
      DatePosted: "",
      Location: ""
    };

    try {
      const response = await got(url, { headers: getRandomHeaders(), timeout: { request: 30000 } });
      const dom = new JSDOM(response.body);
      const document = dom.window.document;
      const jobTitle = document.querySelector('h2') ? document.querySelector('h2').textContent.trim() : (url.match(/JobDetail\/([^/]+)/) || [])[1] || url;
      const jobDescription = document.querySelector('[class*="article"] p:not([class*="hidden"])')
        ? [...document.querySelectorAll('[class*="article"] p:not([class*="hidden"])')].map(p => p.textContent.trim()).join('\n')
        : '';
      const datePosted = document.querySelector('.date-posted') ? document.querySelector('.date-posted').textContent.trim() : '';
      const location = document.querySelector('.location') ? document.querySelector('.location').textContent.trim() : '';

      obj = { applicationURL: url, jobTitle, jobDescription, DatePosted: datePosted, Location: location };
      console.log(`Fetched [${i}] ${url} - Title: ${String(jobTitle).slice(0,80)}`);
    } catch (err) {
      console.log(`Error fetching [${i}] ${url}:`, err.message);
      failed.push({ url, index: i, attempts: 1, lastError: String(err.message) });
    }

    // append NDJSON line and update progress (if fetch failed we still append a blank object for that URL)
    try {
      fs.appendFileSync(OUT_ND, JSON.stringify(obj) + '\n', 'utf8');
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ lastProcessed: i }), 'utf8');
    } catch (e) {
      console.error('Error writing output/progress files:', e.message);
      process.exit(1);
    }

    await wait(REQUEST_DELAY);
  }

  // retry failures
  if (failed.length > 0) {
    console.log(`Retrying ${failed.length} failed fetches up to ${MAX_RETRIES} times`);
    for (let attempt = 1; attempt <= MAX_RETRIES && failed.length > 0; attempt++) {
      console.log(`Retry pass ${attempt} (${failed.length} items)`);
      const stillFailed = [];
      for (const f of failed) {
        try {
          const response = await got(f.url, { headers: getRandomHeaders(), timeout: { request: 30000 } });
          const dom = new JSDOM(response.body);
          const document = dom.window.document;
          const jobTitle = document.querySelector('h2') ? document.querySelector('h2').textContent.trim() : (f.url.match(/JobDetail\/([^/]+)/) || [])[1] || f.url;
          const jobDescription = document.querySelector('[class*="article"] p:not([class*="hidden"])')
            ? [...document.querySelectorAll('[class*="article"] p:not([class*="hidden"])')].map(p => p.textContent.trim()).join('\n')
            : '';
          const datePosted = document.querySelector('.date-posted') ? document.querySelector('.date-posted').textContent.trim() : '';
          const location = document.querySelector('.location') ? document.querySelector('.location').textContent.trim() : '';
          const obj = { applicationURL: f.url, jobTitle, jobDescription, DatePosted: datePosted, Location: location };
          fs.appendFileSync(OUT_ND, JSON.stringify(obj) + '\n', 'utf8');
          console.log(`Retry success ${f.index}: ${f.url}`);
        } catch (err) {
          console.log(`Retry failed for ${f.url}:`, err.message);
          f.attempts = (f.attempts || 1) + 1;
          f.lastError = String(err.message);
          stillFailed.push(f);
        }
        await wait(RETRY_DELAY);
      }
      failed.length = 0;
      Array.prototype.push.apply(failed, stillFailed);
    }
  }

  // write remaining failures (if any)
  try {
    if (failed.length > 0) {
      fs.writeFileSync(FAILURES_JSON, JSON.stringify(failed, null, 2), 'utf8');
      console.log(`Wrote ${failed.length} remaining failures to ${FAILURES_JSON}`);
    } else {
      try { fs.unlinkSync(FAILURES_JSON); } catch (e) {}
    }
  } catch (e) {
    console.error('Error writing failures file:', e.message);
  }

  // finished: convert NDJSON -> final JSON array
  try {
    const lines = fs.readFileSync(OUT_ND, 'utf8').split(/\r?\n/).filter(Boolean);
    const arr = lines.map(l => {
      try { return JSON.parse(l); } catch (e) { return null; }
    }).filter(Boolean);
    fs.writeFileSync(FINAL_JSON, JSON.stringify(arr, null, 2), 'utf8');
    console.log(`Done. Wrote ${arr.length} items to ${FINAL_JSON}`);
    // remove progress file so future runs start fresh
    try { fs.unlinkSync(PROGRESS_FILE); } catch (e) {}
    module.exports = { applicationURLs: arr };
  } catch (e) {
    console.error('Error finalizing output:', e.message);
    process.exit(1);
  }
})().catch(err => {
  console.error('Error processing URLs:', err);
  process.exit(1);
});
