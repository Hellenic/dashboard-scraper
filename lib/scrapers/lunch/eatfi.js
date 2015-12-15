import request from 'request';
import osmosis from 'osmosis';
import sleep from 'sleep';

let EatfiScraper = {

  // Let the scraping begin!
  doScrape() {

    let BASE_URL = 'http://eat.fi';

    console.log('Starting scraping for lunch restaurants...');

    let leppavaaraEatfiRestaurantsURL = BASE_URL + '/eat/area/json?nelat=60.234149525258466&swlat=60.218081158116355&nelng=24.814503707122867&swlng=24.78021434707648';
    request(leppavaaraEatfiRestaurantsURL, function(error, response, body) {
      if (error)
      {
        console.log('Error while retrieving Espoo area Eat.fi restaurants data...');
        return false;
      }

      console.log('  * Scraping eat.fi Espoo area restaurants...');

      let restaurantDatas = JSON.parse(body).show;
      let data = restaurantDatas[8];

      //restaurantDatas.forEach(data => {
        sleep.sleep(1);

        let id = data[0];
        let name = data[4];
        var gotoRestaurantURL = '/eat/restaurant/go/' + id;

        console.log('    * Scraping eat.fi restaurant: \'%s\'...', name);
        var osmo = osmosis.get(BASE_URL + gotoRestaurantURL);
        osmo.set({
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
            }
            // 'openingTimes': [
            //   osmo.find('#opening-times-weekly .entries').find('.entry .day-names').set('test')
            // ]
            //'menu': osmosis.follow('//*[@id="tabs"]/ul/li[2]/div[2]/a').find('#restaurant-menu')
          })
          .data(function(restaurant) {
            console.log("Push this to API", restaurant);
          })
          // .log(console.log)
          // .debug(console.log)
          .error(console.log);
      //});
    });

    return true;
  }
};

export default EatfiScraper;
