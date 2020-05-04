/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import '../css/app.css';
import React from 'react';
import { render } from 'react-dom'
import {MercureApp} from "./components/MercureApp";
import {WebSocketApp} from "./components/WebSocketApp";
import {ServerSentEventsApp} from "./components/ServerSentEventsApp";

// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';
const mercure = document.getElementById('mercure-app');
const websocket = document.getElementById('websocket-app');
const sse = document.getElementById('sse-app');

if (typeof(mercure) != 'undefined' && mercure != null)
{
    render(<MercureApp />, document.getElementById('mercure-app'));
}

if (typeof(websocket) != 'undefined' && websocket != null)
{
    render(<WebSocketApp />, document.getElementById('websocket-app'));
}

if (typeof(sse) != 'undefined' && sse != null)
{
    render(<ServerSentEventsApp />, document.getElementById('sse-app'));
}

