const express = require('express');
const async = require('async');
const router = express.Router();
const dbUtil = require('../model/dbUtil.js');
const config = require('../config.json');
const genres = dbUtil.genres;
const tracks = dbUtil.tracks;
const singlePageObject = config.singlePageObject;

router.get('/url',function(req,res){
	res.send(req.protocol+"://"+req.get('host'));
});

router.get('/genres', function(req, res) {
	let returnJson = {'count' : 0,'next':null,'previous' : null,'results' : []};
	let page = req.query.page ? parseInt(req.query.page,10) : 1;
	let url = req.protocol+"://"+req.get('host');
	getCounter(genres,function(err,counter){
		if(err){
			res.send(err);
		}
		else{
			returnJson['count'] = counter;
			if(page * singlePageObject < counter){
				returnJson['next'] = url+'/v1/genres?page='+ (page + 1);
			}
			if(page !== 1){
				returnJson['previous'] = url+'/v1/genres?page='+(page - 1);
			}
			genres.find({},{'id':1,'name' :1,'_id' : 0})
			.limit(singlePageObject)
			.skip((page - 1) * singlePageObject)
			.sort({'date' : -1})
			.exec(function(err,execRes){
				if(err){
					res.send(err);
				}
				else{
					returnJson['results'] = execRes.length > 0 ? execRes: 'No results found';
					res.send(returnJson);
				}
			});
		}
  	});
});
router.get('/genres/:gid', function(req, res) {
  genres.findOne({id : req.params.gid},{'id':1,'name' :1,'_id' : 0},function(err,findRes){
  	if(err){
  		res.send(err);
  	}
  	else{
  		res.send(findRes);	
  	}
  });
});
router.get('/allgenres', function(req, res) {
  genres.find({},{'id':1,'name' :1,'_id' : 0},{sort : {'date' : -1}},function(err,findRes){
  	if(err){
  		res.send(err);
  	}
  	else{
  		res.send(findRes);	
  	}
  });
});
router.post('/genres/:gid',function(req,res){
	genres.update({'id':req.params.gid},{'name' : req.body.name},function(err,updateRes){
		if(err){
	  		res.send(err);
	  	}
	  	else{
	  		res.send(updateRes);	
	  	}
	});
});
router.post('/genres',function(req,res){
	let genresObj = new dbUtil.genres();
	genresObj.name = req.body.name;
	getCounter(genres,function(err,counter){
		if(err){
			res.send(err);
		}
		else{
			if(counter === 0){
				genresObj.id = 1;
			}
			else{
				genresObj.id = counter + 1;
			}
			genresObj.save(function(err,genresCreation, numAffected) {
				if(err){
					res.send(err);
				}
				res.send(genresCreation);
			});	
		}
	});
});

router.get('/tracks', function(req, res) {
  	let returnJson = {'count' : 0,'next':null,'previous' : null,'results' : []};
	let page = req.query.page ? parseInt(req.query.page,10) : 1;
	let url = req.protocol+"://"+req.get('host');
	if(req.query.title){
		let query = {'title' : req.query.title};
		tracks.find(query,{'id' : 1,'title' : 1,'rating': 1,'genres' : 1,'_id' : 0},function(err,findResponse){
			if(err){
				res.send(err);
			}
			else{
				returnJson['count'] = findResponse.length;
				if(findResponse.length > 0){
					formulateTracks(findResponse,function(err,trackResposne){
						if(err){
							res.send(err);
						}
						else{
							returnJson['results'] = trackResposne;
							res.send(returnJson);
						}
					});
				}
				else{
					returnJson['results'] = [];
					res.send(returnJson);
				}
			}
		});
	}
	else{
		getCounter(tracks,function(err,counter){
			if(err){
				res.send(err);
			}
			else{
				returnJson['count'] = counter;
				if(page * singlePageObject < counter){
					returnJson['next'] = url+'/v1/tracks?page='+ (page + 1);
				}
				if(page !== 1){
					returnJson['previous'] = url+'/v1/tracks?page='+(page - 1);
				}

				tracks.find({},{'id' : 1,'title' : 1,'rating': 1,'genres' : 1,'_id' : 0})
				.limit(singlePageObject)
				.skip((page - 1) * singlePageObject)
				.sort({'date' : -1})
				.exec(function(err,execRes){
					if(err){
						res.send(err);
					}
					else{
						if(execRes.length > 0){
							formulateTracks(execRes,function(err,trackResposne){
								if(err){
									res.send(err);
								}
								else{
									returnJson['results'] = trackResposne;
									res.send(returnJson);
								}
							});
						}
						else{
							returnJson['results'] = [];
							res.send(returnJson);
						}
					}
				});
			}
	  	});
	}
});

router.get('/tracks/:tid', function(req, res) {
  tracks.findOne({'id' : req.params.tid},{'id' : 1,'title' : 1,'rating': 1,'genres' : 1,'_id' : 0},function(err,findResponse){
		if(err){
			res.send(err);
		}
		else{
			if(findResponse !== null){
				formulateTracks(findResponse,function(err,trackResposne){
					if(err){
						res.send(err);
					}
					else{
						res.send(trackResposne[0]);
					}
				});
			}
			else{
				res.send({});
			}
		}
  });
});

router.post('/tracks',function(req,res){
	let tracksObj = new dbUtil.tracks();
	getCounter(tracks,function(err,counter){
		tracksObj.id = counter != 0 ? counter + 1 : 1;
		tracksObj.title = req.body.title;
		tracksObj.rating = req.body.rating;
		tracksObj.genres = req.body.genres;
		tracksObj.save(function(err,tracksCreation, numAffected) {
			if(err){
				res.send(err);
			}
			else{
				res.send(tracksCreation);
			}
		});
	});
});

router.post('/tracks/:tid',function(req,res){
	let query = {'title' : req.body.title,'rating' : req.body.rating,'genres': req.body.genres};
	tracks.update({'id':req.params.tid},query,function(err,updateRes){
		if(err){
			res.send(err);
		}
		else{
			res.send(updateRes);
		}
	});
});

function formulateTracks(resonse,cb){
  let tracksResposne = resonse.length > 0 ? resonse : [resonse];
  let returnArray = [];
  async.each(tracksResposne,function(track,callback){
	let returnJson = {'id' : 0,'title' : '','rating' : '','genres' : []};
	returnJson.id = track.id; 
	returnJson.title = track.title;
	returnJson.rating = track.rating;
	genres.find({},{'id' : 1,'name' : 1,'_id' : 0})
	.where('id')
	.in(track.genres)
	.exec(function(err,execRes){
		if(err){
			callback(err);
		}
		else{
			returnJson.genres = execRes;
			returnArray.push(returnJson);
			callback();
		}
	});
	},function(err){
		cb(err,returnArray);
	});
}

function getCounter(collectionName,callback){
	collectionName.count({},function(err,res){
		callback(err,res);
	});
}
module.exports = router;
