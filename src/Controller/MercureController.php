<?php

namespace App\Controller;

use App\Entity\Message;
use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
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
    public function index()
    {
        $messages = $this->messageRepository->findAll();

        $token = (new Builder())
            ->withClaim('mercure', ['subscribe' => ['http://example.com/user']])
            ->getToken(
                new Sha256(),
                new Key('!ChangeMe!')
            );

        $cookie = new Cookie('mercureAuthorization', $token, (new \DateTime())->add(new \DateInterval('PT24H')), '/.well-known/mercure', null, false, true, false, 'strict');

        $response = $this->render('mercure/index.html.twig', [
            'channel' => array_values($messages)[0]->getChannel()->getName(),
        ]);

        $response->headers->setCookie($cookie);

        return $response;
    }

    /**
     *  @Route("/mercure/publish", name="mercure_publish", methods="POST")
     */
    public function publish(Request $request)
    {
        $now = new \DateTime();
        $channel = $this->channelRepository->findOneBy(['name' => 'MercureChannel']);
        $message = new Message();
        $message->setUser($this->getUser()->getUsername());
        $message->setTimestamp($now);
        $message->setChannel($channel);
        $message->setMessage($request->request->get('message'));
        $this->messageRepository->save($message);


        $update = new Update(
            'http://example.com/files/1',
            json_encode(['message' => $message->getMessage(), 'timestamp' => $message->getTimestamp()->format('d-m-Y H:i:s'), 'username' => $this->getUser()->getUsername(), 'channel' => 'MercureChannel']),
            ['http://example.com/user']
        );

        $this->publisher->__invoke($update);

        return $this->redirectToRoute('mercure');
    }

    /**
     * @Route("/mercure/data", methods="GET")
     */
    public function getMessages()
    {
        $channel = $this->channelRepository->findOneBy(['name' => 'MercureChannel']);
        $messages = $this->messageRepository->findBy(['channel' => $channel]);

        $messageArray = [];
        foreach ($messages as $message) {
            $messageArray[] = ['message' => $message->getMessage(), 'timestamp' => $message->getTimestamp()->format('d-m-Y H:i:s'), 'username' => $message->getUser(), 'channel' => 'MercureChannel'];
        }

        return new Response(json_encode($messageArray));
    }
}
