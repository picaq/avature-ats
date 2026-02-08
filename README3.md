# Sitemap Job URL Scraper

This script crawls through sitemap indexes to extract all job detail URLs.

## What it does

1. **Fetches each sitemap index** - Retrieves the main sitemap index XML
2. **Extracts sitemap URLs** - Parses all `<loc>` tags from the index
3. **Fetches individual sitemaps** - Retrieves each sitemap found in the index
4. **Filters job URLs** - Extracts URLs containing "careers/JobDetail/"
5. **Saves results** - Outputs all URLs to text files and JSON

## How to run

### Prerequisites
- Node.js (version 18 or higher for native fetch support)

### Run the script

```bash
node scrape_sitemaps.js
```

## Output files

The script generates three files:

1. **job_urls.txt** - Plain text file with one URL per line (all job detail URLs)
2. **sitemap_data.json** - Structured JSON with data organized by sitemap index
3. **statistics.txt** - Summary statistics and breakdown by sitemap

## Features

- **Error handling** - Continues processing even if individual sitemaps fail
- **Rate limiting** - Includes delays between requests to be respectful to servers
- **Progress tracking** - Shows real-time progress in the console
- **Deduplication stats** - Reports both total and unique URL counts

## Notes

- The script processes **88 sitemap indexes** which may contain hundreds of individual sitemaps
- **Estimated runtime**: 10-30 minutes depending on network speed and number of sitemaps
- Includes 100ms delay between sitemaps and 500ms between sitemap indexes
- If a sitemap fails to load, the script logs the error and continues

## Troubleshooting

**Error: fetch is not defined**
- You need Node.js version 18 or higher
- Alternatively, install node-fetch: `npm install node-fetch`

**Network timeouts**
- The script will log errors and continue with remaining sitemaps
- You can re-run to attempt failed sitemaps again

## Example output

```
Starting to process 88 sitemap indexes...

[1/88] Processing: https://careers.ibm.com/careers/sitemap_index.xml
  Found 12 sitemaps
    [1/12] Fetching sitemap...
      ✓ Found 243 job detail URLs
    [2/12] Fetching sitemap...
      ✓ Found 187 job detail URLs
  ...
  Total job URLs from this index: 1,234

=== SUMMARY ===
Total job URLs found: 45,678
Unique job URLs: 45,234

✓ Saved all URLs to job_urls.txt
✓ Saved structured data to sitemap_data.json
✓ Saved statistics to statistics.txt
```
