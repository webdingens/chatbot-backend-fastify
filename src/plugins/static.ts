import fastify from "../fastify.js";
import path from "path";
import staticPlugin from "@fastify/static";

const publicPath = path.join(process.cwd(), "public");

fastify.register(staticPlugin, {
  root: publicPath,
});
