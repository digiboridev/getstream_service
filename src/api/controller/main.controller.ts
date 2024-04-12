import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth.middleware";
import { gsClient } from "../../core/getstream.client";

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

    await gsClient.upsertUser({ id: id, name: name });
    const token = gsClient.createToken(id);

    const gfilter = { type: "messaging", members: { $eq: [id, "WebTrit"] } };
    const gchannels = await gsClient.queryChannels(gfilter);
    const hasGreeting: boolean = gchannels.length != 0;

    if (!hasGreeting) {
      const greetingsChannel = gsClient.channel("messaging", { members: [id, "WebTrit"], created_by_id: "WebTrit" });
      await greetingsChannel.create();
      await greetingsChannel.sendMessage({ text: "Welcome to webtrit chat!", user_id: "WebTrit" });
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

      const filter = { type: "messaging", members: { $eq: [userId, participantId] } };
      const channels = await gsClient.queryChannels(filter);
      const existAlready: boolean = channels.length != 0;

      if (existAlready) return reply.send({ channel: channels[0].id });

      // TODO: Retrieve the name of the participant from the core backend
      await gsClient.upsertUser({ id: participantId });
      const ch = gsClient.channel("messaging", { members: [userId, participantId], created_by_id: userId });
      await ch.create();

      reply.send({ channel: ch.id });
    }
  );

  done();
};
