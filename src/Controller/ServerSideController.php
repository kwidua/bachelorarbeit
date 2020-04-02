<?php

namespace App\Controller;

use App\Entity\File;
use App\Form\FileFormType;
use App\Repository\FileRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ServerSideController extends AbstractController
{
    /**
     * @var FileRepository
     */
    private $fileRepository;

    public function __construct(FileRepository $fileRepository)
    {
        $this->fileRepository = $fileRepository;
    }

    /**
     * @Route("/", name="home")
     */
    public function index()
    {
        $files = $this->fileRepository->findAll();


        return $this->render('server_side/index.html.twig', [
            'controller_name' => 'ServerSideController',
            'files' => $files,
        ]);
    }

    /**
     * @Route("/new", name="new")
     */
    public function newFile(Request $request)
    {
        $file = new File();
        $form = $this->createForm(FileFormType::class, $file);

        $form->handleRequest($request);
        if ($form->isSubmitted()) {
            $name = $form['name']->getData();
            $content = $form['content']->getData();
            $file->setName($name);
            $file->setContent($content);
            $this->fileRepository->save($file);
        }

        return $this->render('server_side/newFile.html.twig', [
            'file_form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/update/{name}", name="update")
     */
    public function updateFile(File $file, Request $request)
    {
        $form = $this->createForm(FileFormType::class, $file);

        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            $this->fileRepository->update($file);
            return $this->redirectToRoute('home');
        }

        return $this->render('server_side/newFile.html.twig', [
            'file_form' => $form->createView(),
        ]);
    }
}
