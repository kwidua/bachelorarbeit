
const http = require("http");
const express = require('express')
const app = express()

var server = http
    .createServer((request, response) => {
        console.log("Requested url: " + request.url);
            if (request.url.toLowerCase() === "/") {
            console.log('refresh')
            response.writeHead(200, {
                Connection: "keep-alive",
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*",
            })
            response.end()

            // request.on('data', chunk => {
            //     console.log(`Data chunk available: ${chunk}`)
            //     console.log(JSON.parse(chunk))
            //     response.write('data:')
            //     response.writeContinue(chunk)
            //     response.writeContinue('\n\n')
            // });
            // response.write('data:' + request + '\n\n')
        }

            if (request.url.toLowerCase() === "/sse/test") {
                console.log("data")
                response.write('data:' + '\n\n')
                response.end()
            }
    })

    server.listen(5000, () => {
        console.log("Server running ");
    })

// app.post('/sse/test', function (req, res) {
//     console.log(req.body)
// })
// http.get('http://localhost:8000/sse/test', function (req, res) {
//     console.log(req)
// })