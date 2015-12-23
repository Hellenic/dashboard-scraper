import EatfiScraper from './scrapers/restaurants/eatfi';
import RaflaamoScraper from './scrapers/restaurants/raflaamo';
import AmicaScraper from './scrapers/restaurants/amica';
import LolnasScraper from './scrapers/restaurants/lolnas';
import LounaatScraper from './scrapers/restaurants/lounaat';
import FSDScraper from './scrapers/finnishSpecialDays';

// Done
LolnasScraper.doScrape();
RaflaamoScraper.doScrape();
FSDScraper.doScrape();

// WIP
// EatfiScraper.doScrape();
// AmicaScraper.doScrape();
// LounaatScraper.doScrape();
