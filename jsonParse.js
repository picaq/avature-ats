import jsonData from './whoisxmlapi.json' with { type: 'json' };

function parseJsonData(data) {
    const parsedData = JSON.parse(JSON.stringify(data));
    return parsedData;
}

const checkValidURL = async (url) => {
  try {
    const response = await fetch(url);
    
    if (response.ok || response.redirected) {
      return true;
    }
    else if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      return false;
    }    
  } catch (error) {
    return false;
    console.error('Error fetching data:', error);
  }
};

const wait = ms => new Promise(response => setTimeout(response, ms));

(async () => {
  const records = parseJsonData(jsonData.result.records);

  // search executed on Feb 7 2026
  const now = 1770501326684 || Date.now(); 
  const nowUnix = now / 1000;

  const filteredRecords = records.filter(record => {

    // Filter records last seen in the last 30 days: 186 items, final 90 valid URLs
      // return record.lastSeen > nowUnix - (30 * 24 * 60 * 60);      
    // Filter records last seen in the last 60 days: 218 items, final 97 valid URLs
    // return record.lastSeen > nowUnix - (60 * 24 * 60 * 60);
    return record.lastSeen > nowUnix - (90 * 24 * 60 * 60); // final 100 valid URLs
  });

  const URLs = filteredRecords.map(filteredRecord => 'https://' + filteredRecord.domain + '/careers');
  // const URLs = filteredRecords.map(filteredRecord => 'https://' + filteredRecord.domain + '/careers/SearchJobs');

  // console.log(records);
  // console.log(records.length);
  // console.log(URLs, URLs.length);

  const validURLs = await Promise.all(
    URLs.map(async (url) => {
      await wait(90); // prevent rate limiting, 90ms delay between requests
      const isValid = await checkValidURL(url);
      return isValid ? url : null;
    })
  ).then(results => results.filter(url => url !== null));

  console.log(validURLs, validURLs.length);
})();





