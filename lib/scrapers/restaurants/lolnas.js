import request from 'request';
import osmosis from 'osmosis';
import sleep from 'sleep';

/**
 * Scraper to fetch the restaurant data from lolnas.fi
 */
let LolnasScraper = {

  // Let the scraping begin!
  doScrape() {

    console.log('Starting scraping for Lolnas restaurants...');

    request('http://www.lolnas.fi/api/restaurants.json', function(error, response, body) {
      if (error)
      {
        console.log('Error while retrieving Lolnas restaurants data...');
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
          menu: r.lunches
        }
        
        console.log('      ==> Posting Lolnas restaurant: \'%s\' to Dashboard API...', restaurant.name);
        request.post('http://0.0.0.0:3000/api/Restaurants').form(restaurant);

      });
    });

    return true;
  }
};

export default LolnasScraper;
