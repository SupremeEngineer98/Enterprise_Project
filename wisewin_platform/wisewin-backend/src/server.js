/**
 * @api {listen} /server Server Initialization
 * @apiName StartServer
 * @apiGroup Server
 * @apiVersion 1.0.0
 *
 * @apiDescription
 * Entry point of the WiseWin backend application.
 * Imports the Express app and environment configuration,
 * then starts the HTTP server on the configured port.
 *
 * @apiParam {Number} port The port number defined in the environment config (`env.port`).
 *
 * @apiSuccess {String} message Console log confirming the server is running.
 * @apiSuccessExample {text} Server Started:
 *     Server listening on http://localhost:3000
 *
 * @apiError ServerError The server failed to start due to misconfiguration or port conflict.
 */
import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});