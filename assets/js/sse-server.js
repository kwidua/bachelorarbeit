const http = require("http");
const clients = []

var server = http
    .createServer((request, response) => {
        console.log("Requested url: " + request.url);
        if (request.url.toLowerCase() === "/subscribe") {
            console.log('refresh')
            response.writeHead(200, {
                Connection: "keep-alive",
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*",
            })
            const clientId = Date.now();
            const newClient = {
                id: clientId,
                response
            };
            clients.push(newClient);
            response.write('\n\n')
        }

        if (request.url.toLowerCase() === "/publish") {
            console.log(request)

            let message = ''

            request.on('data', (chunk) => message += chunk)
            request.on('end', () => {
                console.log(message)
                clients.forEach(c => c.response.write('data:' + message + '\n\n'))
            })
        }
    })

server.listen(5000, () => {
    console.log("Server running ");
})