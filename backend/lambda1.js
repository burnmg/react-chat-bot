var AWS = require('aws-sdk');
var https = require('https');
var lex = new AWS.LexRuntime();

function process_data_to_yelp(data, callback, params) {
    console.log("inside yelp");
    console.log(data);
    var sub = JSON.parse(data['sessionAttributes']["slots"]);
    console.log(sub);
    var location = sub["Location"];
    var cuisine = sub["Cuisine"];
    var date = sub["Date_Time"]
    var tm = sub["Dining_Time"]
    var unixdate = date + "T" + tm + ":00"
    var unixtime = parseInt((new Date(unixdate).getTime() / 1000).toFixed(0)); 
    //open_at: ${unixtime},
    console.log(location);
    console.log(cuisine);
    var query = `
    {
        search(term: "restaurants",
            location: "${location}",
            limit: 5,
            open_at: ${unixtime},
            categories: "${cuisine}") {
                total
                business {
                    name
                    rating
                    review_count
                    location {
                        address1
                        city
                        state
                        country
                    }
                    hours {
                        open {
                            start
                            end
                        }
                    }
                }
            }
    }`;
    var token = 'ldc3UP7J7OY_x9ubBob9_tzk4zxSg8tA9Wu9KGdg3s7vVsfAoIehT2_ezFgB2GQ09hOUXPexZ9uas_v31VOexd-osVOitR0Ib6PPRQMW1jvKR0PxY-Z5XKosgSN6XHYx';
    var post_options = {
        "method": "POST",
        "hostname": "api.yelp.com",
        "path": "/v3/graphql",
        "headers": {
            "Content-Type": "application/graphql",
            "Authorization": "Bearer " + token
        }
    }
    var cb = function(res) {
        res.setEncoding('utf8');
        var data_back = '';
        res.on('data', function (chunk) {
            //console.log('Response: ' + chunk);
            data_back += chunk;
        });
        res.on('error', function (e) {
            console.log("Got error: " + e.message);
        });
        res.on('end', function () {
            console.log('end');
            //console.log(data_back);
            callback(null, {
                statusCode: 200,
                body: {
                    "messages": [
                        {
                            "type": "string",
                            "unstructured": {
                                "id": params["userId"],
                                "recommendations": data_back,
                                "text": data["message"],
                                "timestamp": "now",
                                "params": JSON.stringify(data),
                            }
                        }
                    ]
                },
            })
        });
    }
    var post_req = https.request(post_options, cb);

    // post the data
    post_req.write(query);
    post_req.end();
}

function handleReq(params, callback) {
    lex.postText(params, function(err, data) {
        if (err) {
            callback(err, {
                statusCode: 400,
                body: {"text": "error"},
            });
        }
        else {
            if (data['message'] === "Would you share some comment about app with us? (reply (i'd like to) to give suggestions!)") {
                console.log("generate recommendations");
                console.log(data);
                process_data_to_yelp(data, callback, params);
            }
            else  {
                console.log(data);
                callback(null, {
                    statusCode: 200,
                    body: {
                        "messages": [
                            {
                                "type": "string",
                                "unstructured" : {
                                    "id": params["userId"],
                                    "text": data["message"],
                                    "timestamp": "now",
                                    "params": JSON.stringify(data),
                                }
                            }   
                        ]
                    }
                });
            }
            //fullfilled. send the data to yelp
            
        }
    });
}

//main handler
exports.handler = function(event, context, callback)  {
    // TODO implement
    
    var decom = event["messages"][0]["unstructured"];
    var msg = decom["text"];
    var uid = decom["id"];
    var params = {
        botAlias: '$LATEST',
        botName: 'RestaurantBot',
        inputText: msg,
        userId: uid,
        sessionAttributes: {},
    };
    console.log("game start");
    handleReq(params, callback);
};
