import { WebappPluginContributions } from "@jcoreio/clarity-plugin-api/server";
import express from "express";

export default (() => {
  const api = express.Router();
  api.get("/hello", (req, res) =>
    res.status(200).set("Content-Type", "text/plain").end("hello world!"),
  );

  return {
    api,
  };
}) satisfies WebappPluginContributions;
