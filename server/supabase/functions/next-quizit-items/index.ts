import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { redisClient } from "./redisClient.ts";
import { createQuizitItems_Separate, createQuizitItems_Combined, getSecondaryInsight } from "./quizit.ts";
Deno.serve(async (req)=>{
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method Not Allowed"
    }), {
      status: 405,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  const data = await req.json();
  const sessionId = data.sessionId;
  const sessionDataString = await redisClient.get(`quizit-session:${sessionId}`);
  const sessionData = JSON.parse(sessionDataString);
  console.log(sessionData);
  let quizitItems;
  if (sessionData.combine && sessionData.exclusive) {
    quizitItems = await createQuizitItems_Exclusive_Combine(sessionId);
  } else if (!sessionData.combine && sessionData.exclusive) {
    quizitItems = await createQuizitItems_Exclusive_Seperate(sessionId);
  } else if (sessionData.combine && !sessionData.exclusive) {
    quizitItems = await createQuizitItems_Library_Combine(sessionId);
  } else {
    quizitItems = await createQuizitItems_Library_Seperate(sessionId);
  }
  return new Response(JSON.stringify({
    quizitItems
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
// TODO: 
// - add weighting to insight selection instead of just going through the list
async function createQuizitItems_Exclusive_Seperate(sessionId) {
  const insightString = await redisClient.lpop(`quizit-session:${sessionId}:insights`);
  const insight = JSON.parse(insightString);
  const quizitItems = await createQuizitItems_Separate(insight);
  await redisClient.rpush(`quizit-session:${sessionId}:insights`, insightString);
  return quizitItems;
}
///!!! separate into functions once logic figured out
/// with one array, take first insight, then find the pairing insight
async function createQuizitItems_Exclusive_Combine(sessionId) {
  console.log('combine ');
  const insightsList = await redisClient.lrange(`quizit-session:${sessionId}:insights`, 0, -1);
  //Also removes the first insight from the list
  const insightString = await redisClient.lpop(`quizit-session:${sessionId}:insights`);
  const insightPrimary = JSON.parse(insightString);
  const { insightSecondary, insightSecondaryString } = getSecondaryInsight(insightPrimary, insightsList);
  console.log('insightSecondaryString: ', insightSecondaryString);
  console.log('insightSecondary: ', insightSecondary);
  let quizitItems;
  if (!insightSecondary) {
    quizitItems = createQuizitItems_Separate(insightPrimary);
    await redisClient.rpush(`quizit-session:${sessionId}:insights`, insightString);
    return quizitItems;
  } else {
    quizitItems = createQuizitItems_Combined(insightPrimary, insightSecondary);
    // Remove the secondary insight from the list
    await redisClient.lrem(`quizit-session:${sessionId}:insights`, 1, insightSecondaryString);
    // Move both insights to the end of the list.
    await redisClient.rpush(`quizit-session:${sessionId}:insights`, insightString, insightSecondaryString);
  }
  return quizitItems;
}
async function createQuizitItems_Library_Seperate(sessionId) {
  let insightString;
  const randomBoolean = Math.random() < 0.5;
  if (randomBoolean) {
    insightString = await redisClient.lpop(`quizit-session:${sessionId}:insights`);
    await redisClient.rpush(`quizit-session:${sessionId}:insights`, insightString);
  } else {
    insightString = await redisClient.lpop(`quizit-session:${sessionId}:insightsSecondary`);
    await redisClient.rpush(`quizit-session:${sessionId}:insightsSecondary`, insightString);
  }
  const insight = JSON.parse(insightString);
  const quizitItems = await createQuizitItems_Separate(insight);
  return quizitItems;
}
async function createQuizitItems_Library_Combine(sessionId) {
  const insightString = await redisClient.lpop(`quizit-session:${sessionId}:insights`);
  const insight = JSON.parse(insightString);
  const insightStringSecondary = await redisClient.lpop(`quizit-session:${sessionId}:insightsSecondary`);
  const insightSecondary = JSON.parse(insightStringSecondary);
  
  const quizitItems = await createQuizitItems_Combined(insight, insightSecondary);
  await redisClient.rpush(`quizit-session:${sessionId}:insights`, insightString);
  await redisClient.rpush(`quizit-session:${sessionId}:insightsSecondary`, insightStringSecondary);
  return quizitItems;
  //For now this does not take into account types and is just seperate logic selection (random) then comboining
}
