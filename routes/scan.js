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

        responseData.imageSrc = $('a[class="a-link-normal"]').children().eq(0).attr('src');
        responseData.prodName = $('a[data-hook="product-link"]').eq(0).text();
        responseData.totalReviewCount = $('span[data-hook="total-review-count"]').text();
        responseData.starRatings = $('div[class="a-row averageStarRatingNumerical"]').children('span').text();
        responseData.wordDict = ngramCounts;
        res.send(responseData);
    }
};
var handleFewReviews = function (req, res) {
    var baseUrl = 'https://www.amazon.in';
    request(req.body.url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);

            var allReviews = baseUrl + $('a[id="acrCustomerReviewLink"]').attr('href');
            recursiveFunction(baseUrl, allReviews, $, res, callback);
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
            $("[id^=customer_review-]").each(function (i, element) {
                createReviews($, element);
            });
            var nextPage = $('li[class="a-selected page-button"]').next().children('a').attr('href');
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
    review.title = $(element).children().eq(0).children('a[data-hook="review-title"]').text();
    review.date = $(element).children().eq(1).children('span[data-hook="review-date"]').text();
    review.comment = $(element).children().eq(3).children('span[data-hook="review-body"]').text();

    var replacedCharsTitle = review.title.replace(/[^a-zA-Z0-9 ]/g, "");
    var splitTitle = replacedCharsTitle.split(' ');
    var stopWordsRemovedArray = sw.removeStopwords(splitTitle);
    concatText = concatText.concat(stopWordsRemovedArray.join(' '));

    var replacedCharsComment = review.comment.replace(/[^a-zA-Z ]/g, "");
    var splitComment = replacedCharsComment.split(' ');
    stopWordsRemovedArray = sw.removeStopwords(splitComment);

    concatText = concatText.concat(stopWordsRemovedArray.join(' '));
    aggregateReviews.push(concatText);
    return review;
};

module.exports = router;
