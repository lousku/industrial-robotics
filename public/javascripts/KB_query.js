/**
 * Created by Miika on 8.12.2016.
 */

module.exports = function (WS, serviceName, callback){
    var request = require('request');

    if(typeof callback === 'function') {


        //Options for the KB request use WS and servicename to fill request body
        var options = {
            method: 'post',
            body: 'query=PREFIX ios:<http://www.ontologies.com/Ontology6117.owl#>' +
            'SELECT ?serviceName ?WS ?robip ?convip' +
            'WHERE{ ?ws ios:id ?WS. ' +
            '?ws ios:iprobot ?robip. ' +
            '?ws ios:ipconveyor ?convip.' +
            '?service ios:name ?serviceName. ' +
            'FILTER(?WS = "WS' + WS.toString() + '"). ' +
            'FILTER(?serviceName = "/rest/services/' + serviceName.toString() + '")}',
            json: true, // Use,If you are sending JSON data
            url: "http://127.0.0.1:3032/iii2016/query",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/sparql-results+json,*/*;q=0.9'
            }
        };

        //kb request, starts callback funtion when ready
        request(options, function (err, res, body) {
            if (err) {
                console.log('Error :', err);
                return;
            }

            var obj = body.results.bindings;

            //start callbackfunction. send ip and servicename
            callback(obj[0].robip.value, obj[0].serviceName.value);

        });
    }
}