import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Get all playbooks from global store for context
    const playbooks = global.playbooksStore || []
    
    // If no playbooks, return helpful message
    if (playbooks.length === 0) {
      const answer = {
        answer: "I couldn't find any playbooks to reference. Try creating a playbook with relevant information first.",
        summary: "No playbooks available",
        steps: [],
        caveats: ["Create playbooks with information to get AI-powered answers"],
        referencedPlaybooks: [],
      }
      
      return NextResponse.json(answer)
    }

    // Build context from all playbooks
    const playbookContext = playbooks
      .map((p: any) => `## ${p.title}\n${p.description ? p.description + '\n' : ''}${p.contentMd}`)
      .join('\n\n---\n\n')

    // Call OpenAI with RAG pattern
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are OpAtlas, an AI assistant that helps teams navigate their operational playbooks and processes.

You will be provided with playbook content. Use this information to answer the user's question accurately and helpfully.

Your response must be in the following JSON format:
{
  "summary": "A one-sentence summary of the answer",
  "steps": ["Array of actionable steps if applicable"],
  "caveats": ["Array of important notes or edge cases"],
  "answer": "A detailed markdown-formatted answer"
}

Rules:
- Only use information from the provided playbooks
- If the playbooks don't contain enough information, acknowledge this
- Be concise but thorough
- Use markdown formatting in the "answer" field
- Include specific steps when the question is about "how to" do something
- Mention important caveats or edge cases`,
        },
        {
          role: 'user',
          content: `Question: ${question}

Relevant Playbooks:
${playbookContext}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0].message.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    const aiResponse = JSON.parse(responseText)

    // Return structured response
    return NextResponse.json({
      answer: aiResponse.answer,
      summary: aiResponse.summary,
      steps: aiResponse.steps || [],
      caveats: aiResponse.caveats || [],
      referencedPlaybooks: playbooks.map((p: any) => ({
        id: p.id,
        title: p.title,
      })),
    })
  } catch (error) {
    console.error('Error answering question:', error)
    
    // Check if it's an OpenAI API error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to answer question. Please try again.' },
      { status: 500 }
    )
  }
}
