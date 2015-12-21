import request from 'request';

/**
 * Initial data for Finnish flag days
 */
let FinnishSpecialDays = {

  // This file isn't actually directly scraped from the web
  // Instead of it is pre-fetched with Gulp every now and then
  doScrape() {

    // So we just need to parse the file and push it to the API
    console.log('Starting scraping for Finnish special days...');

    // First for flag days
    var dayDatas = require('../../data/Liputuspäivät.json');
    dayDatas.forEach(function(day, index) {
      day.locale = 'FI';
      day.country = 'Finland';

      console.log('      ==> Posting Finnish flag day \'%s\' to Dashboard API...', day.name);
      request.post('http://0.0.0.0:3000/api/SpecialDays').form(day);
    });

    // Then other days
    var dayDatas = require('../../data/Pyhät.json');
    dayDatas.forEach(function(day, index) {
      day.locale = 'FI';
      day.country = 'Finland';

      console.log('      ==> Posting Finnish holidays \'%s\' to Dashboard API...', day.name);
      request.post('http://0.0.0.0:3000/api/SpecialDays').form(day);
    });
  }
};

export default FinnishSpecialDays;
