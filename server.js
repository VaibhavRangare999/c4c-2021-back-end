var express = require('express');
var bodyParser = require('body-parser');
var unirest = require("unirest");
var app = express();
var cors = require('cors')
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const Vonage = require('@vonage/server-sdk')
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    header: [
        { id: 'Longitude', title: 'Longitude' },
        { id: 'Latitude', title: 'Latitude' },
        { id: 'Availability', title: 'Availability' },
        { id: 'Quality', title: 'Quality' },
        { id: 'Type', title: 'Type' },
        { id: 'Description', title: 'Description' },
    ],
    path: './assets/records.csv',
    append: true
});

// Endpoint to add Water Resource information
app.post('/addrecord', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const data = [];
    data.push(req.body);
    csvWriter.writeRecords(data)
        .then(() => {
            console.log('The CSV file was written successfully');
            res.send({ result: 'record added successfully' });
        })
        .catch(e => console.log(e))
})

// Endpoint to get all the records
app.get('/records', function (req, res) {
    getRecords(res);
})

// Used by above post request
async function getRecords(resp) {
    let promise = new Promise((resolve, reject) => {
        let chunks = [];
        fs.createReadStream('./assets/records.csv')
            .pipe(csv())
            .on('data', (row) => {
                chunks.push(row)
            })
        setTimeout(
            () =>
                resolve(chunks),
            1000)
    });
    let result = await promise;
    resp.send(result);
}

// Endpoint to send message to mobile
app.get('/sendmsg', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    /*
    // for cloud
    const vonage = new Vonage({
        apiKey: "XXXXXX",
        apiSecret: "XXXXXX"
    })
    */

    // for VaibhavRangare
    const vonage = new Vonage({
        apiKey: "XXXXXX",
        apiSecret: "XXXXXXX"
    })
    const from = "Vonage APIs";
    const to = "91XXXXXXXXXX";
    const text = '11 July 2021, A test message';

    vonage.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if (responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
    })
    res.send("Hello world!");
});


// Endpoint to send message to mobile
app.post('/sendmsg', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    // for cloud
    const vonage = new Vonage({
        apiKey: "XXXXXX",
        apiSecret: "XXXXXX"
    })


    /*
    // for other
    const vonage = new Vonage({
        apiKey: "XXXXXX",
        apiSecret: "XXXXXX"
    })
    */

    const from = "Vonage APIs";
    const to = req.body.phone;
    const text = JSON.stringify(req.body.msg);

    vonage.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if (responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
                res.send({ 'result': 'Message Sent, Success!!!' });
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                res.send({ 'error': 'Message Not Sent, Failed' });
            }
        }
    })

});

// Endpoint to perform test
app.get('/hello', function (req, res) {
    res.send("Hello world !!!");
})

// Endpoint to get location address using latitude and longitude
app.post('/address', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    let x = req.body.lat + "," + req.body.len;
    var req = unirest("GET", "https://google-maps-geocoding.p.rapidapi.com/geocode/json");
    req.query({
        "latlng": x,
        "language": "en"
    });

    req.headers({
        "x-rapidapi-key": "XXXXXXXXXX",
        "x-rapidapi-host": "google-maps-geocoding.p.rapidapi.com",
        "useQueryString": true
    });

    req.end(function (response) {
        if (response.error) throw new Error(response.error);
        res.status(200).send(response)
    });
});

var port = process.env.PORT || 3000
app.listen(port, function () {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});