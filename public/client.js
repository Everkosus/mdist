$(document).ready(function(){
    var sock = new RawConnection('localhost:8080');
    sock.send('test');
});