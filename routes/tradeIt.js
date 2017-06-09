var express = require('express');
var request = require('request');
var router = express.Router();
var parser = require('body-parser');
var urlencodedParser = parser.urlencoded({ extended: false });
var jsonParser = parser.json();
var cookie = require('cookie');

var postData = {};

var options = {
    method: 'post',
    body: postData,
    json: true,
    url: ''
};

/*************************************************/
/* Request to getStocksOrEtfsBrokerList endpoint */
/*************************************************/
router.get('/', function(req, resp, next) {
    postData.apiKey = 'tradeit-test-api-key';
    options.url = 'https://ems.qa.tradingticket.com/api/v1/preference/getStocksOrEtfsBrokerList';

    function callback(err, res, body) {
        if(err){
            resp.render('error');
        }
        resp.render('index', { list: body.brokerList, apiKey: postData.apiKey });
    };

    request(options, callback)
});


/********************************************************/
/* After user successfully authenticated                */
/* Select accountNumber for Portfolio or trading        */
/*                                                      */
/* Remark#1: Make sure user data such as                */
/* userId, userToken are saved in db                    */
/* instead of saving in cookies in here                 */
/* Remark#2: /getAccountOverview is called as ajax and  */
/* /getPosition is called sever-side                    */
/********************************************************/
router.post('/authenticated', urlencodedParser, function(req, resp, next){
    var cookies = cookie.parse(req.headers.cookie);
    var accountsJson = JSON.parse(cookies.accounts);

    var userData = {}
    userData.accountList = accountsJson;
    userData.sessionToken = cookies.sessionToken;
    userData.apiKey = cookies.apiKey;

    resp.render('authConfirmed', {userData: userData})
});

router.post('/portfolio', urlencodedParser, function(req, resp, next){
    options.url = 'https://ems.qa.tradingticket.com/api/v1/balance/getAccountOverview';
    var cookies = cookie.parse(req.headers.cookie);
    postData.token = cookies.sessionToken;
    postData.accountNumber = req.body.account;

    function callback(err, res, body) {
        if(err){
            resp.render('error');
        }
        var balanceData = body
        balanceData.accountNumber = postData.accountNumber
        resp.render('portfolio', {accountOverview: balanceData});
    };

    request(options, callback)
});

/*********************************/
/* Go to a trading ticket screen */
/*********************************/
router.post('/tradingTicket', urlencodedParser, function(req, resp, next){
    resp.render('tradingTicket', {data: req.body});
});

router.post('/authError', urlencodedParser, function(req, resp, next){
    resp.render('requestError', {data: req.body});
});

module.exports = router;
