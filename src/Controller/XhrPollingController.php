<?php

namespace App\Controller;

use App\Entity\Channel;
use App\Entity\Message;
use App\Form\ChannelFormType;
use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

class XhrPollingController extends AbstractController
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
     * @Route("/xhr", name="xhr")
     */
    public function chat()
    {
        $channels = $this->channelRepository->findAll();

        return $this->render('server_side/chat.html.twig', [
                'controller_name' => 'ServerSideController',
                'channels' => $channels,
            ]
        );
    }

    /**
     * @Route("/xhr/data", methods="GET")
     */
    public function getMessages(Request $request)
    {
        $channel = $this->channelRepository->findOneBy(['name' => $request->query->get('channel')]);

        if ($channel === null) {
            throw new NotFoundHttpException();
        }

        $messages = $this->messageRepository->findBy(['channel' => $channel]);

        $messageArray = [];
        foreach ($messages as $message) {
            $messageArray[] = ['message' => $message->getMessage(), 'timestamp' => $message->getTimestamp()->format('d-m-Y H:i:s'), 'username' => $message->getUser(), 'channel' => $channel->getName()];
        }

        return new Response(json_encode($messageArray));
    }

    /**
     * @Route("/xhr/save", methods="POST")
     */
    public function saveMessage(Request $request)
    {
        $now = new \DateTime();
        $channel = $this->channelRepository->findOneBy(['name' => $request->query->get('channel')]);

        if ($channel === null) {
            throw new NotFoundHttpException();
        }

        $message = new Message();
        $message->setUser($this->getUser()->getUsername());
        $message->setTimestamp($now);
        $message->setChannel($channel);
        $message->setMessage($request->request->get('message'));
        $this->messageRepository->save($message);

        return $this->redirectToRoute('xhr');
    }
}
