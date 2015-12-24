# dashboard-scraper [![Dependency Status][daviddm-image]][daviddm-url]
> Data scraper for the Dashboard API

This scraper fetches data from some public APIs or websites, handles the data
and then passes it on to the dashboard-backend.

The data is used in personal use only and the data is scraper manually, maximum
once per day.

## Usage

Build changes with:
```
gulp
```
Pre-fetch data with:
```
gulp prefetch
```
Run tests with:
```
gulp test
```

Install dependencies with:
```
npm install
```

Run scraping with (do not run this often)
```
npm run scrape
```

## License

MIT © [Hannu Kärkkäinen](http://blankpace.net/HK/)


[npm-image]: https://badge.fury.io/js/dashboard-scraper.svg
[npm-url]: https://npmjs.org/package/dashboard-scraper
[travis-image]: https://travis-ci.org/Hellenic/dashboard-scraper.svg?branch=master
[travis-url]: https://travis-ci.org/Hellenic/dashboard-scraper
[daviddm-image]: https://david-dm.org/Hellenic/dashboard-scraper.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/Hellenic/dashboard-scraper
