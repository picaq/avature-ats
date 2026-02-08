const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
// Try to require the input file and normalize its exports into an array
let applicationURLs = [];

try {
  const data = require('./input_file.txt');

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

// convert to array of objects with requested keys
const applicationData = applicationURLs.map(url => ({
  applicationURL: url,
  jobTitle: "",
  jobDescription: "",
  DatePosted: "",
  Location: ""
}));

console.log(`applicationURLs count: ${applicationData.length}`);

// save output for downstream use
fs.writeFileSync('application_urls.json', JSON.stringify(applicationData, null, 2));

module.exports = { applicationURLs: applicationData };
