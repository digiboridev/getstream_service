import { StreamChat } from "stream-chat";
import { GETSTREAM_KEY, GETSTREAM_SECRET } from "./constants";

/// GetStream client
export const gsClient = StreamChat.getInstance(GETSTREAM_KEY, GETSTREAM_SECRET);
