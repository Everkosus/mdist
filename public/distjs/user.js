function User(conf){
    this.pgp = conf.pgp;
    this.canRead = function(){
        return conf && conf.pgp && !conf.pgp.readOnly;
    };
    this.canWrite = function(){
        return conf && conf.pgp;
    };
    this.decrypt = function(data, callback){
        if(!this.canRead()) throw "Error";
        conf.pgp.decrypt(data, callback);
    };
    this.encrypt = function(data, callback){
        conf.pgp.encrypt(data, callback);
    };
    this.getId = function(){
        return conf ? (conf.id ? conf.id : null) : null;
    };
    this.getToken = function(){
        return conf ? (conf.token ? conf.token : null) : null;
    };

    this.export = function(callback){
        var confRaw = JSON.stringify(conf);
        if(this.canRead()){
            this.encrypt(confRaw, function(confCrypted){
                callback(JSON.stringify({
                   encrypted: true,
                    conf: confCrypted,
                    pgp: conf.pgp.export()
                }));
            })
        }else{
            callback(JSON.stringify({
                encrypted: false,
                conf: confRaw,
                pgp: conf.pgp.export()
            }));
        }
    }
}
User.import = function(raw, callback){
    raw = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if(raw.encrypted){

    }else{
        callback(new User({

        }))
    }
};

function Command(name, args){
    this.name = name;
    this.args = args;
    this.getData = function(){
        return JSON.stringify({
            name: this.name,
            args: this.args
        });
    }
}

Command.FromData = function(data){
    if(typeof data === 'string') data = JSON.parse(data);
    return new Command(data.name, data.args);
};