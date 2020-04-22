<?php


namespace App\Controller;


use App\Entity\Message;
use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
    public function getMessages()
    {
        $channel = $this->channelRepository->findOneBy(['name' => 'WebsocketChannel']);
        $messages = $this->messageRepository->findBy(['channel' => $channel]);

        $messageArray = [];
        foreach ($messages as $message) {
            $messageArray[] = ['message' => $message->getMessage(), 'timestamp' => $message->getTimestamp()->format('d-m-Y H:i:s'), 'username' => $message->getUser(), 'channel' => 'MercureChannel'];
        }

        return new Response(json_encode($messageArray));
    }

    /**
     * @Route("/websocket/save", methods="POST")
     */
    public function saveMessage(Request $request)
    {
        $now = new \DateTime();
        $channel = $this->channelRepository->findOneBy(['name' => 'WebsocketChannel']);
        $message = new Message();
        $message->setUser($this->getUser()->getUsername());
        $message->setTimestamp($now);
        $message->setChannel($channel);
        $message->setMessage($request->request->get('message'));
        $this->messageRepository->save($message);

        return $this->redirectToRoute('websocket');

    }
}