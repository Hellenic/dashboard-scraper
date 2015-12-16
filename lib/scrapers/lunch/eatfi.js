import request from 'request';
import osmosis from 'osmosis';
import sleep from 'sleep';

/**
 * Scraper to fetch the restaurant data from Eat.fi
 */
let EatfiScraper = {

  // Let the scraping begin!
  doScrape() {

    let BASE_URL = 'http://eat.fi';

    console.log('Starting scraping for Eat.fi restaurants...');

    let leppavaaraEatfiRestaurantsURL = BASE_URL + '/eat/area/json?nelat=60.234149525258466&swlat=60.218081158116355&nelng=24.814503707122867&swlng=24.78021434707648';
    request(leppavaaraEatfiRestaurantsURL, function(error, response, body) {
      if (error)
      {
        console.log('Error while retrieving Espoo area Eat.fi restaurants data...');
        return false;
      }

      console.log('  * Scraping eat.fi Espoo area restaurants...');
      let restaurantDatas = JSON.parse(body).show;
      restaurantDatas.forEach(data => {
        sleep.sleep(1);

        let id = data[0];
        let name = data[4];
        var gotoRestaurantURL = '/eat/restaurant/go/' + id;

        console.log('    * Scraping eat.fi restaurant: \'%s\'...', name);
        var osmo = osmosis.get(BASE_URL + gotoRestaurantURL);
        // Get basic information from the main page
        osmo = osmo.set({
          'name': '#restaurant-info h1 a',
          'phone': '//*[@id="restaurant-contact"]/div[1]/div[2]/div[2]',
          'url': '//*[@id="restaurant-contact"]/div[1]/div[3]/div[2]/a',
          'type': '//*[@id="restaurant-description"]',
          'description': '//*[@id="restaurant-longdescription"]/div/strong',
          'category': '//*[@id="category-small-1"]/a/div',
          'street': '//*[@id="content-header"]/div[3]/div[3]/div[2]',
          'city': '//*[@id="content-header"]/div[3]/div[3]/div[3]',
          'postalCode': '//*[@id="content-header"]/div[3]/div[3]/div[4]',
          'country': '//*[@id="content-header"]/div[3]/div[3]/div[5]',
          'coordinates': {
            'latitude': '//*[@id="content-header"]/div[3]/div[4]/div[1]',
            'longitude': '//*[@id="content-header"]/div[3]/div[4]/div[2]'
          },
          'openingTimes': '#opening-times-weekly .entries'
        });

        // The the menus from the next tab
        osmo = osmo.follow('#tabs ul li:nth-child(3) .tabs-data a@href').find("#restaurant-menu").set('menu');
        osmo = osmo.data(function(restaurant) {
          console.log('      ==> Posting eat.fi restaurant: \'%s\' to Dashboard API...', restaurant.name);
          request.post('http://0.0.0.0:3000/api/Restaurants').form(restaurant);
        });
      });
    });

    return true;
  }
};

export default EatfiScraper;
