'use strict';

angular.module('app.messages.controller', ['app.message.service'])
    .controller('MessagesCtrl', ['$scope', 'MessageService', '$location', function ($scope, service, $location) {

        service.query(function (data, headers) {
            $scope.allMessages = data;

            switch ($location.path()) {
                case "/palindromes":
                    $scope.filter = "palindromes";
                    $scope.showFilter = true;
                    break;

                case "/non-palindromes":
                    $scope.filter = "nonpalindromes";
                    $scope.showFilter = true;
                    break;

                default:
                    $scope.filter = "all";
                    //$scope.messages = data;
                    $scope.showFilter = false;
                    break;
            }
            $scope.allFilteredMessages = filterMessages($scope.allMessages, $scope.filter);

            $scope.messages = [];

            //setup pagination
            $scope.itemsPerPage = 10;
            $scope.setPage(1);
            $scope.numPages = Math.ceil($scope.allFilteredMessages.length / $scope.itemsPerPage);


        }, function (response) {
            if (response.status == 404) {
                $scope.pageIs404 = true;
            }

            _handleError(response, $location);
        });

        function filterMessages(messages, filterType) {
            var filteredMessages;

            switch (filterType) {
                case "palindromes":

                    filteredMessages = messages.filter(function (message) {
                        return message.isPalindrome;
                    });
                    break;

                case "nonpalindromes":
                    filteredMessages = messages.filter(function (message) {
                        return !message.isPalindrome;
                    });
                    break;

                default:
                    filteredMessages = messages;
                    break;

            }
            return filteredMessages;
        }

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
            var begin = $scope.itemsPerPage * ($scope.currentPage - 1);
            var end = begin + $scope.itemsPerPage;

            $scope.messages = $scope.allFilteredMessages.slice(begin, end);

        };

        $scope.pageChanged = function () {
            $scope.setPage($scope.currentPage);
        };

        $scope.applyFilters = function (filterType) {
            $scope.allFilteredMessages = filterMessages($scope.allMessages, $scope.filter);
            $scope.setPage(1);
        };



        $scope.isPalindrome = isPalindrome;
    }]);

function _handleError(response, $location) {

    switch (response.status) {
        case 404:
            break; //do nothing, let our pages handle this

        default:
            $location.path('/500-error');
            break;
    }
}
var isPalindrome = function (text) {

    if (!text) {
        return false;
    }

    text = text.replace(/[^\w]/g, ""); //remove all characters except a-z
    text = text.toLowerCase();
    if (text.length === 0) {
        return false;
    }

    return text == text.split('').reverse().join('');
};