// import kochJobs from './koch_job_urls.js';
const fs = require('fs');

// Sitemap indexes from the user
const sitemapIndexes = [
  "https://careers.ibm.com/careers/sitemap_index.xml",
  "https://mclarencareers.mclaren.com/careers/sitemap_index.xml",
  "https://jobs.enel.com/careers/sitemap_index.xml",
  "https://bloomberg.avature.net/careers/sitemap_index.xml",
  "https://maximus.avature.net/careers/sitemap_index.xml",
  "https://regis.avature.net/careers/sitemap_index.xml",
  "https://sandboxashfieldhealthcare.avature.net/careers/sitemap_index.xml",
  "https://laplanduk.avature.net/careers/sitemap_index.xml",
  "https://apply.deloitte.com/careers/sitemap_index.xml",
  "https://uclahealth.avature.net/careers/sitemap_index.xml",
  "https://xerox.avature.net/careers/sitemap_index.xml",
  "https://gpshospitality.avature.net/careers/sitemap_index.xml",
  "https://jobs.ea.com/careers/sitemap_index.xml",
  "https://pepsicoglobalpontoon.avature.net/careers/sitemap_index.xml",
  "https://amswh.avature.net/careers/sitemap_index.xml",
  "https://manpowergroupco.avature.net/careers/sitemap_index.xml",
  "https://unifi.avature.net/careers/sitemap_index.xml",
  "https://deloittebe.avature.net/careers/sitemap_index.xml",
  "https://sandboxsantos.avature.net/careers/sitemap_index.xml",
  "https://cdcn.avature.net/careers/sitemap_index.xml",
  "https://recruitment.macquarie.com/careers/sitemap_index.xml",
  "https://emea.workmyway.com/careers/sitemap_index.xml",
  "https://careers.fonterra.com/careers/sitemap_index.xml",
  "https://jobs.monadelphous.com.au/careers/sitemap_index.xml",
  "https://deloittecm.avature.net/careers/sitemap_index.xml",
  "https://sandboxea.avature.net/careers/sitemap_index.xml",
  "https://jobs.aesc-group.com/careers/sitemap_index.xml",
  "https://plantemoran.avature.net/careers/sitemap_index.xml",
  "https://careers.tesco.com/careers/sitemap_index.xml",
  "https://jobs.auspost.com.au/careers/sitemap_index.xml",
  "https://careers.mantech.com/careers/sitemap_index.xml",
  "https://jobsearch.harman.com/careers/sitemap_index.xml",
  "https://coeint.avature.net/careers/sitemap_index.xml",
  "https://astellas.avature.net/careers/sitemap_index.xml",
  "https://onecall.avature.net/careers/sitemap_index.xml",
  "https://intercaretherapy.avature.net/careers/sitemap_index.xml",
  "https://fortress.avature.net/careers/sitemap_index.xml",
  "https://delta.avature.net/careers/sitemap_index.xml",
  "https://sandboxtesco.avature.net/careers/sitemap_index.xml",
  "https://jobs.justice.gov.uk/careers/sitemap_index.xml",
  "https://astellasjapan.avature.net/careers/sitemap_index.xml",
  "https://insperity.avature.net/careers/sitemap_index.xml",
  "https://sandboxsmurfitwestrockta.avature.net/careers/sitemap_index.xml",
  "https://apply.careers.transcom.com/careers/sitemap_index.xml",
  "https://jrg.avature.net/careers/sitemap_index.xml",
  "https://ally.avature.net/careers/sitemap_index.xml",
  "https://nva.avature.net/jobs/sitemap_index.xml",
  "https://nva.avature.net/careers/sitemap_index.xml",
  "https://amspsr.avature.net/careers/sitemap_index.xml",
  "https://ciusss.avature.net/careers/sitemap_index.xml",
  "https://careers.twosigma.com/careers/sitemap_index.xml",
  "https://recruitment.santos.com/careers/sitemap_index.xml",
  "https://radpartners.avature.net/careers/sitemap_index.xml",
  "https://vanoord.avature.net/careers/sitemap_index.xml",
  "https://clinicianjobs.advocatehealth.org/careers/sitemap_index.xml",
  "https://zungfu.avature.net/careers/sitemap_index.xml",
  "https://a2milkkf.avature.net/careers/sitemap_index.xml",
  "https://jobs.telusdigital.com/careers/sitemap_index.xml",
  "https://careers.fbcareers.com/careers/sitemap_index.xml",
  "https://career.loreal.com/careers/sitemap_index.xml",
  "https://career.loreal.com/jobs/sitemap_index.xml",
  "https://careers.sparknz.co.nz/careers/sitemap_index.xml",
  "https://careers.entelargroup.co.nz/jobs/sitemap_index.xml",
  "https://kpmgireland.avature.net/careers/sitemap_index.xml",
  "https://careers.boozallen.com/careers/sitemap_index.xml",
  "https://jobs.rohde-schwarz.com/careers/sitemap_index.xml",
  "https://careers.tennet.eu/careers/sitemap_index.xml",
  "https://careers.cbre.com/careers/sitemap_index.xml",
  "https://uskpmgats.avature.net/careers/sitemap_index.xml",
  "https://cyclecarriage.avature.net/careers/sitemap_index.xml",
  "https://emplois.bnc.ca/careers/sitemap_index.xml",
  "https://fmlogistic.avature.net/careers/sitemap_index.xml",
  "https://careers.baloise.com/careers/sitemap_index.xml",
  "https://broadinstitute.avature.net/careers/sitemap_index.xml",
  "https://mercadona.avature.net/Careers/sitemap_index.xml",
  "https://dhlconsulting.avature.net/careers/sitemap_index.xml",
  "https://synopsys.avature.net/careers/sitemap_index.xml",
  "https://sandboxbnc.avature.net/careers/sitemap_index.xml",
  "https://bravura.avature.net/careers/sitemap_index.xml",
  "https://tescoinsuranceandmoneyservices.avature.net/careers/sitemap_index.xml",
  "https://sandboxhealthfirst.avature.net/careers/sitemap_index.xml",
  "https://koch.avature.net/careers/sitemap_index.xml",
  "https://devwoolworths1.avature.net/careers/sitemap_index.xml",
  "https://jobs.frequentis.com/careers/sitemap_index.xml",
  "https://dfiretailgroup.avature.net/careers/sitemap_index.xml",
  "https://primero.avature.net/careers/sitemap_index.xml",
  "https://jobs.bmc.com/Careers/sitemap_index.xml",
  "https://careers.rgp.com/Careers/sitemap_index.xml",
  "https://resourcebank.avature.net/careers/sitemap_index.xml"
];

// Storage for results
const allJobUrls = [];
const sitemapData = {};

// Helper function to extract text content from XML tags
function extractLocations(xmlText) {
  const locRegex = /<loc>(.*?)<\/loc>/gs;
  const matches = [];
  let match;
  while ((match = locRegex.exec(xmlText)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

// Helper function to add delay between requests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Recursive function to process sitemap (handles both regular sitemaps and nested indexes)
async function processSitemap(sitemapUrl, indexUrl, depth = 0) {
  const indent = '  '.repeat(depth + 2);
  
  try {
    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      console.log(`${indent}✗ Failed (${response.status})`);
      return;
    }
    
    const xmlText = await response.text();
    
    // Skip sitemaps that return 202 (Accepted) or are otherwise empty
    if (response.status === 202 || xmlText.length === 0) {
      return;
    }
    
    const urls = extractLocations(xmlText);
    
    if (urls.length === 0) {
      return;
    }
    
    // Separate URLs into two categories
    const jobDetailUrls = urls.filter(url => url.includes('JobDetail\/'));
    const nestedSitemapUrls = urls.filter(url => url.includes('/sitemap') && !url.includes('JobDetail'));
    
    // Process nested sitemaps recursively
    if (nestedSitemapUrls.length > 0) {
      console.log(`${indent}Found ${nestedSitemapUrls.length} nested sitemaps`);
      for (let k = 0; k < nestedSitemapUrls.length; k++) {
        await processSitemap(nestedSitemapUrls[k], indexUrl, depth + 1);
      }
    }
    
    // Process job URLs
    if (jobDetailUrls.length > 0) {
      console.log(`${indent}✓ Found ${jobDetailUrls.length} job URLs`);
      sitemapData[indexUrl].jobUrls.push(...jobDetailUrls);
      allJobUrls.push(...jobDetailUrls);
    }
    
    // If we found regular URLs but not jobs, log it
    if (urls.length > 0 && jobDetailUrls.length === 0 && nestedSitemapUrls.length === 0) {
      console.log(`${indent}Found ${urls.length} URLs (not jobs or sitemaps)`);
    }
    
    await delay(500);
  } catch (error) {
    console.log(`${indent}✗ Error: ${error.message}`);
  }
}

// Main scraping function
async function scrapeSitemaps() {
  console.log(`Starting to process ${sitemapIndexes.length} sitemap indexes...`);
  
  for (let i = 0; i < sitemapIndexes.length; i++) {
    const indexUrl = sitemapIndexes[i];
    console.log(`\n[${i + 1}/${sitemapIndexes.length}] Processing: ${indexUrl}`);
    
    try {
      // Step 1: Fetch sitemap index
      const indexResponse = await fetch(indexUrl);
      if (!indexResponse.ok) {
        console.log(`  ✗ Failed to fetch sitemap index (${indexResponse.status})`);
        continue;
      }
      
      const indexXml = await indexResponse.text();
      const sitemapUrls = extractLocations(indexXml);
      console.log(`  Found ${sitemapUrls.length} sitemaps`);
      
      sitemapData[indexUrl] = {
        sitemaps: sitemapUrls,
        jobUrls: []
      };
      
      // Step 2: Process each sitemap (recursively handles nested indexes)
      for (let j = 0; j < sitemapUrls.length; j++) {
        const sitemapUrl = sitemapUrls[j];
        console.log(`    [${j + 1}/${sitemapUrls.length}] Processing: ${sitemapUrl}`);
        await processSitemap(sitemapUrl, indexUrl);
      }
      
      console.log(`  Total job URLs from this index: ${sitemapData[indexUrl].jobUrls.length}`);
      
      // Delay between different sitemap indexes
      await delay(700);
      
    } catch (error) {
      console.log(`  ✗ Error processing index: ${error.message}`);
    }
  }
  
  // Write results to file
  console.log(`\n\n=== SUMMARY ===`);
  console.log(`Total job URLs found: ${allJobUrls.length}`);
  console.log(`Unique job URLs: ${new Set(allJobUrls).size}`);
  
  // Save all URLs to text file
  const outputFile = 'job_urls.txt';
  fs.writeFileSync(outputFile, allJobUrls.join('\n'));
  console.log(`\n✓ Saved all URLs to ${outputFile}`);

  // need to decide on js modules befoe combining this
  // const uniqueOutputFile = 'input_file.txt';
  // fs.writeFileSync(uniqueOutputFile, Array.from(new Set([...allJobUrls, ...kochJobs])).join('\n'));
  // console.log(`✓ Saved unique URLs to ${uniqueOutputFile}`);

  // Save structured data to JSON
  const jsonFile = 'logs-old-data/sitemap_data.json';
  fs.writeFileSync(jsonFile, JSON.stringify(sitemapData, null, 2));
  console.log(`✓ Saved structured data to ${jsonFile}`);
  
  // Save summary statistics
  const statsFile = 'logs-old-data/statistics.txt';
  let stats = `Sitemap Scraping Statistics\n`;
  stats += `============================\n\n`;
  stats += `Total sitemap indexes processed: ${sitemapIndexes.length}\n`;
  stats += `Total job URLs found: ${allJobUrls.length}\n`;
  stats += `Unique job URLs: ${new Set(allJobUrls).size}\n`;
  // stats += `Koch job URLs: ${kochJobs.length}\n`;
  stats += `Total unique job URLs: ${new Set([...allJobUrls]).size}\n\n`;
  // stats += `Total unique job URLs (including Koch): ${new Set([...allJobUrls, ...kochJobs]).size}\n\n`;
  stats += `Breakdown by sitemap index:\n`;
  stats += `---------------------------\n`;
  
  for (const [indexUrl, data] of Object.entries(sitemapData)) {
    stats += `${indexUrl}: ${data.jobUrls.length} URLs\n`;
  }
  
  fs.writeFileSync(statsFile, stats);
  console.log(`✓ Saved statistics to ${statsFile}`);
}

// Run the scraper
scrapeSitemaps().catch(console.error);
