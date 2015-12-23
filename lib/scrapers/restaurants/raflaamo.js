import request from 'request';
import osmosis from 'osmosis';
import moment from 'moment';

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
          openingTimes: parseOpeningTimes(lunchcard.opening_times_weeks.openingTimesColumns)
        };

        var BASE_URL = 'http://0.0.0.0:3000/api/Restaurants';
        // Create the restaurant
        request.post({url: BASE_URL, form: restaurant}, function(err, httpResponse, body) {
          var model = JSON.parse(body);

          if (typeof(lunchcard.menu) === "undefined")
            return;

          // Create new menu entries for the restaurant
          lunchcard.menu.forEach(menu => {
            // Raflaamo has portions separated...
            menu.portions.forEach(portion => {

              var menuitem = {
                name: portion.name,
                validFrom: moment(menu.validFromTime, 'hh:mm').format(),
                validTo: moment(menu.validToTime, 'hh:mm').format(),
                properties: portion.dietTypes.join(',')
              };

              request.post(BASE_URL + '/' + model.id + '/menus').form(menuitem);
            });
          });
        });
      });
    });

    return true;
  }
};

function parseOpeningTimes(weekTimes)
{
  var openingTimes = {};

  // weekTimes is an array. First one is for current week.
  // See lunchcard.opening_times_weeks.openingTimesWeeknumbers for possible weeks. Each week has an entry on weekTimes list.
  var weekTime = weekTimes[0];
  weekTime.split('<br/>').map(function(time) {
    var day = time.split(' ')[0];
    var times = time.split(' ')[1];
    
    openingTimes[day] = times;
  });

  return openingTimes;
}

export default RaflaamoScraper;
