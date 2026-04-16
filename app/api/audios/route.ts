import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { AudioTranscriptionModel } from '@/types/enums'
import { getAudioTranscription } from '@/utils/openai-requests'

export async function POST(req: NextRequest) {
  console.log({
    service: 'Audio transcription',
    date: new Date().toLocaleString('en-AU'),
  })

  try {
    const openai = new OpenAI()
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: { message: 'No file uploaded' } }, { status: 400 })
    }

    // Validate file size/type if needed (similar to isUploadedFileValid)
    if (file.size === 0 || file.size > 2e7) {
       return NextResponse.json({ error: { message: 'Please upload a valid file' } }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const tempDirectory = '/tmp'
    const currentTime = Date.now()
    const fileType = file.name.split('.').pop()
    
    if (!fileType) {
        return NextResponse.json({ error: { message: 'Unable to determine file type' } }, { status: 400 })
    }

    const tempFilePath = path.join(tempDirectory, `tempAudio-${currentTime}.${fileType}`)
    // @ts-ignore
    await fs.promises.writeFile(tempFilePath, buffer)

    const audioFile = fs.createReadStream(tempFilePath)

    const audioTranscription = await getAudioTranscription(
      audioFile,
      AudioTranscriptionModel.GPT_4_O_MINI_TRANSCRIBE,
      openai
    )

    const result = audioTranscription.text
    console.log({ result })

    // Cleanup
    await fs.promises.unlink(tempFilePath)

    return NextResponse.json({ result })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: { message: error.message } }, { status: 500 })
  }
}
