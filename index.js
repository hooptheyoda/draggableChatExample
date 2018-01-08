
// ----------------- DECLARE CONNECTION VARIABLES --------------
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var path = require('path');


// ----------------- DECLARE LISTENING PORT --------------
http.listen(port, function(){
  console.log('listening on *:' + port);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


// ----------------- DECLARE VARIABLES --------------
users = [];
var userp = [];
var roomcount = [];
var roomno = 1;
var roomu;
var count = 1;
var currUser;
var p = 0;


// ----------------- SOCKET IO ON CONNECTION --------------
io.on('connection', function(socket) {
   //Set username
   socket.on('setUsername', function(data) {
      if(users.indexOf(data) > -1) {
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      } else {
         users.push(data);
         socket.emit('userSet', {username: data});
      // Increase roomno 2 clients are present in a room.
      // Note: If want 3 clients in a room, >2 ...>n etc
      if(io.nsps['/'].adapter.rooms["room-"+roomno]
      && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1)
      roomno++;
      socket.join("room-"+roomno);
      // Give Users player Id's
      if (count === 1) {
        userp.push( {username: data, userId:socket.id, userRM:roomno, player: 1});
        count = 2;
      }
      else {
        userp.push( {username: data, userId:socket.id, userRM:roomno, player: 2});
        count = 1;
      }
      // Get username and room
      // let users know which room they are in
      io.sockets.in("room-"+roomno).emit('connectToRoom', data+ " you are in room no. "+roomno);
      }
  });
  // Send message between users in the room
   socket.on('msg', function(data) {
     currentRoom(data);
     io.sockets.in("room-"+roomu).emit('newmsg', data);
   });
  // Leave current room
   socket.on('leaveRoom', function(data) {
     currentRoom(data);
     io.sockets.in("room-"+roomu).emit('userLeft', data);
     socket.leave("room-"+roomu);
     updateUsers(data);
   });
   // Second User leave Current Room
   socket.on('usersLeaveRoom', function(data) {
     currentRoom(data);
     socket.leave("room-"+roomu);
     updateUsers(data);
   });
});


// ----------------- SERVER FUNCTIONS VARIABLES --------------
// Get Current User Information
function currentUser(data){
  p = data.user;
  // Update Room
  for (let i = 0; i < users.length; i++) {
    if (userp[i].username === p) {
      currUser = userp[i];
    }
  }

  return currUser;
}

// Get Current Room Number
function currentRoom(data){
  p = data.user;
  // Update Room
  for (let i = 0; i < users.length; i++) {
    if (userp[i].username === p) {
      roomu = userp[i].userRM;
    }
  }
  return roomu;
}

// Update all Users, Delete Person that left Room
function updateUsers(data){
  p = data.user;
  // Update Room
  for (let i = 0; i < users.length; i++) {
    if (userp[i].username === p) {
      userp.splice(i,1);
      users.splice(i,1);
    }
  }

  return userp, users;
}
