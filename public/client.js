var pgpPub, pgpPriv;

$(document).ready(function(){
    openpgp.initWorker({ path:'distjs/openpgp.worker.min.js' });

    openpgp.config.aead_protect = true;

    var arrPromises = [
        $.get('pub.asc', function(data){
            pgpPub = new PGP_Public(data);
        }),
        $.get('sec.asc', function(data){
            pgpPriv = new PGP_Private(data, '12345');
        })
    ];

    $.when.apply($, arrPromises).then(function() {

        var user = new User({
            id: "master_test",
            token: 'token_1234',
            pgp: new PGP_Pair(pgpPub, pgpPriv)
        });

        user.export(function(data){
            console.log(data);
        });

        var cmd = new Command("test", {
            x: 1
        });

        new CommandPackage(user, cmd).encrypt(function(cmdP){
            var p = cmdP.getPackage().getPackage();
            var raw = JSON.stringify(p);
            CommandPackage.FromRawPackage(user, raw, function(cmdP){
               var cmd = cmdP.getCommand();
                console.log(cmd);
            });
        })

    });
});