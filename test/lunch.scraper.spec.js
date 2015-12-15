import assert from 'assert';
import lunchScraper from '../lib/lunch.scraper';

describe('lunch-scraper', function() {
  it('can scrape the lunch data from the web', function() {
    let scrabed = lunchScraper.doScrape();
    assert(scrabed, 'was able to scrable the lunch data!');
  });
});
