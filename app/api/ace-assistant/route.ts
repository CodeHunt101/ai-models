import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Thread } from 'openai/resources/beta/threads/threads'

let thread: Thread | null = null

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI()
    const body = await req.json()

    if (body.deleteThread) {
      if (!thread) return NextResponse.json({ message: 'no thread to delete' })
      // @ts-ignore
      const response = await openai.beta.threads.del(thread.id)
      console.log(response)
      thread = null
      return NextResponse.json({ message: 'thread deleted' })
    }

    if (body.retrieveLastMessage) {
      if (!thread) {
        return NextResponse.json({ message: 'no messages found' })
      }
      const threadMessages = await openai.beta.threads.messages.list(
        thread.id,
        { limit: 1 }
      )
      const lastMessage = (threadMessages.data[0].content[0] as any).text.value
      return NextResponse.json({ lastMessage })
    }

    const myAssistant = await openai.beta.assistants.retrieve(
      'asst_c8OW9PpTXGoQJQDPrYuWIJ3A'
    )

    if (!thread) {
      thread = await openai.beta.threads.create()
    }

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: body.prompt,
    })

    let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: myAssistant.id,
    })

    while (
      run.status !== 'completed' &&
      !['requires_action', 'cancelling', 'cancelled', 'expired', 'failed'].includes(run.status)
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // @ts-ignore
      run = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    }

    if (run.status === 'failed') {
      return NextResponse.json({ message: 'run failed, try again' })
    }

    const messages = await openai.beta.threads.messages.list(thread.id)
    const messageContentTextData = messages.data.map((messageData) =>
      messageData.content.map((content) => (content as any).text.value)
    )[0][0]

    return NextResponse.json({ result: messageContentTextData })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }
}
