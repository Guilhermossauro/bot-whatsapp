import { Client, ContactId, Message } from "@open-wa/wa-automate";

async function lowerToUser(client: Client, message: Message) {
  const {
    id,
    from,
    sender,
    isGroupMsg,
    chat,
    body,
    caption,
    mentionedJidList,
  } = message;

  if (!isGroupMsg) {
    return client.reply(from, "Este comando só pode ser usado em grupos.", id);
  }
  const commands = caption || body || "";
  const args = commands.split(" ");

  if (args.length === 1)
    return client.reply(
      from,
      "Ainda não adivinho coisas... preciso saber quem também!",
      id
    );

  const groupId = chat.groupMetadata.id;
  const groupAdmins = await client.getGroupAdmins(groupId);
  const isGroupAdmins = groupAdmins.includes(sender.id);
  const botNumber = await client.getHostNumber();
  const isBotGroupAdmins = isGroupMsg
    ? groupAdmins.includes((botNumber + "@c.us") as ContactId)
    : false;

  if (!isGroupAdmins) {
    return client.reply(
      from,
      "Somente administradores do grupo podem usar este comando.",
      id
    );
  }

  if (!isBotGroupAdmins)
    return client.reply(
      from,
      "Preciso ser administrador do grupo para que isso funcione.",
      id
    );

  if (mentionedJidList.length === 0)
    return client.reply(
      from,
      "Você precisa mencionar um admin para que isso dê certo",
      id
    );
  if (mentionedJidList.length >= 2)
    return client.reply(from, "Mencione 1 usuário por vez.", id);
  if (!groupAdmins.includes(mentionedJidList[0]))
    return client.reply(
      from,
      "O ele já é usuário, não precisa ser rebaixado",
      id
    );

  await client.react(id, "👌");

  await client.demoteParticipant(groupId, mentionedJidList[0]);
  await client.sendTextWithMentions(
    from,
    `Pronto! @${mentionedJidList[0]} agora é só um usuário.`
  );
}

export default lowerToUser;
