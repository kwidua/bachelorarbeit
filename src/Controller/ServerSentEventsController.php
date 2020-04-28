<?php


namespace App\Controller;

use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
}