
// ----------------- DECLARE VARIABLES --------------
var indexPage = document.getElementById('indexPage');
var entername = document.getElementById('entername');
var start = document.getElementById('start');
var messagebox = document.getElementById('messagebox');

// ----------------- DECLARE VARIABLES --------------
var socket = io();
var user;

// ----------------- MAIN WINDOW ONLOAD FUNCTION --------------
// Ask User if Sure they want to refresh page
window.onbeforeunload = function(){
    return confirm("Are you sure you want to close the window?");
}

// ----------------- MAIN FUNCTIONS --------------
// Enter Chat Room
function enterRoom() {
  indexPage.classList.add('hidden');
  entername.classList.remove('hidden');
}
//Set Username
function setUsername() {
  socket.emit('setUsername', document.getElementById('name').value);
  document.getElementById('userNameText').innerHTML = document.getElementById('name').value;
};
//Send Message
function sendMessage() {
  var msg = document.getElementById('message').value;
  if(msg) {
    socket.emit('msg', {message: msg, user: user});
    }
}
// Leave Chat Room
function leaveRoom(){
  socket.emit('leaveRoom', {user: user});
  entername.classList.add('hidden');
  messagebox.classList.add('hidden');
  indexPage.classList.remove('hidden');
};

// ----------------- SOCKET IO ON CLIENT (USER OUTPUTS) --------------
// Check User Exists
socket.on('userExists', function(data) {
  document.getElementById('error-container').innerHTML = data;
});

// Get Username & Message container
socket.on('userSet', function(data) {
  user = data.username;
  entername.classList.add('hidden');
  messagebox.classList.remove('hidden');
});

// Get New Message
socket.on('userLeft', function(data) {
  if(user) {
    document.getElementById('message-container').innerHTML += '<div><b>' +
        data.user + '</b>: ' + 'has left this chat session.' + '</div>';
      setTimeout(function() {
        entername.classList.add('hidden');
        messagebox.classList.add('hidden');
        indexPage.classList.remove('hidden');
        document.getElementById('message-container').innerHTML = '';
        socket.emit('usersLeaveRoom', {user: user});
      }, 3000)
  }
});

// Get New Message
socket.on('newmsg', function(data) {
  if(user) {
    document.getElementById('message-container').innerHTML +=
      '<div id="messageOutput">'
      +'<figure>'
      + '<img src="http://www.gravatar.com/avatar/%7Bmd5email%7D?s=50&d=mm" alt="mm" />'
      + '</figure>'
      +'<div id= "messageOCH">'
      +'<header>'
      +'<h4>' + data.user +' <time>10:28pm</time>'+'</h4>'
      +'</header>'
      + '<p>' + data.message + '</p>'
      +'</div>'
      +'</div>'
 }
});

// Show data of Room Connection
socket.on('connectToRoom',function(data) {
   console.log(data);
});
