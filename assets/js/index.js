const server = require('ws').Server
const s = new server({port: 5001})
const http = require('http').createServer()

s.on('connection', function (ws) {
    ws.on('message', function (message) {
        console.log('received:' + message)
//in http client:
        s.clients.forEach(function (client) {
            // if(client !== ws) {
                client.send(message)
            // }
        })
    })


    ws.on('close', function () {
        console.log('bye bye client')
    })
})
