/**
 * Created by Miika on 12.12.2016.
 */

module.exports = function(WS, callback) {
    var request = require('request');

    if (typeof callback === 'function') {


        //Backend palletposition array
        var palletPositions = [-1,-1,-1,-1,-1];

        //check Z1-Z5 positions

        for (var i = 1; i < 6; i++) {
            options = {
                method: 'post',
                body: {},
                json: true, // Use,If you are sending JSON data
                url: 'http://192.168.'+WS.toString()+'.2'+'/rest/services/Z'+i.toString(),
                headers: {'Content-Type': 'application/json'},
                pos:i
            };

            //sen request to RTU
            request(options, function (err, res, body) {
                if (err) {
                    console.log('Error :', err);
                    return;
                }
                //check zonenumber from request (because requests are async functions, they may return at any time)
                var zoneStr = JSON.stringify(res.request.uri.pathname).substr(JSON.stringify(res.request.uri.pathname).length-2,1);
                var zoneNum = Number(zoneStr);

                console.log('check zone ' +zoneNum);

                //when zone is empty, response body length is 17. if response body includes id it is longer
                if (JSON.stringify(body).length < 18) {
                    palletPositions[zoneNum-1] = 0;
                }
                else {
                    palletPositions[zoneNum-1] = 1;
                }

                //Check if all positions are filled wit 0 or 1
                var allChecked = true;
                palletPositions.forEach(function(zone){
                   if (zone == -1) {
                       allChecked = false;
                   }
                });
                //run callback function when alle positions are checked
                if(allChecked){
                    callback(palletPositions);
                }

            });
        }
    }
}

