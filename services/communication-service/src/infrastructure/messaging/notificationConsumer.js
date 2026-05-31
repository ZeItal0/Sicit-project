import { emitNotificationToUser } from "../../presentation/sockets/notificationSocketPublisher.js";
import { Notification } from "../../domain/entities/Notification.js";

export async function startNotificationConsumer(
  rabbitChannel,
  channelMemberRepository,
  notificationRepository
) {
  console.log("Consumer de notificações iniciado");

  await rabbitChannel.consume("communication.notifications", async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      console.log("Evento recebido no consumer:", event);

      const members = await channelMemberRepository.findMembersByChannelId(
        event.channelId
      );

      console.log("Membros do canal:", members);

      for (const member of members) {
        if (member.userId === event.senderId) continue;

        console.log("Enviando notificação para:", member.userId);

        const notification = new Notification({
          tenantId: event.tenantId,
          userId: member.userId,
          type: "NEW_MESSAGE",
          channelId: event.channelId,
          messageId: event.id,
          senderId: event.senderId,
          content: event.content
        });

        const savedNotification = await notificationRepository.create(notification);

        emitNotificationToUser(member.userId, savedNotification);
      }

      rabbitChannel.ack(msg);
    } catch (error) {
      console.error("Erro ao consumir notificação:", error);
      rabbitChannel.nack(msg, false, false);
    }
  });
}