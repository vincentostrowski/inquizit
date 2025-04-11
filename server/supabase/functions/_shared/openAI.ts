import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'

const apiKey = Deno.env.get('OPENAI_API_KEY')
const openai = new OpenAI({
    apiKey: apiKey,
})

export { openai }
