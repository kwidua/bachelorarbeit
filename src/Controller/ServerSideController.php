<?php

namespace App\Controller;

use App\Entity\Channel;
use App\Entity\Message;
use App\Form\ChannelFormType;
use App\Form\MessageFormType;
use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ServerSideController extends AbstractController
{
    /**
     * @var MessageRepository
     */
    private $messageRepository;

    /**
     * @var ChannelRepository
     */
    private $channelRepository;

    public function __construct(MessageRepository $messageRepository, ChannelRepository $channelRepository)
    {
        $this->messageRepository = $messageRepository;
        $this->channelRepository = $channelRepository;
    }

    /**
     * @Route("/", name="home")
     */
    public function index()
    {
        $messages = $this->messageRepository->findAll();
        $channels = $this->channelRepository->findAll();


        return $this->render('server_side/index.html.twig', [
            'controller_name' => 'ServerSideController',
            'channels' => $channels,
        ]);
    }

    /**
     * @Route("/new", name="new")
     */
    public function newChannel(Request $request)
    {
        $channel = new Channel();
        $form = $this->createForm(ChannelFormType::class, $channel);

        $form->handleRequest($request);
        if ($form->isSubmitted()) {
            $name = $form['name']->getData();
            $channel->setName($name);
            $this->channelRepository->save($channel);
        }

        return $this->render('server_side/newChannel.html.twig', [
            'channel_form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/channel/{channelName}", name="chat")
     */
    public function chat(string $channelName, Request $request)
    {
        $message = new Message();
        $channel = $this->channelRepository->findOneBy(['name' => $channelName]);
        $form = $this->createForm(MessageFormType::class, $message);

        $form->handleRequest($request);
        if ($form->isSubmitted()) {
            $message->setChannel($channel);
            $message->setTimestamp(date("F j, Y, g:i a"));
            $message->setMessage($form['message']->getData());
            $message->setUser($this->getUser());
            $this->messageRepository->save($message);
        }

        $messages = $this->messageRepository->findBy(['channel' => $channel]);

        return $this->render('server_side/chat.html.twig', [
            'message_form' => $form->createView(),
            'channel' => $channelName,
            'messages' => $messages,
            'user' => $this->getUser(),
        ]);
    }
}
