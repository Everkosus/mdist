$(document).ready(function(){
    var socket = io();
    socket.emit('m', 'test');
});