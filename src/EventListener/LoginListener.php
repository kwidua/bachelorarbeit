<?php


namespace App\EventListener;

use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\Security\Core\Event\AuthenticationEvent;

class LoginListener
{
    public $cookies = [];

    public function onLogin(AuthenticationEvent $event)
    {
        $token = $event->getAuthenticationToken();
        $roles = $token->getRoleNames();

        $browserClientJwtToken = (new Builder())
            ->withClaim('mercure', ['subscribe' => $roles])
            ->getToken(
                new Sha256(),
                new Key('!ChangeMe!')
            );

        $browserClientJwtTokenSSE = (new Builder())
            ->withClaim('sse', ['subscribe' => $roles])
            ->getToken(
                new Sha256(),
                new Key('!ChangeMe!')
            );


        $this->cookies[] = new Cookie(
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

        $this->cookies[] = new Cookie(
            'sseAuthorization',
            $browserClientJwtTokenSSE,
            (new \DateTime())->add(new \DateInterval('PT24H')),
            '/subscribe',
            'localhost',
            false,
            true,
            false,
            'strict'
        );


    }

    public function onKernelResponse(ResponseEvent $event)
    {
        $response = $event->getResponse();

        foreach ($this->cookies as $cookie) {
            $response->headers->setCookie($cookie);
        }
    }
}