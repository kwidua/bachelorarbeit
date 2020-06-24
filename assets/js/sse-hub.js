const http = require("http");
const jwt = require("jsonwebtoken");
const url = require('url');
const base = require('./server-base');
const subscribers = []

function handleSubscribe(request, response, query) {
    const claims = base.authorize(request, 'sse', 'sseAuthorization');

    if (claims === null) {
        response.writeHead(401)
        response.write('\n\n')
        return
    }
    const topics = [].concat(query['topic']) || []
    console.log(topics)
    if (topics.length === 0) {
        response.writeHead(400)
        response.write('\n\n')
        return
    }

    const targets = claims['subscribe'] || []

    response.writeHead(200, {
        Connection: "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "http://localhost:8000",
        "Access-Control-Allow-Credentials" : true
    })
    const subscriberId = Date.now();
    const newSubscriber = {
        id: subscriberId,
        targets: targets,
        topics: topics,
        send: (data) => {
            this.response.write('data:' + JSON.stringify(data) + '\n\n')
        },
        response
    };
    subscribers.push(newSubscriber);
    response.write('\n\n')
}

setInterval(function () {
    console.log('hearbeat for ' + subscribers.length + ' subscribers')
    subscribers.forEach(subscriber => subscriber.response.write(':\n\n'))
}, 10000)

function handlePublish(request, response) {
    const claims = base.authorize(request, 'sse', 'sseAuthorization');

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
            if (base.verifySubscriberMatchesAllTopics(update, subscriber) === true) {
                subscriber.response.write('data:' + JSON.stringify(update.data) + '\n\n')
            }
        })
    })

    response.writeHead(200)
    response.write('{"ok":true}')
}

var server = http
    .createServer((request, response) => {
        const parsedUrl = url.parse(request.url,true);

        if (parsedUrl.pathname === "/subscribe") {
            handleSubscribe(request, response, parsedUrl.query);
        }

        if (parsedUrl.pathname === "/publish") {
            handlePublish(request, response);
        }
    })

server.listen(5000, () => {
    console.log("Server running ");
})