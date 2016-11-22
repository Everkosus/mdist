function Socket(dest){
    var socket;
    if(dest === undefined){
        socket = io();
    }else if(typeof dest == 'string'){
        socket = io(dest);
    }else{
        socket = dest;
    }

    this.send = function(data){
        socket.emit('m', data);
    };

    var callbacks = [];
    this.get = function(callback){
        callbacks.push(callback);
    };

    socket.on('m', function(data){
       for(var i = 0; i < callbacks.length; i++){
           callbacks[i](data);
       }
    });
}

function RawConnection(dest){
    function RawPackage(data){
        this.data = data;
        this.time = Date.now();
    }

    var socket = new Socket(dest);

    this.send = function(data){
        var p = new RawPackage(data);
        socket.send(JSON.stringify(p));
    };

    var callbacks = [];
    this.get = function(callback){
        callbacks.push(callback);
    };

    socket.get(function(data){
        var p = JSON.parse(data);
        for(var i = 0; i < callbacks.length; i++){
            callbacks[i](p.data);
        }
    });
}

