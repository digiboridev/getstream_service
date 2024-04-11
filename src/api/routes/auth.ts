import { FastifyInstance } from "fastify";
import { StreamChat } from "stream-chat";
import { authMiddleware } from "../middlewares/auth.middleware";
import { GETSTREAM_KEY, GETSTREAM_SECRET } from "../../core/constants";
import { get } from "http";

// TODO: extract to service
const getStream = StreamChat.getInstance(GETSTREAM_KEY, GETSTREAM_SECRET);

export const authRoute = (fastify: FastifyInstance, _: any, done: Function) => {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get("/chat-token", async (request, reply) => {
    const { id, name } = request.userData;
    console.log("chat-token: ", id, name);

    await getStream.upsertUser({ id: id, name: name });
    const token = getStream.createToken(id);

    const gfilter = { type: "messaging", members: { $eq: [id, "WebTrit"] } };
    const gchannels = await getStream.queryChannels(gfilter);
    const hasGreeting: boolean = gchannels.length != 0;

    if (!hasGreeting) {
      const greetingsChannel = getStream.channel("messaging", { members: [id, "WebTrit"], created_by_id: "WebTrit" });
      await greetingsChannel.create();
      await greetingsChannel.sendMessage({ text: "Welcome to webtrit chat!", user_id: "WebTrit" });
    }

    reply.send({ userId: id, token: token });
  });

  done();
};
