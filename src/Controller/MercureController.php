<?php

namespace App\Controller;

use App\Entity\Message;
use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
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

        return $this->render('mercure/index.html.twig', [
            'controller_name' => 'MercureController',
            'files' => $messages,
            'user' => $this->getUser()
        ]);
    }

    /**
     *  @Route("/mercure/publish", name="mercure_publish", methods="POST")
     */
    public function publish(Request $request)
    {
        $channel = $this->channelRepository->findOneBy(['name' => 'MercureChannel']);
        $message = new Message();
        $message->setUser($this->getUser()->getUsername());
        $message->setTimestamp(date("F j, Y, g:i a"));
        $message->setChannel($channel);
        $message->setMessage($request->request->get('message'));
        $this->messageRepository->save($message);

//        $messages = $this->messageRepository->findBy(['channel' => $channel]);

        $update = new Update(
            'http://example.com/files/1',
            json_encode(['message' => $message->getMessage(), 'timestamp' => date("F j, Y, g:i a"), 'username' => $this->getUser()->getUsername(), 'channel' => 'MercureChannel'])
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

        return new Response(json_encode($messages));
    }
}
