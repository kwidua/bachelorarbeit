// var SSE = require('sse')
const http = require("http");


var server = http
    .createServer((request, response) => {
        console.log("Requested url: " + request.url);
        console.log(request.url.toLowerCase())
        if (request.url.toLowerCase() === "/") {
            console.log('yipp')
            response.writeHead(200, {
                Connection: "keep-alive",
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*"
        })}
    })

    server.listen(5000, () => {
        console.log("Server running ");
    })