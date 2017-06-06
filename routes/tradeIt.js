var express = require('express');
var request = require('request');
var router = express.Router();
var parser = require('body-parser');
var urlencodedParser = parser.urlencoded({ extended: false });
var jsonParser = parser.json();

global.userData = {};

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
    postData = {};
    postData.apiKey = 'tradeit-test-api-key';
    options.url = 'https://ems.qa.tradingticket.com/api/v1/preference/getStocksOrEtfsBrokerList';

    function callback(err, res, body) {
        if(err){
            resp.render('error');
        }
        resp.render('index', { list: body.brokerList });
    };

    request(options, callback)
});

router.post('/', jsonParser, function(req, resp, next){

});

/********************************************************/
/* After user successfully authenticated                */
/* Select accountNumber for Portfolio or trading        */
/* Remark#1: Make sure user data such as                */
/*  userId, userToken, sessionToken... are saved in db  */
/*  instead of passing them around like here            */
/* Remark#2: /getAccountOverview is called as ajax and  */
/*  /getPosition is called sever-side                   */
/********************************************************/
router.post('/authenticated', urlencodedParser, function(req, resp, next){
    userData.userId = req.body.userId;
    userData.userToken = req.body.userToken;
    userData.sessionToken = req.body.sessionToken;
    userData.broker = req.body.broker;
    userData.apiKey = postData.apiKey

    //don't do this
    var accounts = []
    for(var i = 0; i < req.body.numberOfAccounts; i++){
        var account = {}
        var accountNo = "accountNo" + i;
        var accountName = "accountName" + i;
        account.accountNumber = req.body[accountNo];
        account.name = req.body[accountName];

        accounts.push(account)
    }
    userData.accountList = accounts

    resp.render('authConfirmed', {userData: userData})
});

router.post('/portfolio', urlencodedParser, function(req, resp, next){
    options.url = 'https://ems.qa.tradingticket.com/api/v1/balance/getAccountOverview';
    postData.token = userData.sessionToken
    postData.accountNumber = req.body.account


    function callback(err, res, body) {
        if(err){
            resp.render('error');
        }
        var balanceData = body
        balanceData.userId = userData.userId
        balanceData.userToken = userData.userToken
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
