var app = angular.module('reviewScan');
app.controller('analyzeCtrl', function ($scope, analyzeService, usSpinnerService) {
    $scope.url='';
    $scope.showWordCloud=false;
    $scope.rowCollection = [];
    $scope.analyze = function (){
        usSpinnerService.spin('spinner-1');
        analyzeService.analyze($scope.url).then(function (analyzedData) {
            var wordCloud = [];
            for (var key in analyzedData.wordDict) {
                var word = {};
                // check if the property/key is defined in the object itself, not in parent
                if (analyzedData.wordDict.hasOwnProperty(key)) {
                    word.text = key;
                    word.size = analyzedData.wordDict[key] * 10;
                }
                wordCloud.push(word);
            }
            $scope.imgSrc = analyzedData.imageSrc;
            {

            }
            var rowData = {};
            rowData.prodName = analyzedData.prodName;
            rowData.totalReviewCount = analyzedData.totalReviewCount;
            rowData.starRatings = analyzedData.starRatings;
            $scope.rowCollection.push(rowData);
            $scope.words = wordCloud;
            $scope.height = 300;
            $scope.width = 400;
            $scope.wordClicked = wordClicked;
            $scope.rotate = rotate;
            $scope.useTooltip = true;
            $scope.useTransition = false;
            $scope.showWordCloud=true;
            usSpinnerService.stop('spinner-1');

        });
        $scope.random = random;

        function random() {
            return 0.4; // a constant value here will ensure the word position is fixed upon each page refresh.
        }

        function rotate() {
            return ~~(Math.random() * 2) * 1;
        }

        function wordClicked(word){
            alert('text: ' + word.text + ',size: ' + word.size);
        }
    }
});