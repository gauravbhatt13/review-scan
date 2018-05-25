var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');
var sw = require('stopword');
var Ngram = require('node-ngram');
var Sentiment = require('sentiment');

var callbackCounter;
var aggregateReviews;
var responseData;
var maxReviewPages;
var sentiment;

router.post('/', function (req, res, next) {
    init();
    handleFewReviews(req, res);
});

var init = function () {
    callbackCounter = 0;
    aggregateReviews = [];
    responseData = {};
    maxReviewPages = 0;
    sentiment = new Sentiment();
};

var callback = function ($, res) {
    callbackCounter++;
    console.log('callback called : ' + callbackCounter);
    if (callbackCounter == 1) {
        console.log('returning response');
        var ngram = new Ngram({
            n: 2
        });

        var bigram = ngram.ngram(aggregateReviews.join(' '));
        var combined = [];
        bigram.forEach(function (item) {
            combined.push(item.join(' '));
        });

        var ngramCounts = _.countBy(combined, function (word) {
            return word;
        });

        responseData.imageSrc = $('div[class="_1LAYGY"]').children().eq(0).attr('src');
        responseData.prodName = $('div[class="_1SFrA2"]').eq(0).text();
        responseData.totalReviewCount = $('span[class="_2FuBeO"]').eq(1).text();
        responseData.starRatings = $('div[class="hGSR34 _2beYZw"]').text();
        responseData.wordDict = ngramCounts;
        res.send(responseData);
    }
};
var handleFewReviews = function (req, res) {
    var baseUrl = 'https://www.flipkart.com';
    request(req.body.url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var allReviewsPartial = $('div[class="col _39LH-M"]').children('a').attr('href');

            if(allReviewsPartial != undefined){
                var allReviews = baseUrl + allReviewsPartial;
                recursiveFunction(baseUrl, allReviews, $, res, callback);
            } else {
                callback($, res);
            }
        }
    });
};

var recursiveFunction = function (baseUrl, url, $, res, callback) {
    console.log('called page: ' + maxReviewPages);
    console.log('called service: ' + url);
    if (maxReviewPages++ < 5) {
        request(url, function (error, response, html) {
            console.log('received response');
            $ = cheerio.load(html);
            $('div[class="row _3wYu6I _3BRC7L"]').children().each(function (i, element) {
                createReviews($, element);
            });
            var nextPage = $('a[class="_33m_Yg _2udQ2X"]').parent().next().children('a').attr('href');
            console.log('next page : ' + nextPage);
            if (nextPage != undefined) {
                recursiveFunction(baseUrl, baseUrl + nextPage, $, res, callback);
            } else {
                callback($, res);
            }
        });
    } else {
        callback($, res);
    }

};

var createReviews = function ($, element) {
    var review = {};
    var concatText = '';
    var stopWordsRemovedArray;
    review.title = '';
    /*$('p[class="_2xg6Ul"]').each(function (item) {
        var replacedCharsTitle = item.replace(/[^a-zA-Z0-9 ]/g, "");
        stopWordsRemovedArray = sw.removeStopwords(splitTitle);
        concatText.concat(stopWordsRemovedArray.join(' '));
    });*/
    //review.title = $('p[class="_2xg6Ul"]').text();
    //review.date = $(element).children().eq(1).children('span[data-hook="review-date"]').text();
    review.comment = $('div[class="qwjRop"]').children('div').children('div').text();

   /* var replacedCharsTitle = review.title.replace(/[^a-zA-Z0-9 ]/g, "");
    var splitTitle = replacedCharsTitle.split(' ');
    var stopWordsRemovedArray = sw.removeStopwords(splitTitle);
    concatText = concatText.concat(stopWordsRemovedArray.join(' '));*/

    var replacedCharsComment = review.comment.replace(/[^a-zA-Z ]/g, "");
    var splitComment = replacedCharsComment.split(' ');
    stopWordsRemovedArray = sw.removeStopwords(splitComment);

    concatText = concatText.concat(stopWordsRemovedArray.join(' '));
    aggregateReviews.push(concatText);
    return review;
};

module.exports = router;
