<?php

namespace App\Controller;

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

    public function __construct(PublisherInterface $publisher)
    {
        $this->publisher = $publisher;
    }

    /**
     * @Route("/mercure", name="mercure")
     */
    public function index()
    {
        return $this->render('mercure/index.html.twig', [
            'controller_name' => 'MercureController',
        ]);
    }

    /**
     *  @Route("/mercure/publish", name="mercure_publish")
     */
    public function publish()
    {
        $update = new Update(
            'http://example.com/files/1',
            json_encode(['status' => 'OutOfStock'])
        );

        $this->publisher->__invoke($update);

        return new Response('published a new file!');
    }
}
