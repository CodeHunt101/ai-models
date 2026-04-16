import { NextRequest, NextResponse } from 'next/server'
import { ImageGenerationModel } from '@/types/enums'
import { getImageGeneration } from '@/utils/openai-requests'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI()
    const body = await req.json()
    const prompt = body.prompt

    if (!prompt) {
      return NextResponse.json({ error: { message: 'Prompt is required' } }, { status: 400 })
    }

    console.log({
      service: 'Image generation',
      date: new Date().toLocaleString('en-AU'),
      prompt,
    })

    const image = await getImageGeneration(
      prompt,
      ImageGenerationModel.DALL_E_3,
      openai
    )
    console.log({ result: image.data?.[0]?.url })
    if (!image.data) {
      throw new Error('No image data returned')
    }
    return NextResponse.json({ result: image.data })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }
}
