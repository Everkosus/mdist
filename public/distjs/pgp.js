function PGP_Public(str){
    this.encrypt = function(data, callback){
        openpgp.encrypt({
            data: data,
            publicKeys: openpgp.key.readArmored(str).keys
        }).then(function(cipherText){
            callback(cipherText.data);
        });
    }

    this.export = function(){
        return str;
    }
}

function PGP_Private(str, pass){
    var key = openpgp.key.readArmored(str).keys[0];
    key.decrypt(pass);

    this.decrypt = function(data, callback){
        openpgp.decrypt({
            message: openpgp.message.readArmored(data),
            privateKey: key
        }).then(function(clearText){
            callback(clearText.data);
        });
    };

    this.export = function(){
        return str;
    }
}

function PGP_Pair(pub, priv){
    this.pub = pub || null;
    this.priv = priv || null;

    this.readOnly = priv === null;

    this.decrypt = function(data, callback){
        if(this.readOnly) throw "Error";
        this.priv.decrypt(data, callback);
    };

    this.encrypt = function(data, callback){
        this.pub.encrypt(data, callback);
    };

    this.export = function(){
        return {
            pub: pub ? pub.export() : null,
            priv: priv ? priv.export() : null
        }
    }
}