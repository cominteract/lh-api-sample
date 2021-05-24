'use strict';
/*
 Module dependencies
 */
var express = require('express'),
    morgan = require('morgan'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    uuid = require('node-uuid'),
    fs = require('fs'),
    app = express();
var data_path = path.resolve('./data');
var reservations_json_path = data_path + '/reservations.json';
var properties_json_path = data_path + '/properties.json';

var prefix_api = "/api/v1";





app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

//use from morgan to logging these request into console
app.use(morgan('combined'));

/**
 helper functions for get data from json files
 **/
var getReservationsFromJsonFile = function () {
    return jsonfile.readFileSync(reservations_json_path);
};
var getPropertiesFromJsonFile = function () {
    return jsonfile.readFileSync(properties_json_path);
};



//REST FULL API Routes




/**
 * create new stream
 */
app.post(prefix_api + '/reservation', function (req, res) {
    var property_id = req.body.property_id;
    var content = req.body.content;
    var last_update = req.body.last_update;
    var reservation_type = req.body.reservation_type;
    var date = req.body.date;
    var property_url = "https://pbs.twimg.com/profile_images/1379253361032142853/oROI8kAP_400x400.jpg"
    if (property_id && reservation_type) {
        //create new stream object
        var newReservation = {property_id : property_id, content : content, last_update : last_update, reservation_type : reservation_type,
            date : date, property_url : property_url};
        //get the streams list and add this new stream to that list
        var reservations = getReservationsFromJsonFile();
        if (reservations) {
            //add this stream to stream list
            reservations.push(newReservation);
            //write these stream to json file
            jsonfile.writeFile(reservations_json_path, reservations, function (err) {
                if (err) {
                    res.status(500).send({
                        type: 'INTERNAL_SERVER_ERROR',
                        description: 'Internal server error'
                    });
                }
                else {
                    res.json(newReservation);
                }
            });
        }
        else {
            //error happend in get list of streams from json file
            res.status(500).send({
                type: 'INTERNAL_SERVER_ERROR',
                description: 'Internal server error'
            });
        }
    }
    else {
        res.status(400).send({
            type: 'SOME_FIELDS_ARE_EMPTY',
            description: 'body field or channel field for create new stream was empty :|'
        });
    }
});


/*
 get the list of reservations
 */
app.get(prefix_api + '/reservations', function (req, res) {
    var reservations = getReservationsFromJsonFile();
    if (reservations) {
        //filter if have query string channel
        res.json(reservations.reverse());
    }
    else {
        res.status(500).send({
            type: 'INTERNAL_SERVER_ERROR',
            description: 'Internal server error'
        });
    }
});


var port = process.env.PORT || 8080;

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    host = host === '::' ? 'localhost' : host;
    console.log("sample REST API for Retrofit in android without Authentication is running at http://%s:%s", host, port);
});
