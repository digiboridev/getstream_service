import { FastifyFactory } from "./api/factory";

async function main() {
  console.log("Hello World!");

  try {
    // Start fastify server
    const fastify = await FastifyFactory.createInstance();
    const port = (process.env.PORT || 3000) as number;
    await fastify.listen({ port: port, host: "0.0.0.0" });
    console.log(`server listening on port ${port}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
