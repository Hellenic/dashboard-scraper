import request from 'request';
import osmosis from 'osmosis';
import cheerio from 'cheerio';
import moment from 'moment';
import sleep from 'sleep';

/**
 * Scraper to fetch the restaurant data from Amica.fi
 */
let AmicaScraper = {

  doScrape() {

    let RESTAURANT_BASE_URL = 'http://www.amica.fi';

    console.log('Starting scraping for Amica restaurants...');
    osmosis.config('user_agent', 'Scraperbot/0.1 (+https://github.com/Hellenic/dashboard-scraper)');

    // Search restaurants: http://www.amica.fi/api/search/FindSearchResults?language=fi&page=1&pageSize=20&query=Helsinki
    //  * language, page, pageSize, query
    // Restaraunt info + menu: http://www.amica.fi/modules/json/json/Index?costNumber=3511&firstDay=2015-12-15&lastDay=2015-12-16&language=fi
    //  * Params: costNumber, firstDay, lastDay, language
    // Menu of the day: http://www.amica.fi/api/restaurant/menu/day?date=2015-12-16&language=fi&restaurantPageId=8961
    //  * Params: restaurantPageId, date, language
    // Menu of the week: http://www.amica.fi/api/restaurant/menu/week?language=fi&restaurantPageId=8961&weekDate=2015-12-16
    //  * Params: restaurantPageId, weekDate, language

    let amicaRestaurantsURL = '/api/search/FindSearchResults?language=fi&page=1&pageSize=20&query=Helsinki';
    request(RESTAURANT_BASE_URL + amicaRestaurantsURL, function(error, response, body) {
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

        // Get basic information from the main page
        osmosis
          .get(RESTAURANT_BASE_URL + r.Url)
          .set({
            'phone': '//*[@id="restaurantPageContainer"]/div[1]/div/div/div/div/div/div[1]/span[2]/span/a',
            'description': '//*[@id="restaurantPageContainer"]/div[1]/div/div/div/div/div/h5',
            'coordinates': {
              'latitude': '//*[@id="restaurantPageContainer"]/div[1]/div/div/div/div/div/div[2]/div[2]/span',
              'longitude': '//*[@id="restaurantPageContainer"]/div[1]/div/div/div/div/div/div[2]/div[2]/span'
            },
            'openingTimes': '//*[@id="restaurantPageContainer"]/div[1]/div/div/div/div/div/div[1]/div',
            'costNumber': '//*[@id="menuContainer"]/div[1]/div/div[1]/div[2]/div[3]/div[2]/a[3]:html'
          })
          .data(function(partial) {
            restaurant.phone = partial.phone;
            restaurant.category = partial.category;
            restaurant.coordinates = partial.coordinates;
            restaurant.openingTimes = parseOpeningTimes(partial.openingTimes);

            var BASE_URL = 'http://0.0.0.0:3000/api/Restaurants';
            // Create the restaurant
            request.post({url: BASE_URL, form: restaurant}, function(err, httpResponse, body) {
              var model = JSON.parse(body);

              // Get and create the menus
              let costNumber = parseCostNumber(partial.costNumber);
              costNumber = 3511;
              let firstDay = '2015-12-24', lastDay = '2015-12-28'; // Optional params

              let restaurantDetailsURL = RESTAURANT_BASE_URL + '/modules/json/json/Index?costNumber='+costNumber+'&firstDay='+firstDay+'&lastDay='+lastDay+'&language=fi';
              request(restaurantDetailsURL, function(error, response, body) {
                if (error)
                {
                  console.log('Error while retrieving Amica \'%s\' menu data...', r.ShortTitle);
                  return false;
                }

                let restaurantData = JSON.parse(body);
                if (restaurantData.MenusForDays)
                {
                  let menus = parseMenus(restaurantData.MenusForDays);
                  menus.map(function(menuitem) {
                    // request.post(BASE_URL +'/'+ model.id +'/menus').form(menuitem);
                  })
                }
              });

            });
          });

      // });

    });

    return true;
  }
};

function parseCostNumber(costNumberHtml)
{
  let $ = cheerio.load(costNumberHtml);
  let href = $('a').attr('href');

  let paramName = 'costNumber=';
  let paramStart = href.indexOf(paramName);
  let paramEnd = href.indexOf('&', paramStart);

  let costNumber = href.substring(paramStart+paramName.length, paramEnd);

  return costNumber;
}

function parseOpeningTimes(openings)
{
  let openingTimes = {};
  if (typeof(openings) === "undefined")
  {
    return openings;
  }

  openings.split(',').map(function(times) {
    times = times.trim();

    var day = times.substring(0, times.indexOf(' '));
    var time = times.substring(day.length+1);

    openingTimes[day] = time;
  });

  return openingTimes;
}

function parseMenus(MenusForDays)
{
  let menus = [];

  MenusForDays.map(function(daymenu) {
    
    if (daymenu.Date == null || daymenu.LunchTime == null)
      return;

    // We are only interested in todays menu
    if (!moment(daymenu.Date).isSame(moment()))
      return;

    let date = moment(daymenu.Date);
    let times = daymenu.LunchTime.split('-'); // Format: 10.30 - 13.00
    let validFrom = times[0].trim().split('.'); // Format: 10.30
    let validTo = times[1].trim().split('.'); // Format: 13.00

    let validFromDate = date.hour(validFrom[0]).minute(validFrom[1]).format();
    let validToDate = date.hour(validTo[0]).minute(validTo[1]).format();

    var menuitem = {
      name: '',
      validFrom: validFromDate,
      validTo: validToDate,
      price: '',
      properties: ''
    };

    console.log("Menuitem", menuitem);
    daymenu.SetMenus.map(function(menu) {


      menus.push(menuitem);
    });

  });

  return menus;
}

export default AmicaScraper;
