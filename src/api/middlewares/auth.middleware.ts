import { FastifyRequest, FastifyReply } from "fastify";
import { errorMessage } from "../../core/errors";
import axios from "axios";
import { CORE_URI } from "../../core/constants";

export type UserData = {
  id: string;
  name: string;
  tenantId: string;
};

declare module "fastify" {
  interface FastifyRequest {
    userData: UserData;
  }
}

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.headers.authorization?.split(" ")[1];
  const tenantId = request.headers["x-tenant-id"] as string;

  if (!token) {
    reply.status(401).send("no_token_provided");
    console.log("auth middleware:", "no token provided");
    return;
  }

  if (!tenantId) {
    reply.status(401).send("no_tenant_id_provided");
    console.log("auth middleware:", "no tenant id provided");
    return;
  }

  try {
    // TODO: extract to service
    const userResponse = await axios.get(`${CORE_URI}/tenant/${tenantId}/api/v1/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("auth middleware:", userResponse.data);

    const mainNumber = userResponse.data.numbers.main;
    const name = userResponse.data.first_name + " " + userResponse.data.last_name;

    if (!mainNumber) throw new Error("no_main_number");
    if (!name) throw new Error("no_name");

    request.userData = { id: mainNumber, name: name, tenantId: tenantId };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      reply.status(error.response?.status || 500).send(error.response?.data.code);
      console.log("auth middleware:", error.response?.data);
      return;
    }

    reply.status(401).send(errorMessage(error));
    console.log("auth middleware:", error);
    return;
  }
};
