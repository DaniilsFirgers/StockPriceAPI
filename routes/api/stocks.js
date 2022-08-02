const express = require('express');
const router = express.Router();
const axios = require("axios");


router.get('/:ticker/:date/:currency', (req, res) =>{

    var ticker = (req.params.ticker).toUpperCase();
    var date = req.params.date;
    var currency = (req.params.currency).toUpperCase();
    var dict = {};

    Promise.all([
    axios.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ ticker +'&outputsize=compact&apikey=' + process.env.ALPHA_API),
    axios.get('https://api.polygon.io/v2/aggs/ticker/C:USD'+currency+'/prev?adjusted=true&apiKey=' + process.env.POLYGON_API)
    ])


    .then ((response) => {

        for (const [key, value] of Object.entries(response[0]['data']['Time Series (Daily)'])){
            if(key === date){
                dict['date'] = key;
                dict['close'] = (parseFloat(value['4. close'])).toFixed(2);

            };
        }

        if(Object.keys(dict).length === 0) {
            res.json({message: 'Data for '+ date + ' was not found. Please check data format or try with another date.'});
            return;
        }

        if(currency == 'USD' ) {
            dict['company'] = ticker;
            dict['currency'] = 'USD';
            res.json(dict);
            return;
        }
        else if(response[1]['data']['results'][0]['c']){

            var exchangeRate = parseFloat(response[1]['data']['results'][0]['c']);

            dict['company'] = ticker;
            dict['close'] = (dict['close']*exchangeRate).toFixed(2);
            dict['currency'] = currency;
            res.json(dict);
            return;
        }
        else{
            res.status(400).json({message: 'Invalid currency code. Please check the code and try again.'});
            return;
        }




    })

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