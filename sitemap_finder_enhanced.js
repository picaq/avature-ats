#!/usr/bin/env node

/**
 * Script to find sitemap.xml URLs for Avature career sites and extract job detail URLs.
 * When sitemap_index.xml is found, it lists the content of all sitemap.xml files
 * (including language-specific ones like /es_ES/careers/sitemap.xml) and extracts
 * only URLs that contain "/careers/JobDetail/" (actual job listing pages).
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
 * Parse robots.txt to find sitemap URLs
 */
async function parseRobotsTxt(robotsUrl) {
    try {
        const response = await makeRequest(robotsUrl, 'GET');
        if (response.statusCode === 200) {
            const sitemaps = [];
            const lines = response.data.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.toLowerCase().startsWith('sitemap:') && (trimmed.toLowerCase().includes('/careers/') || trimmed.toLowerCase().includes('/jobs/'))) {
                    const sitemapUrl = trimmed.substring(8).trim();
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
 * Parse sitemap index to find individual sitemap URLs
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
                sitemaps.push(match[1].trim());
            }
            return sitemaps.length > 0 ? sitemaps : null;
        }
    } catch (error) {
        // Ignore errors
    }
    return null;
}

/**
 * Parse sitemap XML to extract job URLs from <loc> tags
 * Only returns URLs containing /careers/JobDetail/
 */
async function parseSitemapUrls(sitemapUrl) {
    try {
        const response = await makeRequest(sitemapUrl, 'GET');
        if (response.statusCode === 200) {
            const urls = [];
            // Simple regex to extract <loc> URLs from XML
            const locRegex = /<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/gi;
            let match;
            while ((match = locRegex.exec(response.data)) !== null) {
                const url = match[1].trim();
                // Only include URLs containing /careers/JobDetail/
                if (url.includes('/careers/JobDetail/')) {
                    urls.push(url);
                }
            }
            return urls;
        }
    } catch (error) {
        console.error(`    Error parsing ${sitemapUrl}: ${error.error || error.message}`);
    }
    return [];
}

/**
 * Find sitemaps for a given domain
 */
async function findSitemapsForDomain(baseUrl) {
    // Extract base domain from URL
    let baseDomain = baseUrl;
    if (baseUrl.endsWith('/careers')) {
        baseDomain = baseUrl.substring(0, baseUrl.lastIndexOf('/careers'));
    } else if (baseUrl.endsWith('/jobs')) {
        baseDomain = baseUrl.substring(0, baseUrl.lastIndexOf('/jobs'));
    }

    const results = {
        baseUrl: baseUrl,
        foundSitemaps: [],
        checkedUrls: [],
        jobUrls: []
    };

    // Pattern 1: /careers/sitemap.xml
    const careersSitemap = `${baseDomain}/careers/sitemap.xml`;
    const check1 = await checkUrl(careersSitemap);
    results.checkedUrls.push(check1);
    if (check1.accessible) {
        results.foundSitemaps.push(careersSitemap);
        console.log(`    Found: ${careersSitemap}`);
        console.log(`    Extracting job detail URLs...`);
        const urls = await parseSitemapUrls(careersSitemap);
        results.jobUrls.push(...urls);
        console.log(`    Extracted ${urls.length} job detail URLs`);
    }

    // Pattern 2: /jobs/sitemap.xml
    const jobsSitemap = `${baseDomain}/jobs/sitemap.xml`;
    const check2 = await checkUrl(jobsSitemap);
    results.checkedUrls.push(check2);
    if (check2.accessible) {
        results.foundSitemaps.push(jobsSitemap);
        console.log(`    Found: ${jobsSitemap}`);
        console.log(`    Extracting job detail URLs...`);
        const urls = await parseSitemapUrls(jobsSitemap);
        results.jobUrls.push(...urls);
        console.log(`    Extracted ${urls.length} job detail URLs`);
    }

    // Pattern 3: Check robots.txt
    const robotsUrl = `${baseDomain}/robots.txt`;
    const robotsSitemaps = await parseRobotsTxt(robotsUrl);
    if (robotsSitemaps) {
        for (const sitemap of robotsSitemaps) {
            if (!results.foundSitemaps.includes(sitemap)) {
                results.foundSitemaps.push(sitemap);
                if (sitemap.endsWith('/sitemap.xml')) {
                    console.log(`    Found in robots.txt: ${sitemap}`);
                    console.log(`    Extracting job detail URLs...`);
                    const urls = await parseSitemapUrls(sitemap);
                    results.jobUrls.push(...urls);
                    console.log(`    Extracted ${urls.length} job detail URLs`);
                }
            }
        }
    }

    // Pattern 4: /careers/sitemap_index.xml
    const careersIndex = `${baseDomain}/careers/sitemap_index.xml`;
    const check3 = await checkUrl(careersIndex);
    results.checkedUrls.push(check3);
    if (check3.accessible) {
        console.log(`    Found sitemap index: ${careersIndex}`);
        const indexSitemaps = await parseSitemapIndex(careersIndex);
        if (indexSitemaps) {
            console.log(`    Found ${indexSitemaps.length} sitemaps in index`);
            for (const sitemap of indexSitemaps) {
                if (!results.foundSitemaps.includes(sitemap)) {
                    results.foundSitemaps.push(sitemap);
                }
                // Process all sitemap.xml files (including language-specific ones)
                if (sitemap.endsWith('/sitemap.xml')) {
                    console.log(`    Extracting job URLs from: ${sitemap}`);
                    const urls = await parseSitemapUrls(sitemap);
                    results.jobUrls.push(...urls);
                    console.log(`    Extracted ${urls.length} job detail URLs`);
                    // Small delay to be nice to servers
                    await sleep(50);
                }
            }
        } else {
            results.foundSitemaps.push(careersIndex);
        }
    }

    // Pattern 5: /jobs/sitemap_index.xml
    const jobsIndex = `${baseDomain}/jobs/sitemap_index.xml`;
    const check4 = await checkUrl(jobsIndex);
    results.checkedUrls.push(check4);
    if (check4.accessible) {
        console.log(`    Found sitemap index: ${jobsIndex}`);
        const indexSitemaps = await parseSitemapIndex(jobsIndex);
        if (indexSitemaps) {
            console.log(`    Found ${indexSitemaps.length} sitemaps in index`);
            for (const sitemap of indexSitemaps) {
                if (!results.foundSitemaps.includes(sitemap)) {
                    results.foundSitemaps.push(sitemap);
                }
                // Process all sitemap.xml files (including language-specific ones)
                if (sitemap.endsWith('/sitemap.xml')) {
                    console.log(`    Extracting job URLs from: ${sitemap}`);
                    const urls = await parseSitemapUrls(sitemap);
                    results.jobUrls.push(...urls);
                    console.log(`    Extracted ${urls.length} job detail URLs`);
                    // Small delay to be nice to servers
                    await sleep(50);
                }
            }
        } else {
            results.foundSitemaps.push(jobsIndex);
        }
    }

    // Remove duplicates
    results.foundSitemaps = [...new Set(results.foundSitemaps)];
    results.jobUrls = [...new Set(results.jobUrls)];

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
    console.log(`Checking ${DOMAINS.length} domains for sitemaps and extracting job detail URLs...\n`);

    const allResults = [];

    for (let i = 0; i < DOMAINS.length; i++) {
        const domain = DOMAINS[i];
        console.log(`[${i + 1}/${DOMAINS.length}] Checking ${domain}...`);

        const results = await findSitemapsForDomain(domain);
        allResults.push(results);

        if (results.foundSitemaps.length > 0) {
            console.log(`  ✓ Found ${results.foundSitemaps.length} sitemap(s), ${results.jobUrls.length} job detail URLs`);
        } else {
            console.log(`  ✗ No sitemaps found`);
        }

        // Be nice to the servers
        await sleep(100);
        console.log();
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80) + '\n');

    const totalWithSitemaps = allResults.filter(r => r.foundSitemaps.length > 0).length;
    const totalSitemaps = allResults.reduce((sum, r) => sum + r.foundSitemaps.length, 0);
    const totalJobUrls = allResults.reduce((sum, r) => sum + r.jobUrls.length, 0);

    console.log(`Domains checked: ${DOMAINS.length}`);
    console.log(`Domains with sitemaps: ${totalWithSitemaps}`);
    console.log(`Total sitemaps found: ${totalSitemaps}`);
    console.log(`Total job detail URLs extracted: ${totalJobUrls}`);
    console.log();

    // Export results
    console.log('\nAll found sitemaps (one per line):');
    console.log('-'.repeat(80));
    const allSitemaps = [];
    for (const result of allResults) {
        for (const sitemap of result.foundSitemaps) {
            console.log(sitemap);
            allSitemaps.push(sitemap);
        }
    }

    // Save to file
    const outputContent = allResults.map(result => {
        let content = `# ${result.baseUrl}\n`;
        content += `## Sitemaps:\n`;
        for (const sitemap of result.foundSitemaps) {
            content += `${sitemap}\n`;
        }
        if (result.jobUrls.length > 0) {
            content += `\n## Job Detail URLs (${result.jobUrls.length}):\n`;
            for (const jobUrl of result.jobUrls) {
                content += `${jobUrl}\n`;
            }
        }
        content += '\n';
        return content;
    }).join('');

    fs.writeFileSync('sitemaps_found.txt', outputContent);

    // Save just the sitemap URLs
    fs.writeFileSync('sitemaps_urls_only.txt', allSitemaps.join('\n'));

    // Save all job detail URLs
    const allJobUrls = [];
    for (const result of allResults) {
        allJobUrls.push(...result.jobUrls);
    }
    fs.writeFileSync('job_detail_urls.txt', allJobUrls.join('\n'));

    // Save as JSON
    fs.writeFileSync('sitemaps_found.json', JSON.stringify(allResults, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('Results saved to:');
    console.log('  - sitemaps_found.txt (organized by domain with job detail URLs)');
    console.log('  - sitemaps_urls_only.txt (just sitemap URLs)');
    console.log('  - job_detail_urls.txt (all extracted job detail URLs containing /careers/JobDetail/)');
    console.log('  - sitemaps_found.json (full details)');
    console.log('='.repeat(80));
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { findSitemapsForDomain, checkUrl, parseRobotsTxt, parseSitemapIndex, parseSitemapUrls };
