<?php


namespace App\Controller;

use App\Entity\Message;
use App\Repository\ChannelRepository;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Request;
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
        ]
            );
    }

    /**
     * @Route("/sse/data", methods="GET")
     */
    public function getMessages()
    {
        $channel = $this->channelRepository->findOneBy(['name' => 'SSEChannel']);
        $messages = $this->messageRepository->findBy(['channel' => $channel]);

        $messageArray = [];
        foreach ($messages as $message) {
            $messageArray[] = ['message' => $message->getMessage(), 'timestamp' => $message->getTimestamp()->format('d-m-Y H:i:s'), 'username' => $message->getUser(), 'channel' => $channel->getName()];
        }

        return new Response(json_encode($messageArray));
    }

    /**
     * @Route("/sse/save", methods="POST")
     */
    public function saveMessage(Request $request)
    {
        $now = new \DateTime();
        $channel = $this->channelRepository->findOneBy(['name' => 'SSEChannel']);
        $message = new Message();
        $message->setUser($this->getUser()->getUsername());
        $message->setTimestamp($now);
        $message->setChannel($channel);
        $message->setMessage($request->request->get('message'));
        $this->messageRepository->save($message);

        $client = HttpClient::create();
        $response = $client->request('POST', 'http://localhost:5000/publish', ['body' => json_encode(['message' => $message->getMessage(), 'timestamp' => $message->getTimestamp()->format('d-m-Y H:i:s'), 'username' => $message->getUser(), 'channel' => $channel->getName()])]);

        return $this->redirectToRoute('sse');
    }
}