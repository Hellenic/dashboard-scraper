import request from 'request';

/**
 * Initial data for Finnish flag days
 */
let FinnishFlagDays = {

  // This file isn't actually directly scraped from the web
  // Instead of it is pre-fetched with Gulp every now and then
  doScrape() {

    console.log('Starting scraping for Finnish Flag days...');

    // So we just need to parse the file and push it to the API
    var finnishFlagDaysData = require('../../data/Liputuspäivät.json');
    for (var i=0; i<finnishFlagDaysData.length; i++)
    {
      var flagDay = finnishFlagDaysData[i];
      flagDay.locale = "FI";
      flagDay.country = "Finland";

      console.log('      ==> Posting Finnish Flag Day \'%s\' to Dashboard API...', flagDay.name);
      request.post('http://0.0.0.0:3000/api/FlagDays').form(flagDay);
    }
  }
};

export default FinnishFlagDays;
