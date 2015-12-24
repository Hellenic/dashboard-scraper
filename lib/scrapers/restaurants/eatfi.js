import request from 'request';
import osmosis from 'osmosis';
import sleep from 'sleep';
import cheerio from 'cheerio';

/**
 * Scraper to fetch the restaurant data from Eat.fi
 */
let EatfiScraper = {

  // Let the scraping begin!
  doScrape() {

    let RESTAURANT_BASE_URL = 'http://eat.fi';
    let BASE_URL = 'http://0.0.0.0:3000/api/Restaurants';
    osmosis.config('user_agent', 'Scraperbot/0.1 (+https://github.com/Hellenic/dashboard-scraper)');

    console.log('Starting scraping for Eat.fi restaurants...');

    let leppavaaraEatfiRestaurantsURL = RESTAURANT_BASE_URL + '/eat/area/json?nelat=60.234149525258466&swlat=60.218081158116355&nelng=24.814503707122867&swlng=24.78021434707648';
    request(leppavaaraEatfiRestaurantsURL, function(error, response, body) {
      if (error)
      {
        console.log('Error while retrieving Espoo area Eat.fi restaurants data...');
        return false;
      }

      let restaurantDatas = JSON.parse(body).show;
      restaurantDatas.forEach(data => {
        sleep.sleep(1);

        let id = data[0];
        var osmo = osmosis.get(RESTAURANT_BASE_URL + '/eat/restaurant/go/' + id);
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
          'openingTimes': {
            'days': ['#opening-times-weekly .entries .day-name'],
            'times': ['#opening-times-weekly .entries .day-time-data']
          }
        });

        // Menus might be on the next tab
        // TODO This data can be in any format, depending on the restaurant. It also can be a link somewhere else
        // It would require some heavy logic to parse that so probably not worth it at this point.
        //osmo = osmo.follow('#tabs ul li:nth-child(3) .tabs-data a@href').find('#restaurant-menu').set('menus');

        // Create the restaurant
        osmo = osmo.data(function(restaurant) {
          restaurant.openingTimes = parseOpeningTimes(restaurant.openingTimes);

          // Create the restaurant
          request.post(BASE_URL).form(restaurant);
        });

      });
    });

    return true;
  }
};

function parseOpeningTimes(openings)
{
  let openingTimes = {};
  if (typeof(openings) === "undefined")
  {
    return openings;
  }

  for (var i=0; i<openings.days.length; i++)
  {
    var day = openings.days[i];
    var times = openings.times[i];
    openingTimes[day] = times;
  }

  return openingTimes;
}

export default EatfiScraper;
