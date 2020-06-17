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

exports.parseCookies = parseCookies;
exports.verifyPublisherHasClaimToAllTargets = verifyPublisherHasClaimToAllTargets;
exports.verifySubscriberMatchesAllTopics = verifySubscriberMatchesAllTopics;