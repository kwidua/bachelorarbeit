<?php


namespace App\Controller;


use App\Entity\Message;
use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mercure\PublisherInterface;
use Symfony\Component\Routing\Annotation\Route;

class WebSocketController extends AbstractController
{
    private $messageRepository;
    private $channelRepository;

    public function __construct(PublisherInterface $publisher, MessageRepository $messageRepository, ChannelRepository $channelRepository)
    {
        $this->publisher = $publisher;
        $this->messageRepository = $messageRepository;
        $this->channelRepository = $channelRepository;
    }

    /**
     * @Route("/websocket", name="websocket")
     */
    public function index()
    {
        $channels = $this->channelRepository->findAll();

        return $this->render('websocket/index.html.twig', [
            'controller_name' => 'ServerSideController',
            'channels' => $channels,
        ]);
    }

    /**
     * @Route("/websocket/data", methods="GET")
     */
    public function getMessages(Request $request)
    {
        $channel = $this->channelRepository->findOneBy(['name' => $request->query->get('channel')]);
        $messages = $this->messageRepository->findBy(['channel' => $channel]);

        $messageArray = [];
        foreach ($messages as $message) {
            $messageArray[] = ['message' => $message->getMessage(), 'timestamp' => $message->getTimestamp()->format('d-m-Y H:i:s'), 'username' => $message->getUser(), 'channel' => 'TestChannel'];
        }

        return new Response(json_encode($messageArray));
    }

    /**
     * @Route("/websocket/save", methods="POST")
     */
    public function saveMessage(Request $request)
    {
        $now = new \DateTime();
        $channel = $this->channelRepository->findOneBy(['name' => $request->query->get('channel')]);
        $message = new Message();
        $message->setUser($this->getUser()->getUsername());
        $message->setTimestamp($now);
        $message->setChannel($channel);
        $message->setMessage($request->request->get('message'));
        $this->messageRepository->save($message);

        $serverJwtToken = (new Builder())
            ->withClaim('ws', ['publish' => $channel->getRoles()])
            ->getToken(
                new Sha256(),
                new Key('!ChangeMe!')
            );

        $body = json_encode([
            'data' => [
                'message' => $message->getMessage(),
                'timestamp' => $message->getTimestamp()->format('d-m-Y H:i:s'),
                'username' => $message->getUser(),
                'channel' => $channel->getName()
            ],
            'topics' => ['channels/' . $channel->getName()],
            'targets' => $channel->getRoles()
            ]);

        $client = HttpClient::create();
        $response = $client->request(
            'POST',
            'http://localhost:4001/publish',
            [
                'auth_bearer' => (string) $serverJwtToken,
                'body' => $body
            ]
        );

        return new JsonResponse([]);
    }
}