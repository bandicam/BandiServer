/**
 * Commands
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * These are commands. For instance, you can define the command 'whois'
 * here, then use it by typing /whois into Pokemon Showdown.
 *
 * A command can be in the form:
 *   ip: 'whois',
 * This is called an alias: it makes it so /ip does the same thing as
 * /whois.
 *
 * But to actually define a command, it's a function:
 *   birkal: function(target, room, user) {
 *     this.sendReply("It's not funny anymore.");
 *   },
 *
 * Commands are actually passed five parameters:
 *   function(target, room, user, connection, cmd, message)
 * Most of the time, you only need the first three, though.
 *
 * target = the part of the message after the command
 * room = the room object the message was sent to
 *   The room name is room.id
 * user = the user object that sent the message
 *   The user's name is user.name
 * connection = the connection that the message was sent from
 * cmd = the name of the command
 * message = the entire message sent by the user
 *
 * If a user types in "/msg zarel, hello"
 *   target = "zarel, hello"
 *   cmd = "msg"
 *   message = "/msg zarel, hello"
 *
 * Commands return the message the user should say. If they don't
 * return anything or return something falsy, the user won't say
 * anything.
 *
 * Commands have access to the following functions:
 *
 * this.sendReply(message)
 *   Sends a message back to the room the user typed the command into.
 *
 * this.sendReplyBox(html)
 *   Same as sendReply, but shows it in a box, and you can put HTML in
 *   it.
 *
 * this.popupReply(message)
 *   Shows a popup in the window the user typed the command into.
 *
 * this.add(message)
 *   Adds a message to the room so that everyone can see it.
 *   This is like this.sendReply, except everyone in the room gets it,
 *   instead of just the user that typed the command.
 *
 * this.send(message)
 *   Sends a message to the room so that everyone can see it.
 *   This is like this.add, except it's not logged, and users who join
 *   the room later won't see it in the log, and if it's a battle, it
 *   won't show up in saved replays.
 *   You USUALLY want to use this.add instead.
 *
 * this.logEntry(message)
 *   Log a message to the room's log without sending it to anyone. This
 *   is like this.add, except no one will see it.
 *
 * this.addModCommand(message)
 *   Like this.add, but also logs the message to the moderator log
 *   which can be seen with /modlog.
 *
 * this.logModCommand(message)
 *   Like this.addModCommand, except users in the room won't see it.
 *
 * this.can(permission)
 * this.can(permission, targetUser)
 *   Checks if the user has the permission to do something, or if a
 *   targetUser is passed, check if the user has permission to do
 *   it to that user. Will automatically give the user an "Access
 *   denied" message if the user doesn't have permission: use
 *   user.can() if you don't want that message.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.can('potd')) return false;
 *
 * this.canBroadcast()
 *   Signifies that a message can be broadcast, as long as the user
 *   has permission to. This will check to see if the user used
 *   "!command" instead of "/command". If so, it will check to see
 *   if the user has permission to broadcast (by default, voice+ can),
 *   and return false if not. Otherwise, it will set it up so that
 *   this.sendReply and this.sendReplyBox will broadcast to the room
 *   instead of just the user that used the command.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.canBroadcast()) return false;
 *
 * this.canTalk()
 *   Checks to see if the user can speak in the room. Returns false
 *   if the user can't speak (is muted, the room has modchat on, etc),
 *   or true otherwise.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.canTalk()) return false;
 *
 * this.canTalk(message)
 *   Checks to see if the user can say the message. In addition to
 *   running the checks from this.canTalk(), it also checks to see if
 *   the message has any banned words or is too long. Returns the
 *   filtered message, or a falsy value if the user can't speak.
 *
 *   Should usually be near the top of the command, like:
 *     target = this.canTalk(target);
 *     if (!target) return false;
 *
 * this.parse(message)
 *   Runs the message as if the user had typed it in.
 *
 *   Mostly useful for giving help messages, like for commands that
 *   require a target:
 *     if (!target) return this.parse('/help msg');
 *
 *   After 10 levels of recursion (calling this.parse from a command
 *   called by this.parse from a command called by this.parse etc)
 *   we will assume it's a bug in your command and error out.
 *
 * this.targetUserOrSelf(target)
 *   If target is blank, returns the user that sent the message.
 *   Otherwise, returns the user with the username in target, or
 *   a falsy value if no user with that username exists.
 *
 * this.splitTarget(target)
 *   Splits a target in the form "user, message" into its
 *   constituent parts. Returns message, and sets this.targetUser to
 *   the user, and this.targetUsername to the username.
 *
 *   Remember to check if this.targetUser exists before going further.
 *
 * Unless otherwise specified, these functions will return undefined,
 * so you can return this.sendReply or something to send a reply and
 * stop the command there.
 *
 * @license MIT license
 */
var sigh = true;
var canpet = true; 
var denied = "Error: You are not allowed to use this command.";

// tour variables

if (typeof(tour) === "undefined") {
	tour = new Object();
}
tour.tiers = new Array();
setTimeout(function() {for (var i in Data.base.Formats) {tour.tiers.push(i);}}, 1000);
tour.reset = function(rid) {
        tour[rid] = {
                status: 0,
                tier: undefined,
                size: 0,
                roundNum: 0,
                players: new Array(),
                winners: new Array(),
                losers: new Array(),
                round: new Array(),
                history: new Array()
        };
};
tour.shuffle = function(list) {
  var i, j, t;
  for (i = 1; i < list.length; i++) {
    j = Math.floor(Math.random()*(1+i));  // choose j in [0..i]
    if (j != i) {
      t = list[i];                        // swap list[i] and list[j]
      list[i] = list[j];
      list[j] = t;
    }
  }
  return list;
};
tour.splint = function(target) {
        //splittyDiddles
        var cmdArr =  target.split(",");
        for(var i = 0; i < cmdArr.length; i++) {
                cmdArr[i] = cmdArr[i].trim();
        }
        return cmdArr;
};
tour.join = function(uid, rid) {
        var players = tour[rid].players;
        var init = 0;
        for (var i in players) {
                if (players[i] == uid) {
                        init = 1;
                }
        }
        if (init) {
                return false;
        }
        players.push(uid);
        return true;
};
tour.leave = function(uid, rid) {
        var players = tour[rid].players;
        var init = 0;
        var key;
        for (var i in players) {
                if (players[i] == uid) {
                        init = 1;
                        key = i;
                }
        }
        if (!init) {
                return false;
        }
        players.splice(key, 1);
        return true;
};
tour.lose = function(uid, rid) {
        /*
                if couldn't disqualify return false
                if could disqualify return the opponents userid
        */
        var r = tour[rid].round;
        for (var i in r) {
                if (r[i][0] == uid) {
                        var key = i;
                        var p = 0;
                }
                if (r[i][1] == uid) {
                        var key = i;
                        var p = 1;
                }
        }
        if (!key) {
                //user not in tour
                return -1;
        }
        else {
                if (r[key][1] == undefined) {
                        //no opponent
                        return 0;
                }
                if (r[key][2] != undefined && r[key][2] != -1) {
                        //already did match
                        return 1;
                }
                var winner = 0;
                var loser = 1;
                if (p == 0) {
                        winner = 1;
                        loser = 0;
                }
                r[key][2] = r[key][winner];
                tour[rid].winners.push(r[key][winner]);
                tour[rid].losers.push(r[key][loser]);
                tour[rid].history.push(r[key][winner] + "|" + r[key][loser]);
                return r[key][winner];
        }
};
tour.start = function(rid) {
        var isValid = false;
        var numByes = 0;
        if (tour[rid].size <= 4) {
                if (tour[rid].size % 2 == 0) {
                        isValid = true;
                } else {
                        isValid = true;
                        numByes = 1;
                }
        }
                do
                {
                        var numPlayers = ((tour[rid].size - numByes) / 2 + numByes);
                        do
                        {
                                        numPlayers = numPlayers / 2;
                        }
                while (numPlayers > 1);
                if (numPlayers == 1) {
                                                isValid = true;
                        } else {
                                                numByes += 1;
                        }
                }
        while (isValid == false);
        var r = tour[rid].round;
        var sList = tour[rid].players;
        tour.shuffle(sList);
        var key = 0;
        do
                {
                        if (numByes > 0) {
                                r.push([sList[key], undefined, sList[key]]);
                                tour[rid].winners.push(sList[key]);
                                numByes -= 1
                                key++;
                        }
                }
        while (numByes > 0);
        do
                {
                        var match = new Array(); //[p1, p2, result]
                        match.push(sList[key]);
                        key++;
                        match.push(sList[key]);
                        key++;
                        match.push(undefined);
                        r.push(match);
                }
        while (key != sList.length);
        tour[rid].roundNum++;
        tour[rid].status = 2;
};
tour.nextRound = function(rid) {
        var w = tour[rid].winners;
        var l = tour[rid].losers;
        tour[rid].roundNum++;
        tour[rid].history.push(tour[rid].round);
        tour[rid].round = new Array();
        tour[rid].losers = new Array();
        tour[rid].winners = new Array();
        if (w.length == 1) {
                //end tour
                Rooms.rooms[rid].addRaw('<h2><font color="green">Congratulations <font color="black">' + Users.users[w[0]].name + '</font>!  You have won the ' + Data.base.Formats[tour[rid].tier].name + ' Tournament!</font></h2>' + '<br><font color="blue"><b>SECOND PLACE:</b></font> ' + Users.users[l[0]].name + '<hr />');
                tour[rid].status = 0;
        }
        else {
                var html = '<hr /><h3><font color="green">Round '+ tour[rid].roundNum +'!</font></h3><font color="blue"><b>TIER:</b></font> ' + Data.base.Formats[tour[rid].tier].name + "<hr /><center>";
                for (var i = 0; w.length / 2 > i; i++) {
                        var p1 = i * 2;
                        var p2 = p1 + 1;
                        tour[rid].round.push([w[p1], w[p2], undefined]);
                        html += w[p1] + " VS " + w[p2] + "<br />";
                }
                Rooms.rooms[rid].addRaw(html + "</center>");
        }
};
for (var i in Rooms.rooms) {
        if (Rooms.rooms[i].type == "chat" && !tour[i]) {
                tour[i] = new Object();
                tour.reset(i);
        }
}

// end tour variables

var commands = exports.commands = {


//tour commands

        tour: function(target, room, user, connection) {
                if (!user.can('broadcast')) {
                        return this.sendReply('You do not have enough authority to use this command.');
                }
                if (tour[room.id].status != 0) {
                        return this.sendReply('There is already a tournament running, or there is one in a signup phase.');
                }
                if (!target) {
                        return this.sendReply('Proper syntax for this command: /tour tier, size');
                }
                var targets = tour.splint(target);
                var tierMatch = false;
                var tempTourTier = '';
                for (var i = 0; i < tour.tiers.length; i++) {
                        if ((targets[0].trim().toLowerCase()) == tour.tiers[i].trim().toLowerCase()) {
                        tierMatch = true;
                        tempTourTier = tour.tiers[i];
                        }
                }
                if (!tierMatch) {
                        return this.sendReply('Please use one of the following tiers: ' + tour.tiers.join(','));
                }
                targets[1] = parseInt(targets[1]);
                if (isNaN(targets[1])) {
                        return this.sendReply('Proper syntax for this command: /tour tier, size');
                }
                if (targets[1] < 3) {
                        return this.sendReply('Tournaments must contain 3 or more people.');
                }
 
                tour.reset(room.id);
                tour[room.id].tier = tempTourTier;
                tour[room.id].size = targets[1];
                tour[room.id].status = 1;
                tour[room.id].players = new Array();           
 
                room.addRaw('<hr /><h2><font color="green">' + sanitize(user.name) + ' has started a ' + Data.base.Formats[tempTourTier].name + ' Tournament.</font> <font color="red">/j</font> <font color="green">to join!</font></h2><b><font color="blueviolet">PLAYERS:</font></b> ' + targets[1] + '<br /><font color="blue"><b>TIER:</b></font> ' + Data.base.Formats[tempTourTier].name + '<hr />');
        },
 
        endtour: function(target, room, user, connection) {
                if (!user.can('broadcast')) {
                        return this.sendReply('You do not have enough authority to use this command.');
                }
                if (tour[room.id] == undefined || tour[room.id].status == 0) {
                        return this.sendReply('There is no active tournament.');
                }
                tour[room.id].status = 0;
                room.addRaw('<h2><b>' + user.name + '</b> has ended the tournament.</h2>');
        },
 
        toursize: function(target, room, user, connection) {
                if (!user.can('broadcast')) {
                        return this.sendReply('You do not have enough authority to use this command.');
                }
                if(tour[room.id] == undefined)
                        return this.sendReply('There is no active tournament in this room.');
 
                if (tour[room.id].status > 1) {
                        return this.sendReply('The tournament size cannot be changed now!');
                }
                if (!target) {
                        return this.sendReply('Proper syntax for this command: /toursize size');
                }
                target = parseInt(target);
                if (isNaN(target)) {
                        return this.sendReply('Proper syntax for this command: /tour size');
                }
                if (target < 3) {
                        return this.sendReply('A tournament must have at least 3 people in it.');
                }
                if (target < tour[room.id].players.length) {
                        return this.sendReply('Target size must be greater than or equal to the amount of players in the tournament.');
                }
                tour[room.id].size = target;
                room.addRaw('<b>' + user.name + '</b> has changed the tournament size to: ' + target + '. <b><i>' + (target - tour[room.id].players.length) + ' slots remaining.</b></i>');
                if (target == tour[room.id].players.length) {
                        tour.start(room.id);
                        room.addRaw('<hr /><h3><font color="green">Round '+ tour[room.id].roundNum +'!</font></h3><font color="blue"><b>TIER:</b></font> ' + Data.base.Formats[tour[room.id].tier].name + "<hr /><center>");
                        var html = "";
                        var round = tour[room.id].round;
                        for (var i in round) {
                                if (!round[i][1]) {
                                                html += "<font color=\"red\">" + round[i][0] + " has received a bye!</font><br />";
                                }
                                else {
                                        html += round[i][0] + " VS " + round[i][1] + "<br />";
                                }
                        }
                        room.addRaw(html + "</center>");
                }
        },
 
        jt: 'j',
        jointour: 'j',
        j: function(target, room, user, connection) {
                if (tour[room.id] == undefined || tour[room.id].status == 0) {
                        return this.sendReply('There is no active tournament to join.');
                }
                if (tour[room.id].status == 2) {
                        return this.sendReply('Signups for the current tournament are over.');
                }
                if (tour.join(user.userid, room.id)) {
                        room.addRaw('<b>' + user.name + '</b> has joined the tournament. <b><i>' + (tour[room.id].size - tour[room.id].players.length) + ' slots remaining.</b></i>');
                        if (tour[room.id].size == tour[room.id].players.length) {
                                tour.start(room.id);
                                var html = '<hr /><h3><font color="green">Round '+ tour[room.id].roundNum +'!</font></h3><font color="blue"><b>TIER:</b></font> ' + Data.base.Formats[tour[room.id].tier].name + "<hr /><center>";
                                var round = tour[room.id].round;
                                for (var i in round) {
                                        if (!round[i][1]) {
                                                html += "<font color=\"red\">" + round[i][0] + " has received a bye!</font><br />";
                                        }
                                        else {
                                                html += round[i][0] + " VS " + round[i][1] + "<br />";
                                        }
                                }
                                room.addRaw(html + "</center>");
                        }
                } else {
                        return this.sendReply('You could not enter the tournament. You may already be in the tournament. Type /l if you want to leave the tournament.');
                }
        },
 
        forcejoin: 'fj',
        fj: function(target, room, user, connection) {
                if (!user.can('broadcast')) {
                        return this.sendReply('You do not have enough authority to use this command.');
                }
                if (tour[room.id] == undefined || tour[room.id].status == 0 || tour[room.id].status == 2) {
                        return this.sendReply('There is no tournament in a sign-up phase.');
                }
                if (!target) {
                        return this.sendReply('Please specify a user who you\'d like to participate.');
                }
                var targetUser = Users.get(target);
                if (targetUser) {
                        target = targetUser.userid;
                }
                else {
                        return this.sendReply('The user \'' + target + '\' doesn\'t exist.');
                }
                if (tour.join(target, room.id)) {
                        room.addRaw(user.name + ' has forced <b>' + target + '</b> to join the tournament. <b><i>' + (tour[room.id].size - tour[room.id].players.length) + ' slots remaining.</b></i>');
                        if (tour[room.id].size == tour[room.id].players.length) {
                                tour.start(room.id);
                                var html = '<hr /><h3><font color="green">Round '+ tour[room.id].roundNum +'!</font></h3><font color="blue"><b>TIER:</b></font> ' + Data.base.Formats[tour[room.id].tier].name + "<hr /><center>";
                                var round = tour[room.id].round;
                                for (var i in round) {
                                        if (!round[i][1]) {
                                                html += "<font color=\"red\">" + round[i][0] + " has received a bye!</font><br />";
                                        }
                                        else {
                                                html += round[i][0] + " VS " + round[i][1] + "<br />";
                                        }
                                }
                                room.addRaw(html + "</center>");
                        }
                }
                else {
                        return this.sendReply('The user that you specified is already in the tournament.');
                }
        },
 
        lt: 'l',
        leavetour: 'l',
        l: function(target, room, user, connection) {
                if (tour[room.id] == undefined || tour[room.id].status == 0) {
                        return this.sendReply('There is no active tournament to leave.');
                }
                var spotRemover = false;
                if (tour[room.id].status == 1) {
                        if (tour.leave(user.userid, room.id)) {
                                room.addRaw('<b>' + user.name + '</b> has left the tournament. <b><i>' + (tour[room.id].size - tour[room.id].players.length) + ' slots remaining.</b></i>');
                        }
                        else {
                                return this.sendReply("You're not in the tournament.");
                        }
                }
                else {
                        var dqopp = tour.lose(user.userid, room.id);
                        if (dqopp) {
                                room.addRaw('<b>' + user.userid + '</b> has left the tournament. <b>' + dqopp + '</b> will advance.');
                                var r = tour[room.id].round;
                                var c = 0;
                                for (var i in r) {
                                        if (r[i][2] && r[i][2] != -1) {
                                                c++;
                                        }
                                }
                                if (r.length == c) {
                                        tour.nextRound(room.id);
                                }
                        }
                        else {
                                return this.sendReply("You're not in the tournament or your opponent is unavailable.");
                        }
                }
        },
 
        forceleave: 'fl',
        fl: function(target, room, user, connection) {
                if (!user.can('broadcast')) {
                        return this.sendReply('You do not have enough authority to use this command.');
                }
                if (tour[room.id] == undefined || tour[room.id].status == 0 || tour[room.id].status == 2) {
                        return this.sendReply('There is no tournament in a sign-up phase.  Use /dq username if you wish to remove someone in an active tournament.');
                }
                if (!target) {
                        return this.sendReply('Please specify a user to kick from this signup.');
                }
                var targetUser = Users.get(target);
                if (targetUser) {
                        target = targetUser.userid;
                }
                else {
                        return this.sendReply('The user \'' + target + '\' doesn\'t exist.');
                }
                if (tour.leave(target, room.id)) {
                        room.addRaw(user.name + ' has forced <b>' + target + '</b> to leave the tournament. <b><i>' + (tour[room.id].size - tour[room.id].players.length) + ' slots remaining.</b></i>');
                }
                else {
                        return this.sendReply('The user that you specified is not in the tournament.');
                }
        },
 
        remind: function(target, room, user, connection) {
                if (!user.can('broadcast')) {
                        return this.sendReply('You do not have enough authority to use this command.');
                }
                if(tour[room.id] == undefined)
                        return this.sendReply('There is no active tournament in this room.');
 
                if (tour[room.id].status != 1) {
                        return this.sendReply('There is no tournament in its sign up phase.');
                }
                room.addRaw('<hr /><h2><font color="green">Please sign up for the ' + Data.base.Formats[tour[room.id].tier].name + ' Tournament.</font> <font color="red">/j</font> <font color="green">to join!</font></h2><b><font color="blueviolet">PLAYERS:</font></b> ' + tour[room.id].size + '<br /><font color="blue"><b>TIER:</b></font> ' + Data.base.Formats[tour[room.id].tier].name + '<hr />');
        },
 
        viewround: 'vr',
        vr: function(target, room, user, connection) {
                if (!this.canBroadcast()) return;
                if(tour[room.id] == undefined)
                        return this.sendReply('There is no active tournament in this room.');
 
                if (tour[room.id].status < 2) {
                                return this.sendReply('There is no tournament out of its signup phase.');
                }
                var html = '<hr /><h3><font color="green">Round '+ tour[room.id].roundNum + '!</font></h3><font color="blue"><b>TIER:</b></font> ' + Data.base.Formats[tour[room.id].tier].name + "<hr /><center><small>Red = lost, Green = won, Bold = battling</small><center>";
                var r = tour[room.id].round;
                for (var i in r) {
                        if (!r[i][1]) {
                                //bye
                                html += "<font color=\"red\">" + r[i][0] + " has received a bye.</font><br />";
                        }
                        else {
                                if (r[i][2] == undefined) {
                                        //haven't started
                                        html += r[i][0] + " VS " + r[i][1] + "<br />";
                                }
                                else if (r[i][2] == -1) {
                                        //currently battling
                                        html += "<b>" + r[i][0] + " VS " + r[i][1] + "</b><br />";
                                }
                                else {
                                        //match completed
                                        var p1 = "red";
                                        var p2 = "green";
                                        if (r[i][2] == r[i][0]) {
                                                p1 = "green";
                                                p2 = "red";
                                        }
                                        html += "<b><font color=\"" + p1 + "\">" + r[i][0] + "</font> VS <font color=\"" + p2 + "\">" + r[i][1] + "</font></b><br />";
                                }
                        }
                }
                this.sendReply("|raw|" + html + "</center>");
        },
 
        disqualify: 'dq',
        dq: function(target, room, user, connection) {
                if (!user.can('broadcast')) {
                        return this.sendReply('You do not have enough authority to use this command.');
                }
                if (!target) {
                        return this.sendReply('Proper syntax for this command is: /dq username');
                }
                if(tour[room.id] == undefined){
                        return this.sendReply('There is no active tournament in this room.');
                }
                if (tour[room.id].status < 2) {
                        return this.sendReply('There is no tournament out of its sign up phase.');
                }
                var targetUser = Users.get(target);
                if (!targetUser) {
                        var dqGuy = sanitize(target.toLowerCase());
                } else {
                        var dqGuy = targetUser.userid;
                }
                var error = tour.lose(dqGuy, room.id);
                if (error == -1) {
                        return this.sendReply('The user \'' + target + '\' was not in the tournament.');
                }
                else if (error == 0) {
                        return this.sendReply('The user \'' + target + '\' was not assigned an opponent. Wait till next round to disqualify them.');
                }
                else if (error == 1) {
                        return this.sendReply('The user \'' + target + '\' already played their battle. Wait till next round to disqualify them.');
                }
                else {
                        room.addRaw('<b>' + dqGuy + '</b> was disqualified by ' + user.name + ' so ' + error + ' advances.');
                        var r = tour[room.id].round;
                        var c = 0;
                        for (var i in r) {
                                if (r[i][2] && r[i][2] != -1) {
                                        c++;
                                }
                        }
                        if (r.length == c) {
                                tour.nextRound(room.id);
                        }
                }
        },
 
        replace: function(target, room, user, connection) {
                if (!user.can('broadcast')) {
                        return this.sendReply('You do not have enough authority to use this command.');
                }
                if (tour[room.id] == undefined || tour[room.id].status != 2) {
                        return this.sendReply('The tournament is currently in a sign-up phase or is not active, and replacing users only works mid-tournament.');
                }
                if (!target) {
                        return this.sendReply('Proper syntax for this command is: /replace user1, user2.  User 2 will replace User 1 in the current tournament.');
                }
                var t = tour.splint(target);
                if (!t[1]) {
                        return this.sendReply('Proper syntax for this command is: /replace user1, user2.  User 2 will replace User 1 in the current tournament.');
                }
                var userOne = Users.get(t[0]);
                var userTwo = Users.get(t[1]);
                if (!userTwo) {
                        return this.sendReply('Proper syntax for this command is: /replace user1, user2.  The user you specified to be placed in the tournament is not present!');
                } else {
                        t[1] = userTwo.userid;
                }
                if (userOne) {
                        t[0] = userOne.userid;
                }
                var rt = tour[room.id];
                var init1 = false;
                var init2 = false;
                var players = rt.players;
                //check if replacee in tour
                for (var i in players) {
                        if (players[i] ==  t[0]) {
                                init1 = true;
                        }
                }
                //check if replacer in tour
                for (var i in players) {
                        if (players[i] ==  t[1]) {
                                init2 = true;
                        }
                }
                if (!init1) {
                        return this.sendReply(t[0]  + ' cannot be replaced by ' + t[1] + " because they are not in the tournament.");
                }
                if (init2) {
                        return this.sendReply(t[1] + ' cannot replace ' + t[0] + ' because they are already in the tournament.');
                }
                var outof = ["players", "winners", "losers", "round"];
                for (var x in outof) {
                        for (var y in rt[outof[x]]) {
                                var c = rt[outof[x]][y];
                                if (outof[x] == "round") {
                                        if (c[0] == t[0]) {
                                                c[0] = t[1];
                                        }
                                        if (c[1] == t[0]) {
                                                c[1] = t[1];
                                        }
                                        if (c[2] == t[0]) {
                                                c[2] = t[1];
                                        }
                                }
                                else {
                                        if (c == t[0]) {
                                                rt[outof[x]][y] = t[1];
                                        }
                                }
                        }
                }
                rt.history.push(t[0] + "->" + t[1]);
                room.addRaw('<b>' + t[0] +'</b> has left the tournament and is replaced by <b>' + t[1] + '</b>.');
        },

//end tour commands

//rps commands

	rock: function(target,room, user) {return this.parse('/rps rock ' + target);},
	paper: function(target,room, user) {return this.parse('/rps paper ' + target);},
	scissors: function(target,room, user) {return this.parse('/rps scissors ' + target);},
	lizard: function(target,room, user) {return this.parse('/rps lizard ' + target);},
	spock: function(target,room, user) {return this.parse('/rps Spock ' + target);},

	rps: function(target, room, user) {
		user.blockrps=false;
		var parts = target.split(",");
		var spind = target.indexOf(" ");
		var blankarray = ["blank","no","none","nothing","void"]
		var lcasearray = ["rock","paper","scissors","lizard","spock"]


		if (!parts[0]) return this.sendReply("The proper syntaxis is /rps [choice],[targetuser]. The parameter [targetuser] is optional.");

		if (blankarray.indexOf(parts[0].toLowerCase()) != -1) {
			user.rpschoice = "";
			return this.sendReply("Your previous choice has been deleted.");
		}
		if (lcasearray.indexOf(parts[0].toLowerCase()) != -1) {
			user.rpschoice = parts[0];
		}
		else if (lcasearray.indexOf(target.substr(0, spind).toLowerCase()) != -1 ) {
			//this.sendReply("The proper syntaxis is /rps [choice],[targetuser]. The parameter [targetuser] is optional.");
			parts[0] = target.substr(0, spind);
			user.rpschoice = parts[0];
			parts[1] = target.substr(spind+1,target.length - spind - 1);
		}
		else
		{
			return this.sendReply("Want it or not, your choice is invalid! The proper syntaxis is /rps [choice],[targetuser].");
		}
		var targetuser =  Users.get(parts[1]);
		if (targetuser === null) {
			if(user.rpschallengedby === "" || !user.rpschallengedby) return this.sendReply("Your choice has been set to " + user.rpschoice + ".");
			this.parse('/rps '+parts[0]+","+user.rpschallengedby);
			return user.rpschallengedby = "";
		}
		else if (targetuser === undefined) {
			return this.sendReply("Your choice has been set to " + user.rpschoice + " but your opponent is not online or doesn't exist.");
		}
		if(targetuser == user) return this.sendReply("Your choice has been set to " + user.rpschoice + ", but remember that you can't play against yourself!");
		if (targetuser.blockrps) return this.sendReply("Your choice has been set to " + user.rpschoice + ". However, your opponent is currently blocking challenges to this game.");
		if (!targetuser.rpschoice || targetuser.rpschoice === "") {
			if (targetuser.popped) {
				targetuser.send(user.name+" has challenged you to a RPS-lizard-Spock game. Use the command /rps to play.")
			}
			else {
				targetuser.popped = true
				targetuser.popup(user.name+" has challenged you to a rock-paper-scissors-lizard-Spock game. Use the command /rps to play.");
			}
			targetuser.rpschallengedby = user;
			return this.sendReply("Your choice has been set to " + user.rpschoice + ". Hope that " + targetuser.name + " shoots " + getRPShope(user.rpschoice) + ".");
		}
		var msg = getRPSmsg(user.name,targetuser.name,user.rpschoice,targetuser.rpschoice);
		user.rpschoice = "";
		targetuser.rpschoice = "";
		if(user.can('broadcast') || targetuser.can('broadcast')) {
			return this.add(msg);
		}
		else {
			targetuser.send(msg);
			return this.sendReply(msg);
		}
	},
	
	disallowrps: 'blockrps',
	blockrps: function(target,room,user) {
		user.blockrps=true;
		return this.sendReply('RPS Challenges are now blocked.');
	},

	unblockrps: 'allowrps',	
	allowrps: function(target,room,user) {
		user.blockrps=false;
		return this.sendReply('RPS Challenges are now allowed.');
	},

// end rps commands

  ip: 'whois',
	getip: 'whois',
	rooms: 'whois',
	altcheck: 'whois',
	alt: 'whois',
	alts: 'whois',
	getalts: 'whois',
	whois: function(target, room, user) {
		var targetUser = this.targetUserOrSelf(target);
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}

		this.sendReply('User: '+targetUser.name);
		if (user.can('alts', targetUser.getHighestRankedAlt())) {
			var alts = targetUser.getAlts();
			var output = '';
			for (var i in targetUser.prevNames) {
				if (output) output += ", ";
				output += targetUser.prevNames[i];
			}
			if (output) this.sendReply('Previous names: '+output);

			for (var j=0; j<alts.length; j++) {
				var targetAlt = Users.get(alts[j]);
				if (!targetAlt.named && !targetAlt.connected) continue;

				this.sendReply('Alt: '+targetAlt.name);
				output = '';
				for (var i in targetAlt.prevNames) {
					if (output) output += ", ";
					output += targetAlt.prevNames[i];
				}
				if (output) this.sendReply('Previous names: '+output);
			}
		}
		if (config.groups[targetUser.group] && config.groups[targetUser.group].name) {
			this.sendReply('Group: ' + config.groups[targetUser.group].name + ' (' + targetUser.group + ')');
		}
		if (targetUser.staffAccess) {
			this.sendReply('(Pok\xE9mon Showdown Development Staff)');
		}
		if (!targetUser.authenticated) {
			this.sendReply('(Unregistered)');
		}
		if (!this.broadcasting && user.can('ip', targetUser)) {
			var ips = Object.keys(targetUser.ips);
			this.sendReply('IP' + ((ips.length > 1) ? 's' : '') + ': ' + ips.join(', '));
		}
		var output = 'In rooms: ';
		var first = true;
		for (var i in targetUser.roomCount) {
			if (i === 'global' || Rooms.get(i).isPrivate) continue;
			if (!first) output += ' | ';
			first = false;

			output += '<a href="/'+i+'" room="'+i+'">'+i+'</a>';
		}
		this.sendReply('|raw|'+output);
	},


//these commands go in config/commands.js
//look what i did -skrappy
	/*********************************************************
	 * MOTD
	 *********************************************************/
	motd: function(target, room, user) {					
		if (!this.canTalk()) return false;
		if ((!this.canBroadcast())||(!this.can('mute'))) {
			return this.sendReply(denied);
		}
		else if ((target==="")||(target.replace(/\s/g,"") == "")) {
			return this.sendReply('A Message of the Day should, you know, contain a message :)');
		} 
		else if (!(room.id === 'lobby')) {
			return this.sendReply('A Message of the Day can only be set in the lobby.');
		} 
		else {
			room.motd = target;
			room.motd = target.replace(/(<([^>]+)>)/ig,"");
			room.motdSet = user.name;
			this.addModCommand('|raw|<div style="background-color:#EEFFEE;border:1px solid #6688AA;padding:2px 4px">' +
								'<b>' + user.name + ' has set the Message of the Day to: </b><br />' + room.motd + '</div>');				
		}
	},

	clearmotd: function(target, room, user) {		
		if (!this.canTalk()) return false;
		if ((!this.canBroadcast())||(!this.can('mute'))) {
			return this.sendReply(denied);
		}
		else if (!(room.id === 'lobby')) {
			return this.sendReply('A Message of the Day can only be removed in the lobby.');
		} 
		else if (room.motd===""){
			return this.sendReply('|raw|<div><i>There currently is no Message of the Day</i></div>');
		}
		else {
			room.motd = "";
			room.motdSet = user.name;
			room.play = 0;
			this.addModCommand('|raw|<div style="background-color:#EEFFEE;border:1px solid #6688AA;padding:2px 4px">' +
			'<b>' + room.motdSet + ' has removed the Message of the Day</b><br /></div>');
		}
	},

	motdfreq: function(target, room, user) {
		if (!this.canTalk()) return false;
		if ((!this.canBroadcast())||(!this.can('mute'))) {
			return this.sendReply(denied);
		}
		else if (isNaN(target)) {
			return this.sendReply('The syntax for this command is /motdfreq #');
		}
		else if (!(room.id === 'lobby')) {
			return this.sendReply('A Message of the Day\'s frequency can only be set in the lobby.');
		} 
		else {
			room.motdfreq = parseInt(target);
			room.motdcount = room.motdfreq - 1;
			this.addModCommand('|raw|<div style="background-color:#EEFFEE;border:1px solid #6688AA;padding:2px 4px">' +
			'<b>' + user.name + ' has set the Message of the Day frequency to: </b><br />' + room.motdfreq + '</div>');
		}
	},

	checkmotd: function(target, room, user) {		
		if (!this.canTalk()) return false;
		if (!this.canBroadcast()) {
			return this.sendReply(denied);
		}
		else if (!(room.id === 'lobby')) {
			return this.sendReply('A Message of the Day can only be checked in the lobby.');
		} 
		else if ((room.motd==="")||(room.motd===undefined)){
			return this.sendReply('|raw|<div><i>There currently is no Message of the Day</i></div>');
		}
		else if (room.play===1){		
			return this.sendReply('|raw|<div style="background-color:#EEFFEE;border:1px solid #6688AA;padding:2px 4px">' +
			'<i>' + room.motdSet + ' has set the Message of the Day to: </i>' + room.motd + ' <i> (paused)</i></div>');
		}
		else {		
			return this.sendReply('|raw|<div style="background-color:#EEFFEE;border:1px solid #6688AA;padding:2px 4px">' +
			'<i>' + room.motdSet + ' has set the Message of the Day to: </i>' + room.motd + '</div>');
		}
	},

	pmotd: function(target, room, user) {					
		if (!this.canTalk()) return false;
		if ((!this.canBroadcast())||(!this.can('mute'))) {
			return this.sendReply(denied);
		}
		else if ((room.motd === "")||(room.motd === undefined)) {
			return this.sendReply('There currently is no Message of the Day to pause');
		} 
		else if (!(room.id === 'lobby')) {
			return this.sendReply('A Message of the Day can only be set in the lobby.');
		} 
		else if ((room.play===0)||(room.play===undefined)) {
			room.play = 1;
			this.addModCommand('|raw|<div style="background-color:#EEFFEE;border:1px solid #6688AA;padding:2px 4px">' +
								'<b><i>' + user.name + ' has paused the Message of the Day</b></i></div>');				
		}
		else {
			room.play = 0;
			this.addModCommand('|raw|<div style="background-color:#EEFFEE;border:1px solid #6688AA;padding:2px 4px">' +
								'<b><i>' + user.name + ' has resumed the Message of the Day broadcast</b></i></div>');				
		}
	},	
	/*********************************************************
	 * Shortcuts
	 *********************************************************/

	invite: function(target, room, user) {
		target = this.splitTarget(target);
		if (!this.targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		var roomid = (target || room.id);
		if (!Rooms.get(roomid)) {
			return this.sendReply('Room '+roomid+' not found.');
		}
		return this.parse('/msg '+this.targetUsername+', /invite '+roomid);
	},

	/*********************************************************
	 * Informational commands
	 *********************************************************/

	stats: 'data',
	dex: 'data',
	pokedex: 'data',
	data: function(target, room, user) {
		if (!this.canBroadcast()) return;

		var pokemon = Tools.getTemplate(target);
		var item = Tools.getItem(target);
		var move = Tools.getMove(target);
		var ability = Tools.getAbility(target);

		var data = '';
		if (pokemon.exists) {
			data += '|c|~|/data-pokemon '+pokemon.name+'\n';
		}
		if (ability.exists) {
			data += '|c|~|/data-ability '+ability.name+'\n';
		}
		if (item.exists) {
			data += '|c|~|/data-item '+item.name+'\n';
		}
		if (move.exists) {
			data += '|c|~|/data-move '+move.name+'\n';
		}
		if (!data) {
			data = "||No pokemon, item, move, or ability named '"+target+"' was found. (Check your spelling?)";
		}

		this.sendReply(data);
	},
                               ranks: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('+ <b>Knight</b> - Knights waist there time trying to use L coomands when they be using !<br />' +
			'% <b>Bishop</b> - Bishops live life in a way where they hope for this dumb sign to go away and become a rook<br />' +
			'@ <b>Rook</b> - The Rook bans and mutes when needed in a up-down-left-right position<br />' +
			'&amp; <b>Queen</b> - Queens server the king at all cost and makes new Rooks,Bishops ,and Knights<br />'+
			'~ <b>King</b> - Kings rule all with no rules');
	},
                                         
    
	bandicam: 'bandi',
bandi: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<h1>Staff Member Bandicam</h1>'+
                'Usernames: Bandi,Bandicam<br  />'+
                'Rank: Supreme Ruler<br  />'+
                'Help: Server Creator,Programming<br  />'+
                'About: Bandi is the creator and owner of The PowerHouse,<br />you should treat him with lots of respect.<br />');
}, 	

spbman: 'spbman1234',
spb: function(target, room, user) {
                if (!this.canBroadcast()) return;
      this.sendReplyBox('<h1>Staff Member Spbman</h1>'+     
                'Usernames: spbman1234<br />'+
                'Rank: Warrior(%)<br />'+
                'Help: Creation of forums,Rank name creation<br />'+
                'Personality: Nice,Sometimes Aggressive<br />'+    
                'About: spbman is truly one of the best auth around.<br />He also rivals with matts3ds a lot so there is a lot of joke locking.<br />Overall, he is one of the best auth and deserves a high standard of respect.');
},				

kalenz: 'slayer',
slayer: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<h2>Staff Member Slayer95</h2>'+
                'Usernames: Slayer95, Kalenz<br  />'+
                'Rank: Royalty(&)<br  />'+
                'Help: Development, Programming<br  />'+
                'About: Just some derp around here.<br />He plays with OU or random teams.<br />');
}, 





											 leagueintro: function(target, room, user) {
                                if (!this.canBroadcast()) return;
                                this.sendReplyBox('<b><font color="red">Bandicam League Rules:</font></b><ol>' +
                        '<li>Challenger or not NO STALLING at all.</li>' +
                        '<li>Gym leaders can have any team, just make sure it is allowed by an Elite 4 member.</li>' +
                        '<li>If you are a challenger, export a team in written form on this and send the link to an Elite 4 member to verify your team.</li>' +
                        '<li>If  you beat a gym leader, favorite or bookmark their badge as you will have to show the badges to gain access to the Elite 4.</li>' +
                        '<li>You can only battle a gym leader or Elite 4 once per day.</li>' +
                        '<li>Gym leaders cannot change their gym team. If they want to, they need permission from an Elite 4 member.</li>' +
                        '<li>Challengers: Once you have started the league with a team, you cannot change it.</li>' +
                        '<li>Have fun!!!</li>' +
                        '</ol>' +
                        'Website:<a href="http://creatorcoolasian.wix.com/thebandicamleague"target=_blank>Bandicam League</a>');
                                        },
										 bye: function(target, room, user) {
                                if (!user.can('promote')) {
                                        this.sendReply('/bye - Access denied.');
                                        }
                                else {
                                        this.sendReplyBox('<marquee behavior="scroll"><font size = 10 color="blue">Bye~</font></marquee>');
                                        }
                                },
                                                           
  brb: function(target, room, user) {
                                if (!user.can('promote')) {
                                        this.sendReply('/brb - Access denied.');
                                        }
                                else {
                                        this.sendReplyBox('<marquee behavior="scroll"><font size = 10 color="blue">I Will Be Right Back</font></marquee>');
                                        }
                                },
                                                             
  pom: function(target, room, user) {
                                if (!user.can('hotpatch')) {
                                        this.sendReply('/promoofmonth - Access denied.');
                                        }
                                else {
                                        this.sendReplyBox('<marquee behavior="scroll"><font size = 10 color="blue">Promotion of the month votes no voting yourself, pm Bandicam CoolAsian or TalkTakesTime to vote</font></marquee>');
                                        }
                                },
                                
 cabrb: function(target, room, user) {
                                if (!user.can('promote')) {
                                        this.sendReply('/applause - Access denied.');
                                        }
                                else {
                                        this.sendReplyBox('<marquee behavior="scroll"><font size = 10 color="blue">coolasian will be back in jiffy</font></marquee>');
                                        }
									},	
                                          
 applause: function(target, room, user) {
                                if (!user.can('promote')) {
                                        this.sendReply('/applause - Access denied.');
                                        }
                                else {
                                        this.sendReplyBox('<marquee behavior="scroll"><font size = 10 color="blue">APPLAUSE!</font></marquee>');
                                        }
                                },
                               
 welcome: function(target, room, user) {
                                if (!user.can('promote')) {
                                        this.sendReply('/welcome - Access denied.');
                                        }
                               else {
                                        this.sendReplyBox('<marquee behavior="scroll"><font size = 10 color="blue">Welcome to The Powerhouse!</font></marquee>');
                                        }
                                },



 peton: function(target, room, user) {
								if(!user.can('mute')) {
										return this.sendReply('but it failed.');
								}
								else {
									if(canpet == true) {
										return this.sendReply('/pet is already on.');
									}
									if(canpet == false) {
										this.sendReply('You turned on /pet.');
										canpet = true;
									}
								}
},

petoff: function(target, room, user) {
								if(!user.can('mute')){
									return this.sendReply('but it failed.');
								}
								else {
									if(canpet == false) {
										return this.sendReply('/pet is already off.');
								}
									if(canpet == true) {
										this.sendReply('You turned off /pet.');
										canpet = false;
									}
								}
},

pet: function(target, room, user) {
if(canpet == false) {
return this.sendReply('but it failed.');
}
if(canpet == true) {
         if (!target) {
                 return this.sendReply('Please specify a user who you\'d like to pet.');
         }
         var targetUser = Users.get(target);
         if (targetUser) {
                 target = targetUser.userid;
                 }
         else {
                 return this.sendReply('The user \'' + target + '\' doesn\'t exist.');
         }
if(!this.canTalk()) {
return this.sendReply('You cannot use this command because you are muted.');
}
         this.add(user.name + ' pet ' + targetUser.name + '.');
}
         },
		 spon: function(target, room, user) {
if(!user.can('mute')) {
return this.sendReply('You do not have the authority to use this command.');
}
else {
if(canpet == true) {
return this.sendReply('/sp is already on.');
}
if(canpet == false) {
this.sendReply('You turned on /sp.');
canpet = true;
}
}
},

spoff: function(target, room, user) {
if(!user.can('mute')){
return this.sendReply('but it failed.');
}
else {
if(canpet == false) {
return this.sendReply('but it failed.');
}
if(canpet == true) {
this.sendReply('You turned off /sp.');
canpet = false;
}
}
},

sp: function(target, room, user) {
if(canpet == false) {
return this.sendReply('but it failed.');
}
if(canpet == true) {
         if (!target) {
                 return this.sendReply('Please specify a user who you\'d like to sucker punch.');
         }
         var targetUser = Users.get(target);
         if (targetUser) {
                 target = targetUser.userid;
                 }
         else {
                 return this.sendReply('The user \'' + target + '\' doesn\'t exist.');
         }
if(!this.canTalk()) {
return this.sendReply('but it failed.');
}
         this.add(user.name + ' sucker punch ' + targetUser.name + '.');
}
         },

    staff: function(target, room, user) {
                                    if (!this.canBroadcast()) return;
                                    this.sendReplyBox('<a href = "https://docs.google.com/document/d/1LaK5vRlYAfo84BLcq-DqtMvrWCrq8Xt4ll9L6qNcAwI/edit"target=_blank>Staff</a>');
                                    },

rule: 'rules',
	rules: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Please follow thepowerhouses rules:<br />' +
			'- <a href="https://docs.google.com/document/d/1XfzhIFbSEra6syVzwiBgozMSKTJLqeglI68Nwbvx0II/edit" target="_blank">Rules</a><br />' +
			'</div>');
},	
forums: function(target, room, user) {
                                    if (!this.canBroadcast()) return;
                                    this.sendReplyBox('<a href = "http://thepowerhouse.forumotion.com/"target=_blank>Forums</a>');
},

                             
         sighon: function(target, room, user) {
if (!user.can('mute')) {
return this.sendReply('You do not have the authority to use this command.');
}
else {
if (sigh === true) { //here you reference the variable "sigh"
return this.sendReply('/sigh is already on.');
}
if (sigh === false) { // as well as here
this.sendReply('You turned on /sigh.');

sigh = true; //however, here you use canpet. nowhere is there a way to set the variable sigh to true or false
}
}
},


sighoff: function(target, room, user) {
if (!user.can('mute')){//wow
return this.sendReply('sigh is now off.');
}
else {
if (sigh === false) { //same here
return this.sendReply('b.');
}
if (sigh === true) {
this.sendReply('sigh is already off.');
sigh = false;
}
}
},

sigh: function(target, room, user) {
if (!this.canTalk()) {
return this.sendReply('you cannot sigh because you are muted or locked');
} else if (sigh === false) {
return this.sendReply('It is too good of a time to sigh.');
} else if (sigh === true) {
 this.add(user.name+ " sighs.");
}
         },
         
         
         fleeon: function(target, room, user) {
if (!user.can('mute')) {
return this.sendReply('You do not have the authority to use this command.');
}
else {
if (sigh === true) { //here you reference the variable "sigh"
return this.sendReply('/flee is already on.');
}
if (sigh === false) { // as well as here
this.sendReply('You turned on /flee.');

sigh = true; //however, here you use canpet. nowhere is there a way to set the variable sigh to true or false
}
}
},


fleeoff: function(target, room, user) {
if (!user.can('mute')){//wow
return this.sendReply('flee is now off.');
}
else {
if (sigh === false) { //same here
return this.sendReply('b.');
}
if (sigh === true) {
this.sendReply('flee is already off.');
sigh = false;
}
}
},

flee: function(target, room, user) {
if (!this.canTalk()) {
return this.sendReply('you cannot sigh because you are muted or locked');
} else if (sigh === false) {
return this.sendReply('It is too good of a time to sigh.');
} else if (sigh === true) {
 this.add(user.name+ " flees.");
}
         },

	learnset: 'learn',
	learnall: 'learn',
	learn5: 'learn',
	learn: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help learn');

		if (!this.canBroadcast()) return;

		var lsetData = {set:{}};
		var targets = target.split(',');
		var template = Tools.getTemplate(targets[0]);
		var move = {};
		var problem;
		var all = (cmd === 'learnall');
		if (cmd === 'learn5') lsetData.set.level = 5;

		if (!template.exists) {
			return this.sendReply('Pokemon "'+template.id+'" not found.');
		}

		if (targets.length < 2) {
			return this.sendReply('You must specify at least one move.');
		}

		for (var i=1, len=targets.length; i<len; i++) {
			move = Tools.getMove(targets[i]);
			if (!move.exists) {
				return this.sendReply('Move "'+move.id+'" not found.');
			}
			problem = Tools.checkLearnset(move, template, lsetData);
			if (problem) break;
		}
		var buffer = ''+template.name+(problem?" <span class=\"message-learn-cannotlearn\">can't</span> learn ":" <span class=\"message-learn-canlearn\">can</span> learn ")+(targets.length>2?"these moves":move.name);
		if (!problem) {
			var sourceNames = {E:"egg",S:"event",D:"dream world"};
			if (lsetData.sources || lsetData.sourcesBefore) buffer += " only when obtained from:<ul class=\"message-learn-list\">";
			if (lsetData.sources) {
				var sources = lsetData.sources.sort();
				var prevSource;
				var prevSourceType;
				for (var i=0, len=sources.length; i<len; i++) {
					var source = sources[i];
					if (source.substr(0,2) === prevSourceType) {
						if (prevSourceCount < 0) buffer += ": "+source.substr(2);
						else if (all || prevSourceCount < 3) buffer += ', '+source.substr(2);
						else if (prevSourceCount == 3) buffer += ', ...';
						prevSourceCount++;
						continue;
					}
					prevSourceType = source.substr(0,2);
					prevSourceCount = source.substr(2)?0:-1;
					buffer += "<li>gen "+source.substr(0,1)+" "+sourceNames[source.substr(1,1)];
					if (prevSourceType === '5E' && template.maleOnlyDreamWorld) buffer += " (cannot have DW ability)";
					if (source.substr(2)) buffer += ": "+source.substr(2);
				}
			}
			if (lsetData.sourcesBefore) buffer += "<li>any generation before "+(lsetData.sourcesBefore+1);
			buffer += "</ul>";
		}
		this.sendReplyBox(buffer);
	},

	weak: 'weakness',
	weakness: function(target, room, user){
		var targets = target.split(/[ ,\/]/);

		var pokemon = Tools.getTemplate(target);
		var type1 = Tools.getType(targets[0]);
		var type2 = Tools.getType(targets[1]);

		if (pokemon.exists) {
			target = pokemon.species;
		} else if (type1.exists && type2.exists) {
			pokemon = {types: [type1.id, type2.id]};
			target = type1.id + "/" + type2.id;
		} else if (type1.exists) {
			pokemon = {types: [type1.id]};
			target = type1.id;
		} else {
			return this.sendReplyBox(target + " isn't a recognized type or pokemon.");
		}

		var weaknesses = [];
		Object.keys(Data.base.TypeChart).forEach(function (type) {
			var notImmune = Tools.getImmunity(type, pokemon);
			if (notImmune) {
				var typeMod = Tools.getEffectiveness(type, pokemon);
				if (typeMod == 1) weaknesses.push(type);
				if (typeMod == 2) weaknesses.push("<b>" + type + "</b>");
			}
		});

		if (!weaknesses.length) {
			this.sendReplyBox(target + " has no weaknesses.");
		} else {
			this.sendReplyBox(target + " is weak to: " + weaknesses.join(', ') + " (not counting abilities).");
		}
	},

	matchup: 'effectiveness',
	effectiveness: function(target, room, user) {
		var targets = target.split(/[,/]/);
		var type = Tools.getType(targets[1]);
		var pokemon = Tools.getTemplate(targets[0]);
		var defender;

		if (!pokemon.exists || !type.exists) {
			// try the other way around
			pokemon = Tools.getTemplate(targets[1]);
			type = Tools.getType(targets[0]);
		}
		defender = pokemon.species+' (not counting abilities)';

		if (!pokemon.exists || !type.exists) {
			// try two types
			if (Tools.getType(targets[0]).exists && Tools.getType(targets[1]).exists) {
				// two types
				type = Tools.getType(targets[0]);
				defender = Tools.getType(targets[1]).id;
				pokemon = {types: [defender]};
				if (Tools.getType(targets[2]).exists) {
					defender = Tools.getType(targets[1]).id + '/' + Tools.getType(targets[2]).id;
					pokemon = {types: [Tools.getType(targets[1]).id, Tools.getType(targets[2]).id]};
				}
			} else {
				if (!targets[1]) {
					return this.sendReply("Attacker and defender must be separated with a comma.");
				}
				return this.sendReply("'"+targets[0].trim()+"' and '"+targets[1].trim()+"' aren't a recognized combination.");
			}
		}

		if (!this.canBroadcast()) return;

		var typeMod = Tools.getEffectiveness(type.id, pokemon);
		var notImmune = Tools.getImmunity(type.id, pokemon);
		var factor = 0;
		if (notImmune) {
			factor = Math.pow(2, typeMod);
		}

		this.sendReplyBox(''+type.id+' attacks are '+factor+'x effective against '+defender+'.');
	},

	uptime: function(target, room, user) {
		if (!this.canBroadcast()) return;
		var uptime = process.uptime();
		var uptimeText;
		if (uptime > 24*60*60) {
			var uptimeDays = Math.floor(uptime/(24*60*60));
			uptimeText = ''+uptimeDays+' '+(uptimeDays == 1 ? 'day' : 'days');
			var uptimeHours = Math.floor(uptime/(60*60)) - uptimeDays*24;
			if (uptimeHours) uptimeText += ', '+uptimeHours+' '+(uptimeHours == 1 ? 'hour' : 'hours');
		} else {
			uptimeText = uptime.seconds().duration();
		}
		this.sendReplyBox('Uptime: <b>'+uptimeText+'</b>');
	},


	opensource: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Our Opensource<br />' +
	                '- Language: JavaScript <a href="https://github.com/bandigroup/Pokemon-Showdown" target="_blank">TPH Server Source Code</a>');
	},

	avatars: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Your avatar can be changed using the Options menu (it looks like a gear) in the upper right of Pokemon Showdown.');
	},

	introduction: 'intro',
	intro: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('New to ThePowerHouse<br />' +
			'- <a href="https://docs.google.com/document/d/1LaK5vRlYAfo84BLcq-DqtMvrWCrq8Xt4ll9L6qNcAwI" target="_blank">Staff</a><br />' +
			'- <a href="https://docs.google.com/document/d/1XfzhIFbSEra6syVzwiBgozMSKTJLqeglI68Nwbvx0II" target="_blank">Rules</a><br />' +
			'- <a href="http://thepowerhouse.forumotion.com" target="_blank">Forums</a>');
	},

	calculator: 'calc',
	calc: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Pokemon Showdown! damage calculator. (Courtesy of Honko)<br />' +
			'- <a href="http://pokemonshowdown.com/damagecalc/" target="_blank">Damage Calculator</a>');
	},

	cap: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('An introduction to the Create-A-Pokemon project:<br />' +
			'- <a href="http://www.smogon.com/cap/" target="_blank">CAP project website and description</a><br />' +
			'- <a href="http://www.smogon.com/forums/showthread.php?t=48782" target="_blank">What Pokemon have been made?</a><br />' +
			'- <a href="http://www.smogon.com/forums/showthread.php?t=3464513" target="_blank">Talk about the metagame here</a><br />' +
			'- <a href="http://www.smogon.com/forums/showthread.php?t=3466826" target="_blank">Practice BW CAP teams</a>');
	},

	om: 'oms',
	oms: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Our Other Metagames By: Mrsmellyfeet100 bandicam,Slayer95</br >' +
			'- <a href="https://docs.google.com/document/d/1zH3-YpuyuJo4trjpjO-fuYKnhrYgYkYDswOt8y0vL7M/edit"target="_blank">Sky Battles</a>');



	},






	analysis: 'smogdex',
	strategy: 'smogdex',
	smogdex: function(target, room, user) {
		if (!this.canBroadcast()) return;

		var targets = target.split(',');
		var pokemon = Tools.getTemplate(targets[0]);
		var item = Tools.getItem(targets[0]);
		var move = Tools.getMove(targets[0]);
		var ability = Tools.getAbility(targets[0]);
		var atLeastOne = false;
		var generation = (targets[1] || "bw").trim().toLowerCase();
		var genNumber = 5;

		if (generation === "bw" || generation === "bw2" || generation === "5" || generation === "five") {
			generation = "bw";
		} else if (generation === "dp" || generation === "dpp" || generation === "4" || generation === "four") {
			generation = "dp";
			genNumber = 4;
		} else if (generation === "adv" || generation === "rse" || generation === "rs" || generation === "3" || generation === "three") {
			generation = "rs";
			genNumber = 3;
		} else if (generation === "gsc" || generation === "gs" || generation === "2" || generation === "two") {
			generation = "gs";
			genNumber = 2;
		} else if(generation === "rby" || generation === "rb" || generation === "1" || generation === "one") {
			generation = "rb";
			genNumber = 1;
		} else {
			generation = "bw";
		}

		// Pokemon
		if (pokemon.exists) {
			atLeastOne = true;
			if (genNumber < pokemon.gen) {
				return this.sendReplyBox(pokemon.name+' did not exist in '+generation.toUpperCase()+'!');
			}
			if (pokemon.tier === 'G4CAP' || pokemon.tier === 'G5CAP') {
				generation = "cap";
			}STA

			var poke = pokemon.name.toLowerCase();
			if (poke === 'nidoranm') poke = 'nidoran-m';
			if (poke === 'nidoranf') poke = 'nidoran-f';
			if (poke === 'farfetch\'d') poke = 'farfetchd';
			if (poke === 'mr. mime') poke = 'mr_mime';
			if (poke === 'mime jr.') poke = 'mime_jr';
			if (poke === 'deoxys-attack' || poke === 'deoxys-defense' || poke === 'deoxys-speed' || poke === 'kyurem-black' || poke === 'kyurem-white') poke = poke.substr(0,8);
			if (poke === 'wormadam-trash') poke = 'wormadam-s';
			if (poke === 'wormadam-sandy') poke = 'wormadam-g';
			if (poke === 'rotom-wash' || poke === 'rotom-frost' || poke === 'rotom-heat') poke = poke.substr(0,7);
			if (poke === 'rotom-mow') poke = 'rotom-c';
			if (poke === 'rotom-fan') poke = 'rotom-s';
			if (poke === 'giratina-origin' || poke === 'tornadus-therian' || poke === 'landorus-therian') poke = poke.substr(0,10);
			if (poke === 'shaymin-sky') poke = 'shaymin-s';
			if (poke === 'arceus') poke = 'arceus-normal';
			if (poke === 'thundurus-therian') poke = 'thundurus-t';

			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/pokemon/'+poke+'" target="_blank">'+generation.toUpperCase()+' '+pokemon.name+' analysis</a>, brought to you by <a href="http://www.smogon.com" target="_blank">Smogon University</a>');
		}

		// Item
		if (item.exists && genNumber > 1 && item.gen <= genNumber) {
			atLeastOne = true;
			var itemName = item.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/items/'+itemName+'" target="_blank">'+generation.toUpperCase()+' '+item.name+' item analysis</a>, brought to you by <a href="http://www.smogon.com" target="_blank">Smogon University</a>');
		}

		// Ability
		if (ability.exists && genNumber > 2 && ability.gen <= genNumber) {
			atLeastOne = true;
			var abilityName = ability.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/abilities/'+abilityName+'" target="_blank">'+generation.toUpperCase()+' '+ability.name+' ability analysis</a>, brought to you by <a href="http://www.smogon.com" target="_blank">Smogon University</a>');
		}

		// Move
		if (move.exists && move.gen <= genNumber) {
			atLeastOne = true;
			var moveName = move.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/moves/'+moveName+'" target="_blank">'+generation.toUpperCase()+' '+move.name+' move analysis</a>, brought to you by <a href="http://www.smogon.com" target="_blank">Smogon University</a>');
		}

		if (!atLeastOne) {
			return this.sendReplyBox('Pokemon, item, move, or ability not found for generation ' + generation.toUpperCase() + '.');
		}
	},

	/*********************************************************
	 * Miscellaneous commands
	 *********************************************************/

	birkal: function(target, room, user) {
		this.sendReply("It's still very funny.");
	},

	potd: function(target, room, user) {
		if (!this.can('potd')) return false;

		config.potd = target;
		Simulator.SimulatorProcess.eval('config.potd = \''+toId(target)+'\'');
		if (target) {
			Rooms.lobby.addRaw('<div class="broadcast-blue"><b>The Pokemon of the Day is now '+target+'!</b><br />This Pokemon will be guaranteed to show up in random battles.</div>');
			this.logModCommand('The Pokemon of the Day was changed to '+target+' by '+user.name+'.');
		} else {
			Rooms.lobby.addRaw('<div class="broadcast-blue"><b>The Pokemon of the Day was removed!</b><br />No pokemon will be guaranteed in random battles.</div>');
			this.logModCommand('The Pokemon of the Day was removed by '+user.name+'.');
		}
	},

	register: function() {
		if (!this.canBroadcast()) return;
		this.sendReply("You must win a rated battle to register.");
	},

	br: 'banredirect',
	banredirect: function() {
		this.sendReply('/banredirect - This command is obsolete and has been removed.');
	},

	redir: 'redirect',
	redirect: function() {
		this.sendReply('/redirect - This command is obsolete and has been removed.');
	},

	lobbychat: function(target, room, user, connection) {
		target = toId(target);
		if (target === 'off') {
			user.leaveRoom(Rooms.lobby, connection.socket);
			sendData(connection.socket, '|users|');
			this.sendReply('You are now blocking lobby chat.');
		} else {
			user.joinRoom(Rooms.lobby, connection);
			this.sendReply('You are now receiving lobby chat.');
		}
	},

	a: function(target, room, user) {
		if (!this.can('battlemessage')) return false;
		// secret sysop command
		room.add(target);
	},

	/*********************************************************
	 * Help commands
	 *********************************************************/

	commands: 'help',
	h: 'help',
	'?': 'help',
	help: function(target, room, user) {
		target = target.toLowerCase();
		var matched = false;
		if (target === 'all' || target === 'msg' || target === 'pm' || target === 'whisper' || target === 'w') {
			matched = true;
			this.sendReply('/msg OR /whisper OR /w [username], [message] - Send a private message.');
		}
		if (target === 'all' || target === 'r' || target === 'reply') {
			matched = true;
			this.sendReply('/reply OR /r [message] - Send a private message to the last person you received a message from, or sent a message to.');
		}
		if (target === 'all' || target === 'getip' || target === 'ip') {
			matched = true;
			this.sendReply('/ip - Get your own IP address.');
			this.sendReply('/ip [username] - Get a user\'s IP address. Requires: @ & ~');
		}
		if (target === 'all' || target === 'rating' || target === 'ranking' || target === 'rank' || target === 'ladder') {
			matched = true;
			this.sendReply('/rating - Get your own rating.');
			this.sendReply('/rating [username] - Get user\'s rating.');
		}
		if (target === 'all' || target === 'nick') {
			matched = true;
			this.sendReply('/nick [new username] - Change your username.');
		}
		if (target === 'all' || target === 'avatar') {
			matched = true;
			this.sendReply('/avatar [new avatar number] - Change your trainer sprite.');
		}
		if (target === 'all' || target === 'rooms') {
			matched = true;
			this.sendReply('/rooms [username] - Show what rooms a user is in.');
		}
		if (target === 'all' || target === 'whois') {
			matched = true;
			this.sendReply('/whois [username] - Get details on a username: group, and rooms.');
		}
		if (target === 'all' || target === 'data') {
			matched = true;
			this.sendReply('/data [pokemon/item/move/ability] - Get details on this pokemon/item/move/ability.');
			this.sendReply('!data [pokemon/item/move/ability] - Show everyone these details. Requires: + % @ & ~');
		}
		if (target === "all" || target === 'analysis') {
			matched = true;
			this.sendReply('/analysis [pokemon], [generation] - Links to the Smogon University analysis for this Pokemon in the given generation.');
			this.sendReply('!analysis [pokemon], [generation] - Shows everyone this link. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'groups') {
			matched = true;
			this.sendReply('/groups - Explains what the + % @ & next to people\'s names mean.');
			this.sendReply('!groups - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'opensource') {
			matched = true;
			this.sendReply('/opensource - Links to PS\'s source code repository.');
			this.sendReply('!opensource - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'avatars') {
			matched = true;
			this.sendReply('/avatars - Explains how to change avatars.');
			this.sendReply('!avatars - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'intro') {
			matched = true;
			this.sendReply('/intro - Provides an introduction to competitive pokemon.');
			this.sendReply('!intro - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'cap') {
			matched = true;
			this.sendReply('/cap - Provides an introduction to the Create-A-Pokemon project.');
			this.sendReply('!cap - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'om') {
			matched = true;
			this.sendReply('/om - Provides links to information on the Other Metagames.');
			this.sendReply('!om - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'learn' || target === 'learnset' || target === 'learnall') {
			matched = true;
			this.sendReply('/learn [pokemon], [move, move, ...] - Displays how a Pokemon can learn the given moves, if it can at all.')
			this.sendReply('!learn [pokemon], [move, move, ...] - Show everyone that information. Requires: + % @ & ~')
		}
		if (target === 'all' || target === 'calc' || target === 'caclulator') {
			matched = true;
			this.sendReply('/calc - Provides a link to a damage calculator');
			this.sendReply('!calc - Shows everyone a link to a damage calculator. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'blockchallenges' || target === 'away' || target === 'idle') {
			matched = true;
			this.sendReply('/away - Blocks challenges so no one can challenge you. Deactivate it with /back.');
		}
		if (target === 'all' || target === 'allowchallenges' || target === 'back') {
			matched = true;
			this.sendReply('/back - Unlocks challenges so you can be challenged again. Deactivate it with /away.');
		}
		if (target === 'all' || target === 'faq') {
			matched = true;
			this.sendReply('/faq [theme] - Provides a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them.');
			this.sendReply('!faq [theme] - Shows everyone a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'highlight') {
			matched = true;
			this.sendReply('Set up highlights:');
			this.sendReply('/highlight add, word - add a new word to the highlight list.');
			this.sendReply('/highlight list - list all words that currently highlight you.');
			this.sendReply('/highlight delete, word - delete a word from the highlight list.');
			this.sendReply('/highlight delete - clear the highlight list');
		}
		if (target === 'all' || target === 'timestamps') {
			matched = true;
			this.sendReply('Set your timestamps preference:');
			this.sendReply('/timestamps [all|lobby|pms], [minutes|seconds|off]');
			this.sendReply('all - change all timestamps preferences, lobby - change only lobby chat preferences, pms - change only PM preferences');
			this.sendReply('off - set timestamps off, minutes - show timestamps of the form [hh:mm], seconds - show timestamps of the form [hh:mm:ss]');
		}
		if (target === 'all' || target === 'effectiveness') {
			matched = true;
			this.sendReply('/effectiveness [type1], [type2] - Provides the effectiveness of a [type1] attack to a [type2] Pokémon.');
			this.sendReply('!effectiveness [type1], [type2] - Shows everyone the effectiveness of a [type1] attack to a [type2] Pokémon.');
		}
		if (target === 'all' || target === 'rps') {
			matched = true;
			this.sendReplyBox('/rps [choice], [username] - Challenges [username] to a rock-paper-scissors-lizard-Spock game and uses [choice]. A summary of the game rules can be found in </br >' + '<a href="http://upload.wikimedia.org/wikipedia/commons/f/fe/Rock_Paper_Scissors_Lizard_Spock_en.svg">Wikimedia</a>' + '. The commands /rock, /paper, /scissors, /lizard, and /spock are available as shorcuts');
		}
		if (target === 'all' || target === 'blockrps') {
			matched = true;
			this.sendReply('/blockrps - Blocks RPS challenges so no one can challenge you. Deactivate it with /allowrps.');
		}
		if (target === 'all' || target === 'allowrps') {
			matched = true;
			this.sendReply('/allowrps - Unlocks RPS challenges so you can be challenged again. Deactivate it with /blockrps');
		}
		if (target === '%' || target === 'altcheck' || target === 'alt' || target === 'alts' || target === 'getalts') {
			matched = true;
			this.sendReply('/alts OR /altcheck OR /alt OR /getalts [username] - Get a user\'s alts. Requires: @ & ~');
		}
		if (target === '%' || target === 'forcerename' || target === 'fr') {
			matched = true;
			this.sendReply('/forcerename OR /fr [username], [reason] - Forcibly change a user\'s name and shows them the [reason]. Requires: @ & ~');
		}
		if (target === '@' || target === 'ban' || target === 'b') {
			matched = true;
			this.sendReply('/ban OR /b [username], [reason] - Kick user from all rooms and ban user\'s IP address with reason. Requires: @ & ~');
		}
		if (target === '@' || target === 'unban') {
			matched = true;
			this.sendReply('/unban [username] - Unban a user. Requires: @ & ~');
		}
		if (target === '@' || target === 'unbanall') {
			matched = true;
			this.sendReply('/unbanall - Unban all IP addresses. Requires: @ & ~');
		}
		if (target === '%' || target === 'modlog') {
			matched = true;
			this.sendReply('/modlog [n] - If n is a number or omitted, display the last n lines of the moderator log. Defaults to 15. If n is not a number, search the moderator log for "n". Requires: @ & ~');
		}
		if (target === "%" || target === 'kickbattle ') {
			matched = true;
			this.sendReply('/kickbattle [username], [reason] - Kicks an user from a battle with reason. Requires: % @ & ~');
		}
		if (target === "%" || target === 'warn' || target === 'k') {
			matched = true;
			this.sendReply('/warn OR /k [username], [reason] - Warns a user showing them the Pokemon Showdown Rules and [reason] in an overlay. Requires: % @ & ~');
		}
		if (target === '%' || target === 'mute' || target === 'm') {
			matched = true;
			this.sendReply('/mute OR /m [username], [reason] - Mute user with reason for 7 minutes. Requires: % @ & ~');
		}
		if (target === '%' || target === 'hourmute') {
			matched = true;
			this.sendReply('/hourmute , [reason] - Mute user with reason for an hour. Requires: % @ & ~');
		}	
		if (target === '%' || target === 'unmute') {
			matched = true;
			this.sendReply('/unmute [username] - Remove mute from user. Requires: % @ & ~');
		}
		if (target === '&' || target === 'promote') {
			matched = true;
			this.sendReply('/promote [username], [group] - Promotes the user to the specified group or next ranked group. Requires: & ~');
		}
		if (target === '&' || target === 'demote') {
			matched = true;
			this.sendReply('/demote [username], [group] - Demotes the user to the specified group or previous ranked group. Requires: & ~');
		}
		if (target === '~' || target === 'forcerenameto' || target === 'frt') {
			matched = true;
			this.sendReply('/forcerenameto OR /frt [username] - Force a user to choose a new name. Requires: & ~');
			this.sendReply('/forcerenameto OR /frt [username], [new name] - Forcibly change a user\'s name to [new name]. Requires: & ~');
		}
		if (target === '&' || target === 'forcetie') {
			matched = true;
			this.sendReply('/forcetie - Forces the current match to tie. Requires: & ~');
		}
		if (target === '&' || target === 'declare' ) {
			matched = true;
			this.sendReply('/declare [message] - Anonymously announces a message. Requires: & ~');
		}
		if (target === '&' || target === 'potd' ) {
			matched = true;
			this.sendReply('/potd [pokemon] - Sets the Random Battle Pokemon of the Day. Requires: & ~');
		}
		if (target === '%' || target === 'announce' || target === 'wall' ) {
			matched = true;
			this.sendReply('/announce OR /wall [message] - Makes an announcement. Requires: % @ & ~');
		}
		if (target === '@' || target === 'modchat') {
			matched = true;
			this.sendReply('/modchat [off/registered/+/%/@/&/~] - Set the level of moderated chat. Requires: @ & ~');
		}
		if (target === '~' || target === 'hotpatch') {
			matched = true;
			this.sendReply('Hot-patching the game engine allows you to update parts of Showdown without interrupting currently-running battles. Requires: ~');
			this.sendReply('Hot-patching has greater memory requirements than restarting.');
			this.sendReply('/hotpatch chat - reload chat-commands.js');
			this.sendReply('/hotpatch battles - spawn new simulator processes');
			this.sendReply('/hotpatch formats - reload the tools.js tree, rebuild and rebroad the formats list, and also spawn new simulator processes');
		}
		if (target === '~' || target === 'lockdown') {
			matched = true;
			this.sendReply('/lockdown - locks down the server, which prevents new battles from starting so that the server can eventually be restarted. Requires: ~');
		}
		if (target === '~' || target === 'kill') {
			matched = true;
			this.sendReply('/kill - kills the server. Can\'t be done unless the server is in lockdown state. Requires: ~');
		}
		if (target === 'all' || target === 'help' || target === 'h' || target === '?' || target === 'commands') {
			matched = true;
			this.sendReply('/help OR /h OR /? - Gives you help.');
		}
		if (!target) {
			this.sendReply('COMMANDS: /msg, /reply, /ip, /rating, /nick, /avatar, /rooms, /whois, /help, /away, /back, /ignore, /reject, /rejectall, /timestamps');
			this.sendReply('INFORMATIONAL COMMANDS: /data, /groups, /opensource, /avatars, /faq, /rules, /intro, /tiers, /othermetas, /learn, /analysis, /calc (replace / with ! to broadcast. (Requires: + % @ & ~))');
			this.sendReply('TOURNAMENT COMMANDS: /tour, /endtour, /toursize, /jointour, /forcejoin, /leavetour, /forceleave, /remind, /viewround, /disqualify, /replace');
			this.sendReply('OTHER COMMANDS: /rps, /blockrps, /allowrps, /rock, /paper, /scissors, /lizard, /spock');
			this.sendReply('For details on all commands, use /help all');
			if (user.group !== config.groupsranking[0]) {
				this.sendReply('DRIVER COMMANDS: /mute, /unmute, /announce, /forcerename, /alts')
				this.sendReply('MODERATOR COMMANDS: /ban, /unban, /unbanall, /ip, /modlog, /redirect, /kick');
				this.sendReply('LEADER COMMANDS: /promote, /demote, /forcewin, /forcetie, /declare');
				this.sendReply('For details on all moderator commands, use /help @');
			}
			this.sendReply('For details of a specific command, use something like: /help data');
		} else if (!matched) {
			this.sendReply('The command "/'+target+'" was not found. Try /help for general help');
		}
	},

};

function getRPSmsg(name1, name2, choice1, choice2) {
	var winner = ""
	var loser = ""
	var wchoice = ""
	var lchoice = ""
	var context = " in a rock-paper-scissors-lizard-Spock match."
	choice1 = choice1.toLowerCase()
	choice2 = choice2.toLowerCase()
	if (choice1 === "spock") choice1 = "Spock"
	if (choice2 === "spock") choice2 = "Spock"
	if (choice1 === choice2) {
		return ('|raw|<div>' + 'The rock-paper-scissors-lizard-Spock match between ' + '<b>' + name1 + " and " + name2 + '</b>' + ' ended in a ' + '<i>' + choice1 + '</i>' + '<b>' + ' tie.' + '</b>' + '</div>');
	}
	else if (choice1 === "rock") {
		switch (choice2) {
			case "scissors": winner=name1; wchoice=choice1; loser=name2; lchoice=choice2; action="crushed "; break;
			case "lizard": winner=name1; wchoice=choice1; loser=name2; lchoice=choice2; action="crushed "; break;
			case "Spock": winner=name2; wchoice=choice2; loser=name1; lchoice=choice1; action="vaporized "; break;
			default: winner=name2; wchoice=choice2; loser=name1; lchoice=choice1; action="covered "; break;
		}
	}
	else if (choice1 === "lizard") {
		switch (choice2) {
			case "Spock": winner=name1; wchoice=choice1; loser=name2; lchoice=choice2; action="poisoned "; break;
			case "paper": winner=name1; wchoice=choice1; loser=name2; lchoice=choice2; action="eaten "; break;
			case "scissors": winner=name2; wchoice=choice2; loser=name1; lchoice=choice1; action="decapitated "; break;
			default: winner=name2; wchoice=choice2; loser=name1; lchoice=choice1; action="crushed "; break;
		 }
	}
	else if (choice1 === "Spock") {
		switch (choice2) {
			case "scissors": winner=name1; wchoice=choice1; loser=name2; lchoice=choice2; action="smashed "; break;
			case "rock":  winner=name1; wchoice=choice1; loser=name2; lchoice=choice2; action="vaporized "; break;
			case "paper":  winner=name2; wchoice=choice2; loser=name1; lchoice=choice1; action="disproven "; break;
			default:  winner=name2; wchoice=choice2; loser=name1; lchoice=choice1; action="poisoned "; break;
		}
	}
	else if (choice1 === "scissors") {
		switch (choice2) {
			case "lizard": winner=name1; wchoice=choice1; loser=name2; lchoice=choice2; action="decapitated "; break;
			case "paper": winner=name1; wchoice=choice1; loser=name2; lchoice=choice2; action="cut "; break;
			case "Spock": winner=name2; wchoice=choice2; loser=name1; lchoice=choice1; action="smashed "; break;
			default:  winner=name2; wchoice=choice2; loser=name1; lchoice=choice1; action="crushed "; break;
		}
	}
	else {
		switch (choice2) {
			case "Spock":  winner=name1; wchoice=choice1; loser=name2; lchoice=choice2; action="disproven "; break;
			case "rock":  winner=name1; wchoice=choice1; loser=name2; lchoice=choice2; action="covered "; break;
			case "scissors":  winner=name2; wchoice=choice2; loser=name1; lchoice=choice1; action="cut "; break;
			default:  winner=name2; wchoice=choice2; loser=name1; lchoice=choice1; action="eaten "; break;
		}
	}
	return ('|raw|<div>' + '<b>' + winner + "\'s " + '</b>' + '<i>' + wchoice + '</i>' + ' has ' + '<b>' + action + loser + '\'s ' + '</b>' + '<i>' + lchoice + '</i>' + context + '</div>');
}

function getRPShope(choice) {
	var randbool = Math.round(Math.random()) === 1;
	switch(choice.toLowerCase()) {
			case "rock": return (randbool ? "scissors" : "lizard"); break;
			case "paper": return (randbool ? "rock" : "Spock"); break;
			case "scissors": return (randbool ? "paper" : "lizard"); break;
			case "lizard": return (randbool ? "paper" : "Spock"); break;
			default: return (randbool ? "scissors" : "rock"); break;
	}
}

