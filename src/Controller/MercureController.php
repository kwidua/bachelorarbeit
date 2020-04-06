<?php

namespace App\Controller;

use App\Repository\FileRepository;
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
    private $fileRepository;

    public function __construct(PublisherInterface $publisher, FileRepository $fileRepository)
    {
        $this->publisher = $publisher;
        $this->fileRepository = $fileRepository;
    }

    /**
     * @Route("/mercure", name="mercure")
     */
    public function index()
    {
        $files = $this->fileRepository->findAll();

        return $this->render('mercure/index.html.twig', [
            'controller_name' => 'MercureController',
            'files' => $files,
            'user' => $this->getUser()
        ]);
    }

    /**
     *  @Route("/mercure/publish", name="mercure_publish")
     */
    public function publish()
    {
        $files = $this->fileRepository->findAll();

        $update = new Update(
            'http://example.com/files/1',
            json_encode(['message' => 'test', 'timestamp' => time(), 'username' => $this->getUser()->getUsername()])
        );

        $this->publisher->__invoke($update);

        return new Response('published a new file!');
    }

    public function save()
    {
//        $this->fileRepository->save()
    }
}
