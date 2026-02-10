# Avature ATS Web Scraper

Input File: [input_file_unique.txt](https://github.com/picaq/avature-ats/blob/main/input_file_unique.txt) <br>
Output File: [application_urls.ndjson](https://github.com/picaq/avature-ats/blob/main/application_urls.ndjson) *

\* note: the final output file(s) exceeds 100 MB and must be hosted outside this repo (Dropbox): 
- [application_urls.ndjson](https://www.dropbox.com/scl/fi/7o51c32mx9jgzk0otbm39/application_urls.ndjson?rlkey=5fefb55e6ghgla2cl6si97vrw&st=xoi1gbnq&dl=0) 
- [output_file.json](https://www.dropbox.com/scl/fi/6h0ec7yujj09jgvk5x6xa/output_file.json?rlkey=sw3n9fq29mgsvx38dxo85vpey&st=h4s84gt7&dl=0)

## install dependencies

```sh
npm install --save got jsdom
```

## Run the subdomain and application URL gathering process

1. filters out all subdomains from WhoisXML API to last seen in 90 days (as of February 7 2026) and has either a response status of OK or redirect. prints results into the console, alongside the number of valid avature subdomains (100 unique subdomains here, but may vary if you modify the)

```sh
node jsonParse.js
```
creates a list of `https://subdomain.avature.net/careers`

2. will take a long time: find sitemap indexes for each valid avature subdomain using robots.txt, then filter them only if they contain "careers" or "jobs"

```sh
node find_job_sitemap_indexes.js                  
```

creates a list of `https://subdomain.avature.net/careers/sitemap_index.xml` or `https://subdomain.avature.net/jobs/sitemap_index.xml` alongside redirected pages' sitemap_index.xml

3. compile all job urls from each sitemap. <br> this will take some time but much less time than step 2

process each `https://subdomain.avature.net/careers/sitemap_index.xml` into `https://subdomain.avature.net/careers/sitemap.xml` to grab all valid job application links

```sh
node scrape_sitemaps.js 
```
outputs sitemap_data.json and job_urls.txt

Total job URLs found in input_file.txt: 95250
Unique job URLs: 74957

koch links needed to be manually extracted from its sitemap via the browser console then manually appended to the end of job_urls.txt to generate input_file.txt. this can be fully automated but is not.

https://koch.avature.net/en_US/careers/sitemap.xml
this was run on the koch sitemap to generate the kochJobs array in koch_job_urls.js

```js
const kochJobs = [...document.querySelectorAll('url loc')].map(x => x.innerHTML).filter(x => x.match("/JobDetail/"));
kochJobs;
```

4. then input_file.txt gets duplicate links removed

```js
node set_size.js
```
converts input_file.txt to input_file_unique.txt

95250 job URLs in total with duplicates removed to 74957

used to generate the **Input File**: `input_file_unique.txt`

5. convert all job urls into json with data

```js
node generateOutputFile_2.js 
```
to generate structured JSON in `output_file.json` from `input_file_unique.txt`

for 74957 job applicationURLs: 
74957 seconds is 20.82 hours to generate the output_file.json if 1 second per job application URL fetch
at 100ms each 7495.7 seconds is 2.0821 hours which is more feasible assuming ideal conditions... but is still not done.....?

If I had more time I should scrape one or two from each subdomain to inspect that the Job Title matched the correct query selector or html tags/classes. I saw in passing that there was a different header in place of Job Title for a series of jobs. I should maybe apply an altered exponential retry logic here.

Printing a truncated version of the description to the console instead of the whole thing would help with checking the Job Title validity/match. The entire job description is too unwieldy for this purpose.

6. stream output to `application_urls.ndjson` instead with a `progress.json` tracker and fetch 6 at a time with concurrency

```js
node generateOutputFile_2.js 
```
# Development Process

## 1. Avature Site Discovery

### Search for all avature.net subdomains

1. google search query: 
```url
inurl:avature.net
```
very few results but most career pages are valid

2. sniff out all subdomains with pen testing toolsites:

- hackertarget.com [Find DNS Host Records (Subdomains)](https://hackertarget.com/find-dns-host-records/) Free limited preview with subdomains + IP addresses, $$/year
- [Subdomains Lookup | Find all subdomains | WhoisXML API](https://subdomains.whoisxmlapi.com/) Free limited JSON preview, Free full-search limited API request with a business (or .edu) email

many results but not all end up being valid career pages. pages can be tested for validity

to get an updated list of `/whoisxmlapi.json` sign up and use their API:

```url
https://subdomains.whoisxmlapi.com/api/v1?apiKey=${API_KEY}&domainName=avature.net
```

## 2. Endpoint Discovery: Find all webpages within subdomain via robots.txt & sitemap

https://bloomberg.avature.net/careers/sitemap.xml
https://nva.avature.net/jobs/sitemap.xml

https://vanoord.avature.net/careers ->
  https://vanoord.avature.net/robots.txt ->
    https://vanoord.avature.net/careers/sitemap_index.xml ->
      https://vanoord.avature.net/en_US/careers/sitemap.xml 
      https://vanoord.avature.net/nl_NL/careers/sitemap.xml 


https://smurfitwestrockta.avature.net/en_US/careers/SearchJobs -> lacks sitemap with indexed jobs, none of the jobs indexed on google but exist on jobright and linkedin, likely posted by the company themselves

https://mckinsey.avature.net/careers redirects to https://jobs.mckinsey.com/ and requires login (blocks sitemap indexing)

asking claude.ai for help:
https://claude.ai/chat/3953616a-b49b-4bcd-8775-5bf6238a66f4


For each sitemap_indexed.xml
https://subdomain.avature.net/careers/sitemap_index.xml
[...document.querySelectorAll('loc')].map(loc => loc.innerHTML).forEach( loc => console.log(loc))

For each https://subdomain.avature.net/*/careers/sitemap.xml or
For each https://subdomain.avature.net/*/jobs/sitemap.xml
[...document.querySelectorAll('url loc')].map(x => x.innerHTML).filter(x => x.match("/JobDetail/")).forEach( x => console.log(x))

## 3. hand-sketch data transformation process

did not end up using the same exact data structure/format, but it was still helpful to visualize it
