const express = require('express');
const router = express.Router();
const axios = require("axios");

//Setting a route
router.get('/:ticker/:date/:currency', (req, res) =>{

    //getting parameters from a request (converting them to uppercase)
    var ticker = (req.params.ticker).toUpperCase();
    var date = req.params.date;
    var currency = (req.params.currency).toUpperCase();
    var dict = {};
    
    //making two get requests with axios
    Promise.all([
    axios.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ ticker +'&outputsize=fullt&apikey=' + process.env.ALPHA_API),
    axios.get('https://api.polygon.io/v2/aggs/ticker/C:USD'+currency+'/prev?adjusted=true&apiKey=' + process.env.POLYGON_API)
    ])


    .then ((response) => {
        //checking if a date is in the alphavantage API call
        for (const [key, value] of Object.entries(response[0]['data']['Time Series (Daily)'])){
            if(key === date){
                // if yes, then we populate the dictionary with the date and corresponding price
                dict['date'] = key;
                dict['close'] = (parseFloat(value['4. close'])).toFixed(2);

            };
        }
        //If the dictionary is empty at this moment then no date was matched
        if(Object.keys(dict).length === 0) {
            res.json({message: 'Data for '+ date + ' was not found. Please check data format or try with another date.'});
            return;
        }
        // if a desired currency is USD then we do not need to convert the price
        if(currency == 'USD' ) {
            dict['company'] = ticker;
            dict['currency'] = 'USD';
            res.json(dict);
            return;
        }
        // if other currency is put into the endpoint then we check if such a currency code exists in polygon
        else if(response[1]['data']['results'][0]['c']){

            var exchangeRate = parseFloat(response[1]['data']['results'][0]['c']);

            dict['company'] = ticker;
            //Making a conversion to chosen currency
            dict['close'] = (dict['close']*exchangeRate).toFixed(2);
            dict['currency'] = currency;
            res.json(dict);
            return;
        }
        else{
            // if currency code is invalid then we send a 400 Bad request with a message
            res.status(400).json({message: 'Invalid currency code. Please check the code and try again.'});
            return;
        }




    })
    //checking for errors in the request
    .catch(error => {
	if (error.response) {
		//response status is an error code
		res.json({message: 'Invalid response code'});
		return;
	}
	else if (error.request) {
		//response not received though the request was sent
		res.status(400).json({message: 'No response was received on the call.'});
		return;
	}
	else {
		//an error occurred when setting up the request
		res.status(400).json({message: 'Invalid URL. Please check currency code and stock symbol.'});
		return;
	}
    })


})

module.exports = router;