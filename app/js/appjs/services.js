var app = angular.module('reviewScan');
app.service('analyzeService', function ($http, $q) {
    var analyzedData = {};

    this.analyze = function (url) {
        var analyzedData = undefined;
        if(!analyzedData){
            var deferred = $q.defer();

            var postMsg = {url:url};
            $http({
                method: 'POST',
                url: url.includes('flipkart') ? '/flipkartScan':'scan',
                data: postMsg,
                headers: {'Content-Type': 'application/json'}
            }).then(function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });
            analyzedData = deferred.promise;
        }
        return $q.when(analyzedData);
    };

    this.setAnalyzedData = function (data) {
        analyzedData = data;
    };

    this.getAnalyzedData = function () {
        return analyzedData;
    };
});