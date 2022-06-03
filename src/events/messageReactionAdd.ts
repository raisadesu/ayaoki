import { Client, MessageReaction } from "discord.js"
import DiscordEvent from '../types/event'

export const name = 'messageReactionAdd'

export async function execute(client: Client, reaction: MessageReaction) {
    const eten = await reaction.users.fetch('889396376746721320' as Object)
    if (eten && reaction.emoji.url && reaction.count === 1) {
        const msg = await reaction.message.channel.send('dzięki eten :+1:')
        setTimeout(() => msg.delete(), 1666)
    }
}