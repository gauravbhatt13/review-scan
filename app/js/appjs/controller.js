var app = angular.module('reviewScan');
app.controller('analyzeCtrl', function ($scope, analyzeService, usSpinnerService, $state) {
    $scope.url = '';
    $scope.scan = function () {
        $scope.rowCollection = [];
        usSpinnerService.spin('spinner-1');
        analyzeService.analyze($scope.url).then(function (data) {
            var wordCloud = [];
            for (var key in data.wordDict) {
                var word = {};
                // check if the property/key is defined in the object itself, not in parent
                if (data.wordDict.hasOwnProperty(key)) {
                    word.text = key;
                    word.size = data.wordDict[key] * 10;
                }
                wordCloud.push(word);
            }
            $scope.imgSrc = data.imageSrc;
            var analyzedData = {};
            var rowData = {};
            rowData.prodName = data.prodName;
            rowData.totalReviewCount = data.totalReviewCount;
            rowData.starRatings = data.starRatings;
            analyzedData.rowCollection = [rowData];
            analyzedData.words = wordCloud;
            analyzedData.height = 300;
            analyzedData.width = 400;
            analyzedData.wordClicked = wordClicked;
            analyzedData.rotate = rotate;
            analyzedData.useTooltip = true;
            analyzedData.useTransition = true;
            analyzedData.reviews = data.reviews;
            //$scope.showWordCloud=true;
            usSpinnerService.stop('spinner-1');
            analyzeService.setAnalyzedData(analyzedData);
            $state.go('scanned');

        });
        $scope.random = random;

        function random() {
            return 0.4; // a constant value here will ensure the word position is fixed upon each page refresh.
        }

        function rotate() {
            return ~~(Math.random() * 2) * 1;
        }

        function wordClicked(word) {
            alert('text: ' + word.text + ',size: ' + word.size);
        }
    }
});
app.controller('scannedCtrl', function ($scope, analyzeService) {
    var analyzedData = analyzeService.getAnalyzedData();
    $scope.rowCollection = analyzedData.rowCollection;
    $scope.words = analyzedData.words;
    $scope.height = analyzedData.height;
    $scope.width = analyzedData.width;
    $scope.wordClicked = analyzedData.wordClicked;
    $scope.rotate = analyzedData.rotate;
    $scope.useTooltip = analyzedData.useTooltip;
    $scope.useTransition = analyzedData.useTransition;
    $scope.reviewCollection = analyzedData.reviews;
});