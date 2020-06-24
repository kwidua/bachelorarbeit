<?php

namespace App\Controller;

use App\Entity\Channel;
use App\Entity\Message;
use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Mercure\Jwt\StaticJwtProvider;
use Symfony\Component\Mercure\Publisher;
use Symfony\Component\Mercure\PublisherInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Annotation\Route;

class MercureController extends AbstractController
{

    /**
     * @var PublisherInterface
     */
    private $publisher;
    private $messageRepository;
    private $channelRepository;

    public function __construct(PublisherInterface $publisher, MessageRepository $messageRepository, ChannelRepository $channelRepository)
    {
        $this->publisher = $publisher;
        $this->messageRepository = $messageRepository;
        $this->channelRepository = $channelRepository;
    }

    /**
     * @Route("/mercure", name="mercure")
     */
    public function index(Request $request)
    {
        $channel = $this->channelRepository->findOneBy(['name' => $request->query->get('channel')]);

        if ($channel === null) {
            throw new NotFoundHttpException();
        }

        $response = $this->render('mercure/index.html.twig', [
            'channel' => $channel->getName(),
        ]);

        return $response;
    }

    /**
     * @Route("/mercure/publish", name="mercure_publish", methods="POST")
     */
    public function publish(Request $request)
    {
        $now = new \DateTime();
        $channel = $this->channelRepository->findOneBy(['name' => $request->query->get('channel')]);

        if ($channel === null) {
            throw new NotFoundHttpException();
        }

        $this->assertIsAllowedToAccess($channel);

        $message = new Message();
        $message->setUser($this->getUser()->getUsername());
        $message->setTimestamp($now);
        $message->setChannel($channel);
        $message->setMessage($request->request->get('message'));
        $this->messageRepository->save($message);

        $serverJwtToken = (new Builder())
            ->withClaim('mercure', ['publish' => $channel->getRoles()])
            ->getToken(
                new Sha256(),
                new Key('!ChangeMe!')
            );

        $update = new Update(
            'channels/' . $channel->getName(),
            json_encode($message),
            $channel->getRoles()
        );

        $publisher = new Publisher("http://localhost:3000/.well-known/mercure", new StaticJwtProvider($serverJwtToken));
        $publisher($update);

        return new JsonResponse(['ok' => true]);
    }

    /**
     * @Route("/mercure/data", methods="GET")
     */
    public function getMessages(Request $request)
    {
        $channel = $this->channelRepository->findOneBy(['name' => $request->query->get('channel')]);

        if ($channel === null) {
            throw new NotFoundHttpException();
        }

        $this->assertIsAllowedToAccess($channel);

        $messages = $this->messageRepository->findBy(['channel' => $channel]);

        return new Response(json_encode($messages));
    }

    private function assertIsAllowedToAccess(Channel $channel): void
    {
        $isAllowedToPublish = false;

        foreach ($channel->getRoles() as $role) {
            if ($this->isGranted($role) === true) {
                $isAllowedToPublish = true;
            }
        }

        if ($isAllowedToPublish === false) {
            throw new AccessDeniedHttpException();
        }
    }
}
