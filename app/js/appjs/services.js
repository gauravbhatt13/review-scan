var app = angular.module('reviewScan');
app.service('analyzeService', function ($http, $q) {
    var analyzedData = undefined;

    this.analyze = function (url) {
        if(!analyzedData){
            var deferred = $q.defer();

            var postMsg = {url:url};
            $http({
                method: 'POST',
                url: '/scan',
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
    }
});