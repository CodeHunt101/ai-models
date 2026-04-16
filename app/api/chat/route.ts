import { NextRequest, NextResponse } from 'next/server'
import { messagesWithUser, updateMessagesWithUser } from '@/utils/store'
import { filterMessagesByUser, addUserMessage, logMessageWithTimestamp } from '@/utils/helpers'
import { ChatCompletionMessageParam } from 'openai/resources'
import { getChatCompletion, getChatCompletionWithVisuals } from '@/utils/openai-requests'
import { ChatCompletionModel } from '@/types/enums'
import OpenAI from 'openai'
import { addAssistantMessage } from '@/utils/helpers'

// Helper to update messages (duplicated/adapted from utils/api/chat.ts to avoid NextApiResponse dependency)
const updateMessages = (
  user: string,
  response: string | null,
  filteredMessages: ChatCompletionMessageParam[]
) => {
  const messagesWithUserWithAssistant = addAssistantMessage(
    user,
    response,
    messagesWithUser
  )
  updateMessagesWithUser(messagesWithUserWithAssistant)
  filteredMessages.push({ role: 'assistant', content: response ?? '' })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const user = (formData.get('user') as string) || ''
    const getMessages = formData.get('getMessages')
    const deleteMessages = formData.get('deleteMessages')

    if (getMessages) {
      const filteredMessages = filterMessagesByUser(user, messagesWithUser)
      return NextResponse.json({ result: filteredMessages.slice(-10) })
    }

    if (deleteMessages) {
      const newMessages = messagesWithUser.filter((message) => message.user !== user)
      updateMessagesWithUser(newMessages)
      return NextResponse.json({ message: 'removed messages' })
    }

    const prompt = (formData.get('prompt') as string) || ''
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: { message: 'Please enter a valid prompt' } }, { status: 400 })
    }

    logMessageWithTimestamp('Chat', prompt)

    const newMessagesWithUser = addUserMessage(prompt, user, messagesWithUser)
    updateMessagesWithUser(newMessagesWithUser)
    const filteredMessages = filterMessagesByUser(user, newMessagesWithUser)
    const openai = new OpenAI({
      baseURL: process.env.DEEPSEEK_BASE_URL,
      apiKey: process.env.DEEPSEEK_API_KEY,
    })
    
    const imageFiles = Array.from(formData.entries())
      .filter(([key, value]) => value instanceof File && value.size > 0)
      .map(([_, value]) => value as File)

    if (imageFiles.length > 0) {
      // Handle images
      const base64Images = []
      for (const file of imageFiles) {
        const buffer = Buffer.from(await file.arrayBuffer())
        base64Images.push(buffer.toString('base64'))
      }

      const chatCompletion = await getChatCompletionWithVisuals(
        prompt,
        ChatCompletionModel.DEEPSEEK_REASONER,
        base64Images,
        openai
      )
      const response = chatCompletion.choices[0].message?.content
      updateMessages(user, response, filteredMessages)
      return NextResponse.json({ result: filteredMessages.slice(-10) })

    } else {
      // Handle prompt only
      const chatCompletion = await getChatCompletion(
        filteredMessages,
        ChatCompletionModel.DEEPSEEK_REASONER,
        openai
      )
      const response = chatCompletion.choices[0].message?.content
      updateMessages(user, response, filteredMessages)
      return NextResponse.json({ result: filteredMessages.slice(-10) })
    }

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }
}
