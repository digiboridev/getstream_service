import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { AppError, errorMessage } from "../core/errors";
import { authRoute } from "./routes/auth";


export class FastifyFactory {
  static async createInstance(): Promise<FastifyInstance> {
    const fastify = Fastify();

    // Plugins
    await fastify.register(cors);

    // Routes
    await fastify.register(authRoute, { prefix: "/auth" });

    // Error handler
    fastify.addHook("onError", async (request, reply, error) => {
      console.error(error);
      if (error instanceof AppError) {
        reply.status(error.code).send(error.message);
      } else {
        reply.status(500).send(errorMessage(error));
      }
    });

    return fastify;
  }
}


