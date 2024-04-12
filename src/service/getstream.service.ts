import { StreamChat } from "stream-chat";
import { GETSTREAM_KEY, GETSTREAM_SECRET } from "../core/constants";

const gsClient = StreamChat.getInstance(GETSTREAM_KEY, GETSTREAM_SECRET);

export class GetStreamService {

    static async upsertUser(user: { id: string; name?: string }) {
        await gsClient.upsertUser(user);
    }
    
    static async createToken(userId: string) {
        return gsClient.createToken(userId);
    }

    static async hasConversationBetween(members: string[]) {
        const filter = { type: "messaging", members: { $eq: members } };
        const channels = await gsClient.queryChannels(filter);
        return channels.length != 0;
    }
    
    static async createChannel(type: string, members: string[], createdBy: string) {
        const channel = gsClient.channel(type, { members: members, created_by_id: createdBy });
        await channel.create();
        return channel.cid;
    }

    static async sendMessage(channelId: string, message: { text: string; user_id: string }) {
        const channel = gsClient.channel("messaging", channelId);
        await channel.sendMessage(message);
    }
}