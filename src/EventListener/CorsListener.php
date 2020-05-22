<?php

namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\ResponseEvent;

class CorsListener
{
    public function onKernelResponse(ResponseEvent $event)
    {
        $request = $event->getRequest();
        $response = $event->getResponse();

        // This is not a secure configuration, because it allows cross origin requests from any host in the Origin header
        $response->headers->set(
            'Access-Control-Allow-Origin',
            $request->headers->get('Origin', $request->getHttpHost())
        );
    }
}