///<reference path="../../node_modules/@types/angular/index.d.ts" />
///<reference path="dao.ts" />

if (typeof angular !== 'undefined') {
    let app = angular.module('wordhighlighter', ['ngTable']);

    app.service('dao', function() {
        return new DAO();
    });

    app
    .run(function($rootScope: any) {
        $rootScope.currentTab = 'words';
    });

    app.controller('mainDialogController', function($scope: any, NgTableParams: any, dao: DAO) {
        $scope.dictionary = [];
        $scope.newWord = {
            value: '',
            description: ''
        };
        $scope.importAsReplacementContent = '';

        $scope.load = function() {
            dao.getDictionary(function(dictionary: Array<DictionaryEntry>) {
                $scope.dictionary = dictionary;
                $scope.tableParams = new NgTableParams({
                    count: 1000000000 // hide pager
                }, {
                    dataset: $scope.dictionary,
                    counts: [] // hide page sizes
                });
                $scope.originalData = angular.copy($scope.dictionary);
                $scope.$apply();
            });
        };

        $scope.onAddNewWordClicked = function() {
            if ($scope.newWord.value) {
                dao.addEntry($scope.newWord.value, $scope.newWord.description, function(newEntry: DictionaryEntry) {
                    $scope.dictionary.push(newEntry);
                    $scope.tableParams.reload();
                });
                $scope.newWord.value = '';
                $scope.newWord.description = '';
            }
        };

        $scope.cancel = function(dictionaryEntry: any, dictionaryEntryForm: any) {
            let originalRow = resetRow(dictionaryEntry, dictionaryEntryForm);
            angular.extend(dictionaryEntry, originalRow);
        };

        $scope.delete = function(dictionaryEntry: any) {
            $scope.dictionary.splice(findEntryIndexById(dictionaryEntry.id), 1);
            $scope.tableParams.reload();
            dao.saveDictionary($scope.dictionary, function() {});
        };

        $scope.save = function(dictionaryEntry: any, dictionaryEntryForm: any) {
            let originalRow = resetRow(dictionaryEntry, dictionaryEntryForm);
            angular.extend(originalRow, dictionaryEntry);
            dao.saveDictionary($scope.dictionary, function() {});
        };

        let resetRow = function(dictionaryEntry: any, dictionaryEntryForm: any) {
            dictionaryEntry.isEditing = false;
            dictionaryEntryForm.$setPristine();
            for (let i = 0; i < $scope.originalData.length; ++i) {
                if ($scope.originalData[i].id === dictionaryEntry.id) {
                    return $scope.originalData[i];
                }
            }
            return null;
        };

        function findEntryIndexById(id: number): number {
            for (let i = 0; i < $scope.dictionary.length; ++i) {
                if ($scope.dictionary[i].id === id) {
                    return i;
                }
            }
            return -1;
        }

        $scope.load();
    });
}