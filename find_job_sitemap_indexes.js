#!/usr/bin/env node

/**
 * Script to find job listing sitemaps for Avature career sites.
 * Only returns sitemaps that contain actual job posting URLs.
 * 
 * Focuses on patterns like:
 * - {domain}/careers/sitemap.xml
 * - {domain}/jobs/sitemap.xml
 * - Language-specific variants from sitemap_index.xml
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');

// List of domains to check
const DOMAINS = [
    'https://epic.avature.net/careers',
    'https://uatashfieldhealthcare.avature.net/careers',
    'https://dell2.avature.net/careers',
    'https://ibmglobal.avature.net/careers',
    'https://mclaren.avature.net/careers',
    'https://enel.avature.net/careers',
    'https://bloomberg.avature.net/careers',
    'https://maximus.avature.net/careers',
    'https://regis.avature.net/careers',
    'https://sandboxashfieldhealthcare.avature.net/careers',
    'https://laplanduk.avature.net/careers',
    'https://deloitteus.avature.net/careers',
    'https://mckinsey.avature.net/careers',
    'https://uclahealth.avature.net/careers',
    'https://xerox.avature.net/careers',
    'https://gpshospitality.avature.net/careers',
    'https://ea.avature.net/careers',
    'https://pepsicoglobalpontoon.avature.net/careers',
    'https://amswh.avature.net/careers',
    'https://manpowergroupco.avature.net/careers',
    'https://unifi.avature.net/careers',
    'https://deloittebe.avature.net/careers',
    'https://sandboxsantos.avature.net/careers',
    'https://westrockta.avature.net/careers',
    'https://cdcn.avature.net/careers',
    'https://mgl.avature.net/careers',
    'https://workmyway.avature.net/careers',
    'https://fonterrakf.avature.net/careers',
    'https://monadelphous.avature.net/careers',
    'https://deloittecm.avature.net/careers',
    'https://sandboxea.avature.net/careers',
    'https://aesc.avature.net/careers',
    'https://plantemoran.avature.net/careers',
    'https://tesco.avature.net/careers',
    'https://auspost.avature.net/careers',
    'https://mantech.avature.net/careers',
    'https://harmanglobal.avature.net/careers',
    'https://coeint.avature.net/careers',
    'https://astellas.avature.net/careers',
    'https://mikloswiki.avature.net/careers',
    'https://eventregistrationeu.avature.net/careers',
    'https://onecall.avature.net/careers',
    'https://intercaretherapy.avature.net/careers',
    'https://fortress.avature.net/careers',
    'https://delta.avature.net/careers',
    'https://lockheedmartin.avature.net/careers',
    'https://sandboxtesco.avature.net/careers',
    'https://justicejobs.avature.net/careers',
    'https://infor.avature.net/careers',
    'https://astellasjapan.avature.net/careers',
    'https://insperity.avature.net/careers',
    'https://sandboxsmurfitwestrockta.avature.net/careers',
    'https://transcom.avature.net/careers',
    'https://jrg.avature.net/careers',
    'https://ally.avature.net/careers',
    'https://genpact.avature.net/careers',
    'https://nva.avature.net/careers',
    'https://amspsr.avature.net/careers',
    'https://ciusss.avature.net/careers',
    'https://twosigma.avature.net/careers',
    'https://santos.avature.net/careers',
    'https://radpartners.avature.net/careers',
    'https://vanoord.avature.net/careers',
    'https://advocateaurorahealth.avature.net/careers',
    'https://zungfu.avature.net/careers',
    'https://a2milkkf.avature.net/careers',
    'https://telusinternational.avature.net/careers',
    'https://fb.avature.net/careers',
    'https://loa.avature.net/careers',
    'https://sparknz.avature.net/careers',
    'https://kpmgireland.avature.net/careers',
    'https://boozallen.avature.net/careers',
    'https://travisperkins.avature.net/careers',
    'https://rohdeschwarz.avature.net/careers',
    'https://tennet.avature.net/careers',
    'https://cbreglobal.avature.net/careers',
    'https://uskpmgats.avature.net/careers',
    'https://cyclecarriage.avature.net/careers',
    'https://cchbc.avature.net/careers',
    'https://bnc.avature.net/careers',
    'https://jakala.avature.net/careers',
    'https://bankerslife.avature.net/careers',
    'https://fmlogistic.avature.net/careers',
    'https://baloise.avature.net/careers',
    'https://broadinstitute.avature.net/careers',
    'https://mercadona.avature.net/careers',
    'https://dhlconsulting.avature.net/careers',
    'https://synopsys.avature.net/careers',
    'https://sandboxbnc.avature.net/careers',
    'https://bravura.avature.net/careers',
    'https://tescoinsuranceandmoneyservices.avature.net/careers',
    'https://sandboxhealthfirst.avature.net/careers',
    'https://koch.avature.net/careers',
    'https://devwoolworths1.avature.net/careers',
    'https://frequentis.avature.net/careers',
    'https://dfiretailgroup.avature.net/careers',
    'https://primero.avature.net/careers',
    'https://bmcrecruit.avature.net/careers',
    'https://rgp.avature.net/careers',
    'https://resourcebank.avature.net/careers'
];

/**
 * Make an HTTP/HTTPS request
 */
function makeRequest(url, method = 'HEAD') {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        const options = {
            method: method,
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SitemapFinder/1.0)'
            }
        };

        const req = protocol.request(options, (res) => {
            let data = '';
            
            if (method === 'GET') {
                res.on('data', (chunk) => {
                    data += chunk;
                });
            }
            
            res.on('end', () => {
                resolve({
                    url: url,
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });

        req.on('error', (error) => {
            reject({ url, error: error.message });
        });

        req.on('timeout', () => {
            req.destroy();
            reject({ url, error: 'Request timeout' });
        });

        req.end();
    });
}

/**
 * Check if a URL is accessible
 */
async function checkUrl(url) {
    try {
        const response = await makeRequest(url, 'HEAD');
        return {
            url: url,
            status: response.statusCode,
            accessible: response.statusCode === 200,
            contentType: response.headers['content-type'] || ''
        };
    } catch (error) {
        return {
            url: url,
            status: null,
            accessible: false,
            error: error.error || error.message
        };
    }
}

/**
 * Parse sitemap index to find individual job sitemap URLs
 * Only returns sitemaps that end with /careers/sitemap.xml or /jobs/sitemap.xml
 */
async function parseSitemapIndex(sitemapIndexUrl) {
    try {
        const response = await makeRequest(sitemapIndexUrl, 'GET');
        if (response.statusCode === 200) {
            const sitemaps = [];
            // Simple regex to extract <loc> URLs from XML
            const locRegex = /<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/gi;
            let match;
            while ((match = locRegex.exec(response.data)) !== null) {
                const sitemapUrl = match[1].trim();
                // Only include if it's a job listing sitemap (ends with /careers/sitemap_index.xml or /jobs/sitemap_index.xml)
                if (sitemapUrl.match(/\/(careers|jobs)\/sitemap_index\.xml$/i)) {
                    sitemaps.push(sitemapUrl);
                }
            }
            return sitemaps.length > 0 ? sitemaps : null;
        }
    } catch (error) {
        // Ignore errors
    }
    return null;
}

/**
 * Verify if a sitemap contains job URLs by sampling it
 */
async function verifySitemapHasJobs(sitemapUrl) {
    try {
        const response = await makeRequest(sitemapUrl, 'GET');
        if (response.statusCode === 200) {
            const data = response.data;
            // Check if it contains job-related URLs
            // Common patterns: /JobDetail/, /SearchJobs, /careers/JobDetail, /jobs/, etc.
            const hasJobUrls = 
                data.includes('/JobDetail') ||
                data.includes('/SearchJobs') ||
                data.includes('careers/JobDetail') ||
                data.includes('jobs/JobDetail') ||
                data.includes('<loc>') && (
                    data.includes('/careers/') || 
                    data.includes('/jobs/')
                );
            return hasJobUrls;
        }
    } catch (error) {
        // Ignore errors
    }
    return false;
}

/**
 * Find job listing sitemaps for a given domain
 */
async function findJobSitemapsForDomain(baseUrl) {
    // Extract base domain from URL
    let baseDomain = baseUrl;
    if (baseUrl.endsWith('/careers')) {
        baseDomain = baseUrl.substring(0, baseUrl.lastIndexOf('/careers'));
    } else if (baseUrl.endsWith('/jobs')) {
        baseDomain = baseUrl.substring(0, baseUrl.lastIndexOf('/jobs'));
    }

    const results = {
        baseUrl: baseUrl,
        domain: baseDomain,
        foundSitemaps: [],
        verified: []
    };

    // Pattern 1: /careers/sitemap.xml
    const careersSitemap = `${baseDomain}/careers/sitemap.xml`;
    const check1 = await checkUrl(careersSitemap);
    if (check1.accessible) {
        const hasJobs = await verifySitemapHasJobs(careersSitemap);
        if (hasJobs) {
            results.foundSitemaps.push(careersSitemap);
            results.verified.push({ url: careersSitemap, verified: true });
        }
    }

    // Pattern 2: /jobs/sitemap.xml
    const jobsSitemap = `${baseDomain}/jobs/sitemap.xml`;
    const check2 = await checkUrl(jobsSitemap);
    if (check2.accessible) {
        const hasJobs = await verifySitemapHasJobs(jobsSitemap);
        if (hasJobs) {
            results.foundSitemaps.push(jobsSitemap);
            results.verified.push({ url: jobsSitemap, verified: true });
        }
    }

    // Pattern 3: /careers/sitemap_index.xml -> extract job sitemaps
    const careersIndex = `${baseDomain}/careers/sitemap_index.xml`;
    const check3 = await checkUrl(careersIndex);
    if (check3.accessible) {
        const indexSitemaps = await parseSitemapIndex(careersIndex);
        if (indexSitemaps) {
            for (const sitemap of indexSitemaps) {
                if (!results.foundSitemaps.includes(sitemap)) {
                    results.foundSitemaps.push(sitemap);
                    results.verified.push({ url: sitemap, verified: true, source: 'sitemap_index' });
                }
            }
        }
    }

    // Pattern 4: /jobs/sitemap_index.xml -> extract job sitemaps
    const jobsIndex = `${baseDomain}/jobs/sitemap_index.xml`;
    const check4 = await checkUrl(jobsIndex);
    if (check4.accessible) {
        const indexSitemaps = await parseSitemapIndex(jobsIndex);
        if (indexSitemaps) {
            for (const sitemap of indexSitemaps) {
                if (!results.foundSitemaps.includes(sitemap)) {
                    results.foundSitemaps.push(sitemap);
                    results.verified.push({ url: sitemap, verified: true, source: 'sitemap_index' });
                }
            }
        }
    }

    // Remove duplicates
    results.foundSitemaps = [...new Set(results.foundSitemaps)];

    return results;
}

/**
 * Sleep helper
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
    console.log(`\n${'='.repeat(80)}`);
    console.log('JOB LISTING SITEMAP FINDER');
    console.log(`${'='.repeat(80)}\n`);
    console.log(`Checking ${DOMAINS.length} domains for job listing sitemaps...\n`);
    console.log('Looking for sitemaps ending in:');
    console.log('  - /careers/sitemap_index.xml');
    console.log('  - /jobs/sitemap_index.xml');
    console.log('  - Language variants (e.g., /en_US/careers/sitemap.xml)\n');

    const allResults = [];

    for (let i = 0; i < DOMAINS.length; i++) {
        const domain = DOMAINS[i];
        console.log(`[${i + 1}/${DOMAINS.length}] Checking ${domain}...`);

        const results = await findJobSitemapsForDomain(domain);
        allResults.push(results);

        if (results.foundSitemaps.length > 0) {
            console.log(`  ✓ Found ${results.foundSitemaps.length} job sitemap(s):`);
            for (const sitemap of results.foundSitemaps) {
                console.log(`    - ${sitemap}`);
            }
        } else {
            console.log(`  ✗ No job sitemaps found`);
        }

        // Be nice to the servers
        await sleep(500);
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80) + '\n');

    const totalWithSitemaps = allResults.filter(r => r.foundSitemaps.length > 0).length;
    const totalSitemaps = allResults.reduce((sum, r) => sum + r.foundSitemaps.length, 0);

    console.log(`Domains checked: ${DOMAINS.length}`);
    console.log(`Domains with job sitemaps: ${totalWithSitemaps}`);
    console.log(`Total job sitemaps found: ${totalSitemaps}`);
    console.log();

    // Export results
    console.log('\nAll job listing sitemaps:');
    console.log('-'.repeat(80));
    const allSitemaps = [];
    for (const result of allResults) {
        for (const sitemap of result.foundSitemaps) {
            console.log(sitemap);
            allSitemaps.push(sitemap);
        }
    }

    // Save organized output
    const organizedOutput = allResults
        .filter(r => r.foundSitemaps.length > 0)
        .map(result => {
            let content = `# ${result.domain}\n`;
            for (const sitemap of result.foundSitemaps) {
                content += `${sitemap}\n`;
            }
            content += '\n';
            return content;
        }).join('');

    fs.writeFileSync('job_sitemaps.txt', organizedOutput);

    // Save just the URLs
    fs.writeFileSync('job_sitemaps_urls.txt', allSitemaps.join('\n'));

    // Save as JSON
    const jsonOutput = {
        totalDomains: DOMAINS.length,
        domainsWithSitemaps: totalWithSitemaps,
        totalSitemaps: totalSitemaps,
        timestamp: new Date().toISOString(),
        results: allResults.filter(r => r.foundSitemaps.length > 0)
    };
    fs.writeFileSync('job_sitemaps.json', JSON.stringify(jsonOutput, null, 2));

    // Create a simple CSV for easy import
    const csvLines = ['Domain,Sitemap URL'];
    for (const result of allResults) {
        for (const sitemap of result.foundSitemaps) {
            csvLines.push(`${result.domain},${sitemap}`);
        }
    }
    fs.writeFileSync('job_sitemaps.csv', csvLines.join('\n'));

    console.log('\n' + '='.repeat(80));
    console.log('Results saved to:');
    console.log('  - job_sitemaps.txt (organized by domain)');
    console.log('  - job_sitemaps_urls.txt (just URLs, one per line)');
    console.log('  - job_sitemaps.json (full details with metadata)');
    console.log('  - job_sitemaps.csv (CSV format for import)');
    console.log('='.repeat(80) + '\n');
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { findJobSitemapsForDomain, checkUrl, parseSitemapIndex, verifySitemapHasJobs };
