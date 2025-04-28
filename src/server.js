import "dotenv/config";
import Fastify from "fastify";
import fs from "fs";
import path from "path";
import multipart from "@fastify/multipart";
import os from "os";
import { transcribe } from "./transcribe.js";

const baseDirectory = os.tmpdir();

const fastify = Fastify({
  logger: true,
});

// Ensure temp directory exists
const tempDir = path.join(baseDirectory, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Register multipart
fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

fastify.addHook("onRequest", async (request, reply) => {
  const authHeader = request.headers.authorization;
  const token = process.env.AUTH_TOKEN;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply
      .status(401)
      .send({ error: "Unauthorized: Missing or invalid token" });
  }

  const providedToken = authHeader.split(" ")[1];

  if (providedToken !== token) {
    return reply.status(401).send({ error: "Unauthorized: Invalid token" });
  }
});

fastify.post("/transcribe", async function (request, reply) {
  try {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    const audioFile = data.file;
    const prompt = data.fields.prompt ? data.fields.prompt.value : undefined;

    // Create a unique filename
    const filename = `${Date.now()}-${data.filename}`;
    const tempFilePath = path.join(tempDir, filename);

    // Save the file to the temp directory
    const writeStream = fs.createWriteStream(tempFilePath);
    await new Promise((resolve, reject) => {
      audioFile.pipe(writeStream).on("finish", resolve).on("error", reject);
    });

    const result = await transcribe(tempFilePath, data.mimetype, prompt);

    console.debug({ tempFilePath, mimeType: data.mimetype, prompt });

    // Clean up the temporary file
    fs.unlink(tempFilePath, (err) => {
      if (err) {
        fastify.log.error(`Failed to delete temp file: ${tempFilePath}`);
      }
    });

    reply.send({ result });
  } catch (error) {
    fastify.log.error(error);
    reply
      .status(500)
      .send({ error: "An error occurred during transcription." });
  }
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
