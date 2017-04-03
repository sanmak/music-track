var myapp = angular.module('myapp',[]);

myapp.service('httpService', ['$http', function ($http) {
	this.getUrl = function(url){
		var promise = $http.get(url)
		.success(function(data, status){
			return data;
		})
		.error(function(data,status,headers){
			return 'error';
		});
		return promise; 
	}
	this.postUrl = function(url,postData){
		var promise = $http.post(url,postData)
		.success(function(data, status){
			return data;
		})
		.error(function(data,status,headers){
			console.log(data,status,headers);
			return 'error';
		});
		return promise; 
	}
}]);

myapp.controller('musicController',['$scope', '$http','$location','httpService',function($scope, $http,$location,httpService) {
	let dns = $location.protocol()+'://'+$location.host()+':'+$location.port();
	let tracksUrl = dns+'/v1/tracks';
	let genresUrl = dns+'/v1/allgenres';
	$scope.tracks = [];
	$scope.genres = [];
	$scope.searchTitle = '';
	$scope.requiredTrackInput = ['Title','Rating','Genre'];
	$scope.list = [1,2,3,4,5,6,7,8,9,10];
	$scope.inputtedGenres = [];
	$scope.inputtedTrack = '';
	$scope.inputtedRating = 0;
	$scope.genresSelected = {};
	$scope.enterGenre = '';
	$scope.errorInOperation = false;
	let operation = '';
	let identifier = '';
	let editTrackID;
	let editGenreID;
	let genreArray = [];
	$scope.fetchTrack = function(url){
		if(url === ''){
			url = tracksUrl;
		}
		httpService.getUrl(url).then(function(response){
			$scope.tracks = response.data.results;
			$scope.trackResponse = response.data;
			for (var i = 0; i < $scope.tracks.length; i++) {
				$scope.tracks[i]['displayName'] = $scope.tracks[i]['title'];
				for (var j = 0; j < $scope.tracks[i].genres.length; j++) {
					if(j === 0){
						$scope.tracks[i]['displayName'] += ' [';
					}
					$scope.tracks[i]['displayName'] += $scope.tracks[i].genres[j].name;
					if(j === $scope.tracks[i].genres.length - 1){
						$scope.tracks[i]['displayName'] += ']';
					}
					else{
						$scope.tracks[i]['displayName'] += ' | ';
					}
				}
			}
		});
	};
	$scope.fetchGenres = function(url){
		if(url != null){
			httpService.getUrl(url).then(function(response){
				$scope.genres = response.data;
				for (var i = 0; i < $scope.genres.length; i++) {
					$scope.genresSelected[$scope.genres[i].name] = false;
					genreArray[$scope.genres[i].name] = $scope.genres[i].id;
				}
			});
		}
	}
	$scope.fetchData = function(){
		$scope.fetchTrack(tracksUrl);
		$scope.fetchGenres(genresUrl);	
	}
	$scope.search = function(){
		let url = '';
		if($scope.searchTitle.length > 0){
			url = dns+'/v1/tracks?title='+$scope.searchTitle;
		}
		else{
			url = dns+'/v1/tracks';
		}
		$scope.fetchTrack(url);
	}
	$scope.save = function(){
		let url = dns;
		let postData = {};
		if(identifier === 'track'){
			if(operation === 'create'){
				url += '/v1/tracks';
			}
			else{
				url += '/v1/tracks/'+editTrackID;
			}
			postData.title = $scope.inputtedTrack;
			postData.rating = $scope.inputtedRating;
			postData.genres = [];
			for (var prop in $scope.genresSelected) {
				if($scope.genresSelected[prop]){
					postData.genres.push(genreArray[prop]);
				}
			}
		}
		else if(identifier === 'genre'){
			if(operation === 'create'){
				url += '/v1/genres';
			}
			else{
				url += '/v1/genres/'+editGenreID;
			}
			postData.name = $scope.enterGenre;
		}
		httpService.postUrl(url,postData).then(function(response){
			console.log(response);
			if(response === 'error'){
				$scope.errorInOperation = true;
			}
			else{
				$scope.errorInOperation = false;
			}
			$scope.fetchData();
		});
	}
	$scope.editTrack = function(tracks){
		editTrackID = tracks.id;
		$scope.inputtedTrack = tracks.title;
		$scope.inputtedRating = tracks.rating;
		$scope.genresSelected = {};
		for (var i = 0; i < tracks.genres.length; i++) {
			$scope.genresSelected[tracks.genres[i].name] = true;
		}
	}
	$scope.editGenre = function(genre){
		editGenreID = genre.id;
		$scope.enterGenre = genre.name;
	}
	$scope.addNewTrackClicked = function(){
		$scope.inputtedTrack = '';
		$scope.inputtedRating = 0;
		$scope.genresSelected = {};
		operation = 'create';
	}
	$scope.addNewGenreClicked = function(){
		$scope.enterGenre = ''
		operation = 'create';
	}
	$scope.genreOrTrack = function(functionality){
		identifier = functionality;
	}
	$scope.fetchData();
}]);
