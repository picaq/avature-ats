# Avature ATS Web Scraper

## Run the program


## Search for all avature.net subdomains

1. google search query: 
```url
inurl:avature.net
```
very few results but most career pages are valid

2. sniff out all subdomains with pen testing toolsites:

- hackertarget.com [Find DNS Host Records (Subdomains)](https://hackertarget.com/find-dns-host-records/) Free limited preview with subdomains + IP addresses, $$/year
- [Subdomains Lookup | Find all subdomains | WhoisXML API](https://subdomains.whoisxmlapi.com/) Free limited JSON preview, Free full-search limited API request with a business (or .edu) email

many results but not all end up being valid career pages

to get an updated list of `/whoisxmlapi.json` sign up and use their API:

```url
https://subdomains.whoisxmlapi.com/api/v1?apiKey=${API_KEY}&domainName=avature.net
```

## Find all webpages within subdomain via robots.txt & sitemap
https://bloomberg.avature.net/careers/sitemap.xml
https://nva.avature.net/jobs/sitemap.xml

https://vanoord.avature.net/careers ->
  https://vanoord.avature.net/robots.txt ->
    https://vanoord.avature.net/careers/sitemap_index.xml ->
      https://vanoord.avature.net/en_US/careers/sitemap.xml 
      https://vanoord.avature.net/nl_NL/careers/sitemap.xml 

    
