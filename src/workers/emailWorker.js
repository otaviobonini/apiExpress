import { Worker } from "bullmq";
import { connection } from "../lib/Queue.js";
import { prisma } from "../database/prisma.js";
import Mail from "../lib/Mail.js"; // seu Mail tem método send()

new Worker(
  "email",
  async (job) => {
    if (job.name !== "welcome-email") return;

    const user = await prisma.user.findUnique({
      where: { id: job.data.userId },
    });

    if (!user) return;

    await Mail.send({
      to: `${user.username} <${user.email}>`,
      subject: "Bem-vindo ao nosso sistema",
      text: `Olá ${user.username}, obrigado por se cadastrar!`,
    });
  },
  { connection }
);
