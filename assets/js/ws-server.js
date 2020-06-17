const WebSocketServer = require('ws').Server

const base = require('./server-base');
const url = require('url');
const http = require('http')
const jwt = require("jsonwebtoken");
const subscribers = []

var server = http.createServer(function(request, response) {
    const parsedUrl = url.parse(request.url,true);

    console.log(parsedUrl.pathname)
    if (parsedUrl.pathname === "/publish") {
        handlePublish(request, response);
    }
});
server.listen(4000, function() {
    console.log('http server listen')
});

const s = new WebSocketServer({server: server})

function authorize(request) {
    if ('authorization' in request.headers) {
        const token = request.headers['authorization'].replace('Bearer ', '')

        try {
            const claim = jwt.verify(token, '!ChangeMe!')

            console.log('\\o/', claim)
            return claim['ws']
        } catch (e) {
            console.log('oh noes', e)
        }
    }

    const cookies = base.parseCookies(request)

    if ('wsAuthorization' in cookies) {

        const token = cookies['wsAuthorization']

        try {
            const claim = jwt.verify(token, '!ChangeMe!')

            console.log('\\o/', claim)
            return claim['ws']
        } catch (e) {
            console.log('oh noes', e)
        }
    }
    return null
}

function handleSubscribe(request, client, query) {
    const claims = authorize(request);

    if (claims === null) {
        request.socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        request.socket.destroy()
        return
    }

    const topics = [].concat(query['topic']) || []

    if (topics.length === 0 || topics[0] === undefined) {
        request.socket.write('HTTP/1.1 400 Unauthorized\r\n\r\n')
        request.socket.destroy()
        return
    }

    const targets = claims['subscribe'] || []
    // response.writeHead(200, {
    //     Connection: "keep-alive",
    //     "Content-Type": "text/event-stream",
    //     "Cache-Control": "no-cache",
    //     "Access-Control-Allow-Origin": "http://localhost:8000",
    //     "Access-Control-Allow-Credentials" : true
    // })
    const subscriberId = Date.now();
    const newSubscriber = {
        id: subscriberId,
        targets: targets,
        topics: topics,
        send: (data) => {
            client.send('data:' + JSON.stringify(data) + '\n\n')
        }
    };
    subscribers.push(newSubscriber);
}

function handlePublish(request, response) {
    const claims = authorize(request);

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

        subscribers.forEach(subscriber => {
            // if (base.verifySubscriberMatchesAllTopics(update, subscriber) === true) {
            //     subscriber.response.write('data:' + JSON.stringify(update.data) + '\n\n')
            // }
        })
    })

    response.writeHead(200)
    response.write('{"ok":true}')
}


s.on('connection', function (ws, request, client) {
    const parsedUrl = url.parse(request.url,true);

    if (parsedUrl.pathname === "/subscribe") {
        handleSubscribe(request, client, parsedUrl.query);
    }


    ws.on('message', function (message) {
        console.log('received:' + message)

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


