const http = require("http");
const jwt = require("jsonwebtoken");
const url = require('url');
const subscribers = []

parseCookies = (request) => {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}


function authorize(request) {
    if ('authorization' in request.headers) {
        const token = request.headers['authorization'].replace('Bearer ', '')

        try {
            const claim = jwt.verify(token, '!ChangeMe!')

            console.log('\\o/', claim)
            return claim['sse']
        } catch (e) {
            console.log('oh noes', e)
        }
    }

    const cookies = parseCookies(request)

    if ('sseAuthorization' in cookies) {

        const token = cookies['sseAuthorization']

        try {
            const claim = jwt.verify(token, '!ChangeMe!')

            console.log('\\o/', claim)
            return claim['sse']
        } catch (e) {
            console.log('oh noes', e)
        }
    }
    return null
}

function handleSubscribe(request, response, query) {
    const claims = authorize(request);

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

function verifyPublisherHasClaimToAllTargets(update, targets) {
    let publisherHasClaimToAllTargets = true

    update.targets.forEach(updateTarget => {
        if (targets.indexOf(updateTarget) < 0) {
            publisherHasClaimToAllTargets = false
        }
    })
    return publisherHasClaimToAllTargets;
}

function verifySubscriberMatchesAllTopics(update, subscriber) {
    let subscriberMatchesAllTopics = true
    update.topics.forEach(updateTopic => {
        if (subscriber.topics.indexOf(updateTopic) < 0) {
            subscriberMatchesAllTopics = false
        }
    })
    return subscriberMatchesAllTopics;
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

        if (verifyPublisherHasClaimToAllTargets(update, targets) === false) {
            response.writeHead(401)
            response.write('\n\n')
            return
        }

        subscribers.forEach(subscriber => {
            if (verifySubscriberMatchesAllTopics(update, subscriber) === true) {
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