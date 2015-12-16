import request from 'request';
import osmosis from 'osmosis';
import sleep from 'sleep';

/**
 * Scraper to fetch the restaurant data from Raflaamo.fi
 */
let RaflaamoScraper = {

  // Let the scraping begin!
  doScrape() {

    console.log('Starting scraping for Raflaamo restaurants...');

    let raflaamoRestaurantsURL = 'http://www.raflaamo.fi/raflaamo-data/restaurants/lunch?lat=60.205555&lon=24.655556&locale=fi_FI&city=Espoo';
    request(raflaamoRestaurantsURL, function(error, response, body) {
      if (error)
      {
        console.log('Error while retrieving Espoo area Raflaamo restaurants data...');
        return false;
      }

      let restaurantDatas = JSON.parse(body);

      // Parse Raflaamo data
      restaurantDatas.lunchcards.forEach(lunchcard => {
        var restaurant = {
          name: lunchcard.restaurant,
          phone: lunchcard.phone,
          url: lunchcard.siteUrl,
          type: lunchcard.chain,
          description: '',
          category: '',
          street: lunchcard.streetAddress,
          city: lunchcard.city,
          postalCode: '',
          country: 'Finland',
          coordinates: {},
          openingTimes: lunchcard.opening_times_weeks.openingTimesColumns, // TODO Check opening_times_weeks.openingTimesWeeknumbers
          menu: lunchcard.menu,
        };

        console.log('      ==> Posting Raflaamo restaurant: \'%s\' to Dashboard API...', restaurant.name);
        request.post('http://0.0.0.0:3000/api/Restaurants').form(restaurant);
      });
    });

    return true;
  }
};

export default RaflaamoScraper;
