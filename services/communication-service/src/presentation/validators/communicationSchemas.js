import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Mensagem não pode ficar vazia")
    .max(100, "Mensagem muito longa"),
});

export const createChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome do canal muito curto")
    .max(60, "Nome do canal muito longo"),

  description: z
    .string()
    .trim()
    .max(300, "Descrição muito longa")
    .optional()
    .nullable(),

  type: z
    .enum(["public", "private", "direct"])
    .optional(),
});

export const createDirectChannelSchema = z.object({
  targetUserId: z
    .string()
    .trim()
    .min(1, "Usuário de destino é obrigatório"),
});