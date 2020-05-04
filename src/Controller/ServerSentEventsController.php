<?php


namespace App\Controller;

use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ServerSentEventsController extends AbstractController
{
    private $messageRepository;
    private $channelRepository;

    public function __construct(MessageRepository $messageRepository, ChannelRepository $channelRepository)
    {
        $this->messageRepository = $messageRepository;
        $this->channelRepository = $channelRepository;
    }

    /**
     * @Route("/sse", name="sse")
     */
    public function index()
    {
        $channels = $this->channelRepository->findAll();

        return $this->render('server-sent_events/index.html.twig', [
            'controller_name' => 'ServerSentEventsController',
            'channels' => $channels,
        ]);
    }

    /**
     * @Route("/sse/data", methods="GET")
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
}