import sharp from 'sharp'
import { SlashCommandBuilder } from '@discordjs/builders'
import fetch from 'node-fetch'
import { Client, MessageAttachment, CommandInteraction } from 'discord.js'

export const data = new SlashCommandBuilder()
        .setName('stretch')
        .setDescription('Stretch an image')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('The image to stretch')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('threshold')
                .setDescription('The threshold to stretch the image')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('The mode to stretch the image')
                .setRequired(false)
                .addChoices(
                    { name: 'horizontal', value: 'h' },
                    { name: 'vertical', value: 'v' },
                ))

export async function execute(client: Client, interaction: CommandInteraction) {
    await interaction.deferReply()
    let image: MessageAttachment | null | undefined = interaction.options.getAttachment('image', false)
    let mode = interaction.options.getString('mode', false) || 'h'
    let threshold = (interaction.options.getInteger('threshold', false) || 1) + 1
    let buffer
    if (image) {
        const response = await fetch(image.url)
        const arrayBuffer = await response.arrayBuffer()
        buffer = await Buffer.from(arrayBuffer)
    } else {
        // fetch last image sent in the channel
        const messages = await interaction.channel?.messages.fetch()
        const lastMessage = messages?.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => m.attachments.size > 0).first()
        try {
            image = lastMessage?.attachments.first()
        } catch (e) {
            await interaction.editReply({ content: 'No image found!' })
            return
        }
        const url = image?.url
        if (!url) return interaction.editReply({ content: 'No image found!' })
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        buffer = await Buffer.from(arrayBuffer)
    }

    if (image == null || image === undefined) {
        await interaction.editReply({ content: 'No image found!' })
        return
    }

    const width = image?.width
    if (width === null) {
        await interaction.editReply({ content: 'No image found!' })
        return
    }

    const height = image?.height
    if (height === null) {
        await interaction.editReply({ content: 'No image found!' })
        return
    }

    let thresholdH = mode === 'h' ? threshold : 1
    let thresholdV = mode === 'v' ? threshold : 1

    // stretch the image to 2x width
    const sharpBuf = await sharp(buffer)
    const stretched = await sharpBuf.resize(width * thresholdH, height * thresholdV, { fit: 'fill' }).toBuffer() // mhm

    await interaction.editReply({
        content: 'Here is your stretched image!',
        files: [{
            attachment: stretched,
            name: 'stretched.png'
        }]
    })
}
