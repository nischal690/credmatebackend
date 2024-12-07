/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";

let app: INestApplication;

/**
 * Creates and initializes the NestJS application if it doesn't exist
 * @return {Promise<INestApplication>} The initialized NestJS application
 */
async function createApp(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  }
  return app;
}

export const api = onRequest(async (request, response) => {
  const nestApp = await createApp();
  const expressInstance = nestApp.getHttpAdapter().getInstance();
  expressInstance(request, response);
});
