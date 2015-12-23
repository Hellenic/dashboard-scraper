import request from 'request';
import osmosis from 'osmosis';
import sleep from 'sleep';

/**
 * Scraper to fetch the restaurant data from Amica.fi
 */
let AmicaScraper = {

  // Let the scraping begin!
  doScrape() {

    let BASE_URL = 'http://www.amica.fi';

    console.log('Starting scraping for Amica restaurants...');

    // Search restaurants: http://www.amica.fi/api/search/FindSearchResults?language=fi&page=1&pageSize=20&query=Helsinki
    //  * language, page, pageSize, query
    // Restaraunt info + menu: http://www.amica.fi/modules/json/json/Index?costNumber=3511&firstDay=2015-12-15&lastDay=2015-12-16&language=fi
    //  * Params: costNumber, firstDay, lastDay, language
    // Menu of the day: http://www.amica.fi/api/restaurant/menu/day?date=2015-12-16&language=fi&restaurantPageId=8961
    //  * Params: restaurantPageId, date, language
    // Menu of the week: http://www.amica.fi/api/restaurant/menu/week?language=fi&restaurantPageId=8961&weekDate=2015-12-16
    //  * Params: restaurantPageId, weekDate, language

    let amicaRestaurantsURL = '/api/search/FindSearchResults?language=fi&page=1&pageSize=20&query=Helsinki';
    request(BASE_URL + amicaRestaurantsURL, function(error, response, body) {
      if (error)
      {
        console.log('Error while retrieving Amica, Helsinki restaurants data...');
        return false;
      }

      console.log('  * Scraping Amica Helsinki area restaurants...');
      let restaurantDatas = JSON.parse(body);

      var r = restaurantDatas.Hits[0];
      // restaurantDatas.filter(function(r) { return r.Type == 'restaurant'; })
      // restaurantDatas.forEach(r => {
        sleep.sleep(1);

        var restaurant = {
          name: r.ShortTitle,
          url: r.Url,
          type: r.Type,
          category: '',
          street: r.StreetAddress,
          city: r.City,
          postalCode: r.PostalCode,
          country: 'Finland'
        };

        console.log('    * Scraping Amica restaurant: \'%s\'...', r.ShortTitle);
        // Get basic information from the main page
        osmosis
          .get(BASE_URL + r.Url)
          .set({
            'phone': '//*[@id="restaurantPageContainer"]/div[1]/div/div/div/div/div/div[1]/span[2]/span/a',
            'description': '//*[@id="restaurantPageContainer"]/div[1]/div/div/div/div/div/h5',
            'coordinates': {
              'latitude': '//*[@id="restaurantPageContainer"]/div[1]/div/div/div/div/div/div[2]/div[2]/span',
              'longitude': '//*[@id="restaurantPageContainer"]/div[1]/div/div/div/div/div/div[2]/div[2]/span'
            },
            'openingTimes': '//*[@id="restaurantPageContainer"]/div[1]/div/div/div/div/div/div[1]/div',
            'costNumber': '//*[@id="menuContainer"]/div[1]/div/div[1]/div[2]/div[3]/div[2]/a[3]'
          })
          .data(function(partial) {
            restaurant.phone = partial.phone;
            restaurant.category = partial.category;
            restaurant.coordinates = partial.coordinates;
            restaurant.openingTimes = partial.openingTimes;

            /*
            // Finally, get the menu
            // TODO Finalize this
            let costNumber = parseNumber(partial.costNumber);
            let firstDay = '2015-12-15', lastDay = '2015-12-15';
            request(BASE_URL + '/modules/json/json/Index?costNumber='+partial.costNumber+'&firstDay='+firstDay+'&lastDay='+lastDay+'&language=fi', function(error, response, body) {
              if (error)
              {
                console.log('Error while retrieving Amica \'%s\' menu data...', r.ShortTitle);
                return false;
              }

              let restaurantData = JSON.parse(body);
              restaurant.menu = restaurantData.MenusForDays;

              console.log('      ==> Posting Amica restaurant: \'%s\' to Dashboard API...', restaurant.name);
              request.post('http://0.0.0.0:3000/api/Restaurants').form(restaurant);
            });
            */
          })
          .log(console.log)
          .error(console.log)
          .debug(console.log);

      // });

    });

    return true;
  }
};

// Menu: name, validFrom, validTo, price, properties
function getMenus(lunches)
{

}

export default AmicaScraper;
