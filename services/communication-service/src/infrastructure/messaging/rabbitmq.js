import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

let channel;
let connection;

export async function getRabbitChannel() {
  if (channel) return channel;

  connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertExchange("communication", "topic", { durable: true });
  await channel.assertQueue("communication.notifications", { durable: true });

  await channel.bindQueue(
    "communication.notifications",
    "communication",
    "message.created"
  );

  return channel;
}

export async function publishMessageCreated(message) {
  const rabbitChannel = await getRabbitChannel();

  console.log("Publicando message.created:", message);

  rabbitChannel.publish(
    "communication",
    "message.created",
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
}