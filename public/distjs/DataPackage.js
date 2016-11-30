/**
 * Created by Tim Großkopf on 28.11.2016.
 */
function DataPackage(type, time, data) {
    this.type = type;
    this.time = time;
    this.data = data;
}

function _package(o, type) {
    o.isPackage = true;
    o.type = type;

    o.getPackageData = function () {
        return {
            data: this.data
        }
    };

    o.getPackage = function () {
        return new DataPackage(this.type, this.time, this.getPackageData());
    };

    o.getData = function () {
        return this.data;
    }
}

function RawPackage(userId, time, data) {
    _package(this, 'raw');
    data = typeof data == 'string' ? data : JSON.stringify(data);
    this.userId = userId;
    this.time = time;
    this.data = data;

    this.getPackageData = function () {
        return {
            userId: this.userId,
            data: this.data
        }
    }
}
RawPackage.FromDataPackage = function (dataPackage) {
    dataPackage = typeof dataPackage === 'string' ? JSON.parse(dataPackage) : dataPackage;
    return new RawPackage(dataPackage.data.userId, dataPackage.time, dataPackage.data.data);
};
RawPackage.FromPackage = function (userId, p) {
    return new RawPackage(userId, Date.now(), p.getPackageData());
};

function CryptPackage(time, data, isCrypted) {
    _package(this, "crypt");
    data = typeof data === 'string' ? data : JSON.stringify(data);
    this.isCrypted = isCrypted || false;
    this.time = time;
    if (this.isCrypted) {
        this.rawData = null;
        this.cryptData = data;
    } else {
        this.rawData = data;
        this.cryptData = null;
    }

    this.getData = function () {
        if (this.rawData === null) throw "Error";
        return this.rawData;
    };

    this.getPackageData = function () {
        if (this.cryptData === null) throw "Error";
        return this.cryptData
    };

    this.encrypt = function (pgp_public, callback) {
        var that = this;
        pgp_public.encrypt(this.rawData, function (result) {
            that.isCrypted = true;
            that.cryptData = result;
            callback(that);
        });
    };

    this.decrypt = function (pgp_privat, callback) {
        var that = this;
        pgp_privat.decrypt(this.cryptData, function (result) {
            that.rawData = result;
            callback(that);
        });
    };
}

CryptPackage.FromDataPackage = function (p) {
    p = typeof p === 'string' ? JSON.parse(p) : p;
    return new CryptPackage(p.time, p.data, true);
};
CryptPackage.FromPackage = function (p) {
    return new CryptPackage(Date.now(), p.getPackageData());
};

function CommandPackage(user, command, readyCallback) {

    if(typeof command === 'string') command = JSON.parse(command);

    this.isReady = false;
    var readyCallback = readyCallback;
    this.onReady = function (callback) {
        if (this.isReady) return callback(this);
        readyCallback = callback;
    };
    this.fireReady = function () {
        this.isReady = true;
        if (readyCallback) readyCallback(this);
    };

    var rawPackage = null;

    this.encrypt = function(onReadyCallback){
        if(onReadyCallback) readyCallback = onReadyCallback;
        var that = this;
        var cryptPackage = new CryptPackage(Date.now(), command.getData());
        cryptPackage.encrypt(user.pgp.pub, function (p) {
            rawPackage = RawPackage.FromPackage(user.getId(), p);
            that.fireReady();
        });
    };

    this.getCommand = function(){
        return command;
    };
    this.getPackage = function(){
        return rawPackage;
    }

}
CommandPackage.FromRawPackage = function(user, p, onReadyCallback){
    if(typeof p === 'string') p = JSON.parse(p);
    if(!p.isPackage) p = RawPackage.FromDataPackage(p);

    var cp = CryptPackage.FromDataPackage(p);
    cp.decrypt(user.pgp.priv, function(p){
        onReadyCallback(new CommandPackage(user, Command.FromData(p.getData())));
    });
};














