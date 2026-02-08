# Avature Sitemap Finder (Node.js)

A Node.js script to automatically find sitemap.xml URLs for Avature career sites.

## Features

- ✅ Checks multiple common sitemap patterns
- ✅ Parses `robots.txt` for sitemap references
- ✅ Handles sitemap index files with language-specific sitemaps
- ✅ Exports results in multiple formats (TXT, JSON)
- ✅ No external dependencies (uses only Node.js built-ins)

## Requirements

- Node.js 12.0.0 or higher
- No npm packages required!

## Installation

No installation needed! Just download the script.

```bash
# Make it executable (Unix/Linux/Mac)
chmod +x find_sitemaps.js
```

## Usage

### Run the script

```bash
# Using node
node find_sitemaps.js

# Or if executable
./find_sitemaps.js

# Or using npm script
npm start
```

### What it checks

For each domain, the script checks these patterns:

1. `{domain}/careers/sitemap.xml`
2. `{domain}/jobs/sitemap.xml`
3. `{domain}/robots.txt` → parses for Sitemap: directives
4. `{domain}/careers/sitemap_index.xml` → parses for language-specific sitemaps
5. `{domain}/jobs/sitemap_index.xml` → parses for language-specific sitemaps

### Example output

```
[1/100] Checking https://epic.avature.net/careers...
  ✓ Found 2 sitemap(s):
    - https://epic.avature.net/careers/sitemap.xml
    - https://epic.avature.net/robots.txt (reference)

[2/100] Checking https://bloomberg.avature.net/careers...
  ✓ Found 1 sitemap(s):
    - https://bloomberg.avature.net/careers/sitemap.xml

[3/100] Checking https://vanoord.avature.net/careers...
  ✓ Found 3 sitemap(s):
    - https://vanoord.avature.net/careers/sitemap_index.xml
    - https://vanoord.avature.net/en_US/careers/sitemap.xml
    - https://vanoord.avature.net/nl_NL/careers/sitemap.xml
```

## Output Files

The script generates three output files:

1. **sitemaps_found.txt** - Organized by domain with headers
2. **sitemaps_urls_only.txt** - Just the URLs, one per line
3. **sitemaps_found.json** - Full JSON with all details and metadata

## Patterns Observed

Based on testing, Avature sites typically use:

- **Most common**: `/careers/sitemap.xml`
- **Alternative**: `/jobs/sitemap.xml`
- **Multi-language**: `/careers/sitemap_index.xml` → language-specific files
- **Documented**: Check `robots.txt` for additional sitemaps

## Example Confirmed Working Sitemaps

- ✅ `bloomberg.avature.net/careers/sitemap.xml`
- ✅ `nva.avature.net/jobs/sitemap.xml`
- ✅ `vanoord.avature.net/careers/sitemap_index.xml`
  - → `vanoord.avature.net/en_US/careers/sitemap.xml`
  - → `vanoord.avature.net/nl_NL/careers/sitemap.xml`

## Customization

To check different domains, edit the `DOMAINS` array in `find_sitemaps.js`:

```javascript
const DOMAINS = [
    'https://yourcompany.avature.net/careers',
    'https://another.avature.net/careers',
    // ... add more
];
```

## Use as Module

You can also import and use the functions programmatically:

```javascript
const { findSitemapsForDomain, checkUrl } = require('./find_sitemaps.js');

async function example() {
    const results = await findSitemapsForDomain('https://epic.avature.net/careers');
    console.log(results.foundSitemaps);
}
```

## Rate Limiting

The script includes a 500ms delay between requests to be respectful to the servers.

## License

MIT
