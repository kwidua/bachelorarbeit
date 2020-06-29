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
import {MercureClient} from "./components/MercureClient";
import {WebSocketClient} from "./components/WebSocketClient";
import {ServerSentEventsClient} from "./components/ServerSentEventsClient";
import {XhrPollingClient} from "./components/XhrPollingClient";

// Need jQuery? Install it with "yarn add jquery", then uncomment to import it.
// import $ from 'jquery';
const mercure = document.getElementById('mercure-app');
const websocket = document.getElementById('websocket-app');
const sse = document.getElementById('sse-app');
const xhr = document.getElementById('xhr-app');

if (typeof(mercure) != 'undefined' && mercure != null)
{
    render(<MercureClient />, document.getElementById('mercure-app'));
}

if (typeof(websocket) != 'undefined' && websocket != null)
{
    render(<WebSocketClient />, document.getElementById('websocket-app'));
}

if (typeof(sse) != 'undefined' && sse != null)
{
    render(<ServerSentEventsClient />, document.getElementById('sse-app'));
}

if (typeof(xhr) != 'undefined' && xhr != null)
{
    render(<XhrPollingClient />, document.getElementById('xhr-app'));
}
