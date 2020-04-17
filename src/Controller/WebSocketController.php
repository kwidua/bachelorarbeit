<?php


namespace App\Controller;


use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
}