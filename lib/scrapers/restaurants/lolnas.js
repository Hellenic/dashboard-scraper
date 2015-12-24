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
    osmosis.config('user_agent', 'Scraperbot/0.1 (+https://github.com/Hellenic/dashboard-scraper)');

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
          openingTimes: {}
        }

        var BASE_URL = 'http://0.0.0.0:3000/api/Restaurants';
        // Create the restaurant
        request.post({url: BASE_URL, form: restaurant}, function(err, httpResponse, body) {
          var model = JSON.parse(body);

          // Create new menu entries for the restaurant
          r.lunches.forEach(lunch => {
            var menuitem = {
              name: lunch.title,
              // validFrom: '',
              // validTo: '',
              price: lunch.price,
              properties: ''
            };
            request.post(BASE_URL + '/' + model.id + '/menus').form(menuitem);
          });
        });

      });
    });

    return true;
  }
};

export default LolnasScraper;
