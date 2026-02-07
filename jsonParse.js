const jsonData = require('./whoisxmlapi.json');

function parseJsonData(data) {
    const parsedData = JSON.parse(JSON.stringify(data));
    return parsedData;
}

const records = parseJsonData(jsonData.result.records);

// search executed on Feb 7 2026
const now = 1770501326684 || Date.now(); 
const nowUnix = now / 1000;

const filteredRecords = records.filter(record => {

  // Filter records last seen in the last 30 days: 186 items
    return record.lastSeen > nowUnix - (30 * 24 * 60 * 60);
    
  // Filter records last seen in the last 60 days: 218 items
  // return record.lastSeen > nowUnix - (60 * 24 * 60 * 60);
});

const URLs = filteredRecords.map(filteredRecord => 'https://' + filteredRecord.domain + '/careers/SearchJobs');
// console.log(records);
// console.log(records.length);
console.log(URLs, URLs.length);



