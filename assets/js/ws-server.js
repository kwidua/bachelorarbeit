const server = require('ws').Server
const wsServer = new server({port: 4000})
const http = require('http')
const url = require('url');
const base = require('./server-base');

wsServer.on('connection', function (ws, request) {
    const claims = base.authorize(request, 'ws', 'wsAuthorization')

    const query = url.parse(request.url,true).query;

    if (claims === null) {
        response.writeHead(401)
        response.write('\n\n')
        return
    }

    const topics = [].concat(query['topic']) || []

    if (topics.length === 0) {
        response.writeHead(400)
        response.write('\n\n')
        return
    }

    const targets = claims['subscribe'] || []

    const subscriberId = Date.now();

    ws.subscriber = {
        id: subscriberId,
        targets: targets,
        topics: topics
    };

    ws.on('close', function () {
        console.log('bye bye client')
    })
})

var httpServer = http
    .createServer((request, response) => {
        const parsedUrl = url.parse(request.url,true);

        if (parsedUrl.pathname === "/publish") {
            handlePublish(request, response);
        }
    })

httpServer.listen(4001, () => {
    console.log("Server running ");
})

function handlePublish(request, response) {
    const claims = base.authorize(request, 'ws', 'wsAuthorization');

    if (claims === null) {
        response.writeHead(401)
        response.write('\n\n')
        return
    }

    const targets = claims['publish'] || []

    let message = ''

    request.on('data', (chunk) => message += chunk)
    request.on('end', () => {
        const update = JSON.parse(message)

        if (update.topics.length === 0) {
            response.writeHead(400)
            response.write('\n\n')
            return
        }

        if (base.verifyPublisherHasClaimToAllTargets(update, targets) === false) {
            response.writeHead(401)
            response.write('\n\n')
            return
        }

        wsServer.clients.forEach(ws => {

            if (base.verifySubscriberMatchesAllTopics(update, ws.subscriber) === true) {
                ws.send(JSON.stringify(update.data))
            }
        })
    })

    response.writeHead(200)
    response.write('{"ok":true}')
}