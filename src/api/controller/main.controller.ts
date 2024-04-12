import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth.middleware";
import { GetStreamService } from "../../service/getstream.service";

export const mainController = (fastify: FastifyInstance, _: any, done: Function) => {
  fastify.addHook("preHandler", authMiddleware);

  /// Health check endpoint
  fastify.get("/health-check", async (_, reply) => {
    reply.send("OK");
  });

  /// Endpoint to get a chat token for the user
  /// It uses the user data from the core backend thats passed through the auth middleware
  fastify.get("/chat-token", async (request, reply) => {
    const { id, name } = request.userData;
    console.log("chat-token: ", id, name);

    await GetStreamService.upsertUser({ id: id, name: name });
    const token = GetStreamService.createToken(id);

    const hasGreetingChannel: boolean = await GetStreamService.hasConversationBetween([id, "WebTrit"]);

    if (!hasGreetingChannel) {
      const chId = await GetStreamService.createChannel("messaging", [id, "WebTrit"], "WebTrit");
      await GetStreamService.sendMessage(chId, { text: "Welcome to webtrit chat!", user_id: "WebTrit" });
    }

    reply.send({ userId: id, token: token });
  });

  /// Endpoint to prepare a conversation between two users (userId and participantId)
  /// For cases where the participantId may not synced in the database yet (e.g. new user to getStream)
  fastify.post<{ Body: { participantId: string } }>(
    "/prepare-conversation",
    {
      schema: {
        body: {
          type: "object",
          required: ["participantId"],
          properties: {
            participantId: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData.id;
      const participantId = request.body.participantId;
      console.log("prepare-conversation: ", userId, participantId);

      // TODO: Retrieve the name of the participant from the core backend
      await GetStreamService.upsertUser({ id: participantId });
      const channelId = await GetStreamService.createChannel("messaging", [userId, participantId], userId);

      reply.send({ code: "ok", channelId: channelId});
    }
  );

  done();
};
