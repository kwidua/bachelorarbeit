<?php


namespace App\EventListener;

use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Event\AuthenticationEvent;

class LoginListener
{
    public function onLogin(AuthenticationEvent $event)
    {
        $token = $event->getAuthenticationToken();
        $roles = $token->getRoleNames();

        if (!array_key_exists('ROLE_USER', $roles)) {
            return new Response('', 403);
        }

        $browserClientJwtToken = (new Builder())
            ->withClaim('mercure', ['subscribe' => ['http://example.com/user']])
            ->getToken(
                new Sha256(),
                new Key('!ChangeMe!')
            );

        $cookie = new Cookie(
            'mercureAuthorization',
            $browserClientJwtToken,
            (new \DateTime())->add(new \DateInterval('PT24H')),
            '/.well-known/mercure',
            'localhost',
            false,
            true,
            false,
            'strict'
        );

        $response = new Response();

        $response->headers->setCookie($cookie);

        return $response;
    }
}