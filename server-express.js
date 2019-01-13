"use strict";

(function () {

    var bodyParser = require('body-parser'),
        FastText = require('../lib/index'),
        Util = require('../lib/util');

    const port = process.env.PORT || 3000;

    const fastText = new FastText({
        loadModel: process.env.MODEL || __dirname+'/data/sms_model.bin'
    });

    /**
     * simple request handler
     */
    const requestHandler = (request, response) => {

        var req_start = new Date().getTime();

        if( Util.empty( request.body.text ) ) {
            response.writeHead(400, { 'Content-Type': 'text/plain' });
            return response.end('missing parameters');
        }
        fastText.predict(request.body.text)
            .then(labels => {
                var req_end= (new Date().getTime()-req_start)/1000;
                var res={
                    response_time: req_end,
                    predict: labels
                }
                response.setHeader('Content-Type', 'application/json');
                response.end( JSON.stringify(res, null, 2) );
            })
            .catch(error => {
                console.error("predict error", error);
            });

    }//requestHandler

    const express = require('express');
    const app = express();

    app.use(bodyParser.json())
    app.post('/', requestHandler);

    // defer http server listen to module loading
    fastText.load()
        .then(done => {
            console.log("model loaded");
            app.listen(port, function () {
                console.log(`server is listening on ${port}`)
            });
        })
        .catch(error => {
            console.error("load error", error);
        });
}).call(this);
