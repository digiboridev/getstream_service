import { FastifyRequest, FastifyReply } from "fastify";
import { errorMessage } from "../../core/errors";
import axios from "axios";
import { UserService } from "../service/user.service";

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

  console.log("auth middleware:", token, tenantId);

  try {
    if (!token) throw new Error("no_token_provided");
    if (!tenantId) throw new Error("no_tenant_id_provided");

    // Get user data from the core backend
    const userData = await UserService.getUserData(token, tenantId);
    // Attachuser data to the request object to be able reach it in the controllers
    request.userData = userData;
  } catch (error) {
    reply.status(401).send(errorMessage(error));
    console.log("auth middleware:", error);
    return;
  }
};
