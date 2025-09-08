import { Hono } from "hono";

interface D1Database {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepare: (query: string) => any;
}

interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

export default app;
