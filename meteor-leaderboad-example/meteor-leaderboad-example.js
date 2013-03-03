// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

var SORT_BY_NAME = {name: 1, score: -1};
var SORT_BY_SCORE = {score: -1, name: 1};
Players = new Meteor.Collection("players");
Session.set("sort", SORT_BY_SCORE);

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: Session.get("sort")});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
	
	'click input.sort': function () {
		if (Object.keys(Session.get("sort"))[0] == "name") { 
			Session.set("sort", SORT_BY_SCORE);
		} else {
			Session.set("sort", SORT_BY_NAME);
		}
    },
	
	'click input.resetScores': function () {
		Meteor.call('resetScoresServer', function(){});
    },
    
    'click input.addNewScientist': function () {
        Players.insert( {name: $('input.newScientist').val(), score: Math.floor(Math.random()*10)*5});
      },
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Math.random()*10)*5});
    }
	
	Meteor.methods({
		resetScoresServer: function () {
			var players = Players.find({});
			players.forEach(function (player) {
				Players.update(player, {$set: {score: Math.floor(Math.random()*10)*5}});
			});
		}
	});
	
  });
}