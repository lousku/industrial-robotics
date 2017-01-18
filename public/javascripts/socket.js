/**
 * Created by Miika on 3.12.2016.
 */

module.exports = function(socket){
    var request = require('request');

    //javascript file to execute knowledge base functionalities
    var KB = require('./KB_query');
    //javascript file to check if pallets are on workstation conveyor. returns array.
    var palletPosChecker = require('./palletPosChecker');

    var WS = 0; //used to set WS in use 0 when not setted

    //when frontend updates WS in use. check pallet positions of that WS and emits
    // position array to frontEnd to draw
    socket.on('updateWS', function(msg) {
       WS = msg;
       console.log('WS in use: ' +WS);

        palletPosChecker(WS, function (palletPositions) {
            console.log('posCheck finished');
            console.log(palletPositions.toString());
            socket.emit('frontendPositions',palletPositions);

        });
    });

    //when front end emits an socket event, msg  variable contains service name
    socket.on('event', function(msg) {

        // run KB query to get ip adres for WS in use and service path for wanted service
        KB(WS, msg, function ( ip, service) {

            var options;

            //for some reason kb does not return conveyorIP so we need to use robIP and create it manually
            var convip= ip.substr(0,ip.length-2)+ '.2';
            console.log('convIP= '+ convip);

            //When service is ment for robot RTU to execute, create needen options
            if(msg == 'ChangePenRED' || msg == 'ChangePenGREEN'|| msg == 'ChangePenBLUE'|| msg == 'Draw1'|| msg == 'Draw2'|| msg == 'Draw3'|| msg == 'Draw4'|| msg == 'Draw5'|| msg == 'Draw6'|| msg == 'Draw7'|| msg == 'Draw8'|| msg == 'Draw9'){
                 options = {
                    method: 'post',
                    body: {"destUrl": ip  },
                    json: true, // Use,If you are sending JSON data
                    url: "http://"+ip+service ,
                    headers: {'Content-Type': 'application/json'}
                };
            }
            //if service name is for conveyor RTU
            else{
                options = {
                    method: 'post',
                    body: {"destUrl": convip  },
                    json: true, // Use,If you are sending JSON data
                    url: "http://"+convip+service ,
                    headers: {'Content-Type': 'application/json'}
                };
            }

            console.log('KB returns: ' + ip.toString() +' ' + service.toString());

            //request to complete service on RTU
            request(options, function (err, res, body) {
                if (err) {
                    console.log('Error :', err);
                    return;
                }
            });

            //function checks pallet positions wait 3 sec before executing
            setTimeout(function(){

                //palletPosChecker runs 5 requests to conveyor RTU and returns an array length of five
                //including information if zone has pallet or not

                palletPosChecker(WS, function (palletPositions) {
                    console.log('posCheck finished');
                    console.log(palletPositions.toString());
                    socket.emit('frontendPositions',palletPositions);
                });
            },3000); //gives pallet 3s time to move before it get checked

            console.log('eventFinished');
        });

    });
}