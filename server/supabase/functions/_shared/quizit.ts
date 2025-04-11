import { openai } from "./openAI.ts";

async function createQuizitProblem(insight) {
    const prompt = `
        Generate for me a scenario problem based on the following key point:
        
        ${insight.title}:
        ${insight.body.map((paragraph) => `- ${paragraph}`).join('\n')}
        
        ${insight.prompt}
        
        Instructions:
        - The problem should be concise.
        - Ensure the problem does not use too much phrasing from original key point.
        - It is intended for the reader to recognize the key point from this scenario.
    `;
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: prompt.trim(),
            },
        ],
    });
    return completion.choices[0].message.content;
}
  
async function createQuizitExplanation(insight, quizitProblem) {
    const prompt = `
        Generate for me an explanation on how the following key point is present in the problem:
        
        ${insight.title}:
        ${insight.body.map((paragraph) => `- ${paragraph}`).join('\n')}
        
        ${insight.prompt}
        
        Quizit Problem:
        ${quizitProblem}
        
        Instructions:
        - The explanation should be concise.
    `;
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });
    return completion.choices[0].message.content;
}

async function createQuizitProblemCombination(promptPrimary, promptSecondary) {
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });
    return completion.choices[0].message.content;
}
  
async function createQuizitExplanationCombination(prompt, quizitProblem) {
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });
    return completion.choices[0].message.content;
}

async function createQuizitItems_Separate(insight) {
  const quizitProblem = await createQuizitProblem(insight);
  console.log(`Quizit Problem: ${quizitProblem}`);
  const quizitExplanation = await createQuizitExplanation(insight, quizitProblem);
    console.log(`Quizit Explanation: ${quizitExplanation}`);
  return { insight, quizitProblem, quizitExplanation };
}

function createQuizitItems_Combined(insightPrimary, insightSecondary) {
  const quizitProblem = createQuizitProblemCombination(insightPrimary.prompt, insightSecondary.prompt);
  const quizitExplanationPrimary = createQuizitExplanationCombination(insightPrimary.prompt, quizitProblem);
  const quizitExplanationSecondary = createQuizitExplanationCombination(insightSecondary.prompt, quizitProblem);
  return { quizitProblem, quizitExplanationPrimary, quizitExplanationSecondary, insightPrimary, insightSecondary };
}

function validPairCondition(insightPrimaryType, insightCandidateType) {
    const validPairs = ['AB', 'BA']; // eventually define this globally as all pairings will use this legend
    const pair = `${insightPrimaryType}${insightCandidateType}`;
    return validPairs.includes(pair);
}
  
function getSecondaryInsight(insightPrimaryType, insightsList) {
    let insightSecondary = null;
    let insightSecondaryString = null;

    // Generate a random starting index
    const randomStartIndex = Math.floor(Math.random() * insightsList.length);

    // Loop through the array starting at the random index and wrapping around
    for (let offset = 0; offset < insightsList.length; offset++) {
        const i = (randomStartIndex + offset) % insightsList.length; // Wrap around using modulo
        const candidate = JSON.parse(insightsList[i]);

        if (validPairCondition(insightPrimaryType, candidate.type)) {
            insightSecondary = candidate;
            insightSecondaryString = insightsList[i];
            break;
        }
    }

return { insightSecondary, insightSecondaryString }
}

export { createQuizitProblem, createQuizitExplanation, createQuizitProblemCombination, createQuizitExplanationCombination, createQuizitItems_Separate, createQuizitItems_Combined, getSecondaryInsight };