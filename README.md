# Avature ATS Web Scraper

## install dependencies

```sh
npm install --save got jsdom
```

## Run the subdomain and application URL gathering process

1. filters out all subdomains from WhoisXML API to last seen in 90 days (as of February 7 2026) and has either a response status of OK or redirect. prints results into the console, alongside the number of valid avature subdomains (100 unique subdomains here)

```sh
node jsonParse.js
```
creates a list of `https://subdomain.avature.net/careers`

2. will take a long time: find sitemap indexes for each valid avature subdomain using robots.txt, then filter them only if they contain "careers" or "jobs"

```sh
node find_sitemaps.js                              
```

creates a list of `https://subdomain.avature.net/careers/sitemap_index.xml` or `https://subdomain.avature.net/jobs/sitemap_index.xml` alongside redirected pages' sitemap_index.xml

3. compile all job urls from each sitemap. <br> this will take some time but much less time than step 2

process each `https://subdomain.avature.net/careers/sitemap_index.xml` into `https://subdomain.avature.net/careers/sitemap.xml` to grab all valid job application links

```sh
node scrape_sitemaps.js 
```
outputs sitemap_data.json and job_urls.txt

Total job URLs found: 94003
Unique job URLs: 73645

koch links needed to be manually extracted from its sitemap via the browser console

93577 job URLs in total

used to generate the **Input File**: `input_file.txt`

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