const jwt = require("jsonwebtoken");

parseCookies = (request) => {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

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

function authorize(request, claimKey, cookieName) {
    if ('authorization' in request.headers) {
        const token = request.headers['authorization'].replace('Bearer ', '')

        try {
            const claim = jwt.verify(token, '!ChangeMe!')

            console.log('\\o/', claim)
            return claim[claimKey]
        } catch (e) {
            console.log('error', e)
        }
    }

    const cookies = parseCookies(request)

    if (cookieName in cookies) {

        const token = cookies[cookieName]

        try {
            const claim = jwt.verify(token, '!ChangeMe!')

            console.log('\\o/', claim)
            return claim[claimKey]
        } catch (e) {
            console.log('error', e)
        }
    }
    return null
}

exports.verifyPublisherHasClaimToAllTargets = verifyPublisherHasClaimToAllTargets;
exports.verifySubscriberMatchesAllTopics = verifySubscriberMatchesAllTopics;
exports.authorize = authorize;