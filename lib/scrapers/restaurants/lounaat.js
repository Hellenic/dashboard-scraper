import request from 'request';
import osmosis from 'osmosis';
import sleep from 'sleep';

/**
 * Scraper to fetch the restaurant data from Lounaat.info
 */
let LounaatScraper = {

  doScrape() {

    console.log('Starting scraping for Lounaat.info restaurants...');
    osmosis.config('user_agent', 'Scraperbot/0.1 (+https://github.com/Hellenic/dashboard-scraper)');

    request('http://www.lounaat.info/', function(error, response, body) {
      if (error)
      {
        console.log('Error while retrieving Lounaat.info restaurants data...');
        return false;
      }

      let restaurantDatas = JSON.parse(body);

      restaurantDatas.restaurants.forEach(r => {

        var restaurant = {
          name: r.name,
          url: r.url,
          phone: '',
          type: '',
          description: '',
          category: '',
          street: '',
          city: '',
          postalCode: '',
          country: 'Finland',
          coordinates: {
            latitude: r.latitude,
            longitude: r.longitude
          },
          openingTimes: {},
          menu: {}
        }

      });
    });

    return true;
  }
};

// Menu: name, validFrom, validTo, price, properties
function getMenus(lunches)
{

}

export default LounaatScraper;
