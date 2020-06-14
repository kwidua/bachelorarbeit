const http = require("http");
const jwt = require("jsonwebtoken");
const clients = []

parseCookies = (request) => {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

var server = http
    .createServer((request, response) => {
        if (request.url.toLowerCase() === "/subscribe") {
            const cookies = parseCookies(request)

            if ('sseAuthorization' in cookies) {
                const token = cookies['sseAuthorization']

                try {
                    const decoded = jwt.verify(token, '!ChangeMe!')

                    console.log('\\o/', decoded)
                } catch (e) {
                    console.log('oh noes', e)
                }
            }

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