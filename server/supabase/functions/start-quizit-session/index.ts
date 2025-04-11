import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";
import { redisClient } from "./redisClient.ts";
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
  // Validate Authorization header before using it
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({
      error: "Missing or invalid Authorization header"
    }), {
      status: 401,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = Deno.env.get("URL");
  const supabaseAnonKey = Deno.env.get("ANON_KEY");
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
  // Get the user 
  const { data: userData } = await supabaseClient.auth.getUser(token);
  const user = userData.user;
  // Log the user ID
  const data = await req.json();
  try {
    let sessionId;
    switch(data.type){
      case "book":
        sessionId = await handleBookQuizit(data.filters, user, supabaseClient);
        break;
      case "insight":
        sessionId = await handleInsightQuizit(data.filters, user, supabaseClient);
        break;
      case "library":
        sessionId = await handleLibraryQuizit(data.filters);
        break;
      default:
        return new Response(JSON.stringify({
          error: "Invalid quiz type"
        }), {
          status: 400
        });
    }
    return new Response(JSON.stringify({
      sessionId
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});

//!!! Should be handle all types of quizits
async function handleBookQuizit({ bookId, saved, combine, exclusive }, user, supabaseClient) {
  const insights = await fetchInsightsByBook(bookId, saved, user, supabaseClient);
  await fisherYatesShuffle(insights);
  //Create a session data object to store in Redis
  const sessionId = generateSessionId();
  const sessionData = {
    combine,
    exclusive
  };
  await redisClient.set(`quizit-session:${sessionId}`, JSON.stringify(sessionData));
  // Store the book insights in Redis List
  for (const insight of insights){
    await redisClient.rpush(`quizit-session:${sessionId}:insights`, JSON.stringify(insight));
  }

  if (!exclusive) {
    if (combine) {
      // Currently no logic  in selection of other insights, just copying the bottom
      const insightsSecondary = await fetchSecondaryInsightsByBook(bookId, user, supabaseClient);
      for (const insight of insightsSecondary){
        await redisClient.rpush(`quizit-session:${sessionId}:insightsSecondary`, JSON.stringify(insight));
      }
      // const typeCount = await countInsightTypesByBook();
      // const insightCount = insights.length;
      // const insightsSecondary = await fetchSecondaryInsights
    } else {
      const insightsSecondary = await fetchSecondaryInsightsByBook(bookId, user, supabaseClient);
      for (const insight of insightsSecondary){
        await redisClient.rpush(`quizit-session:${sessionId}:insightsSecondary`, JSON.stringify(insight));
      }
    }
  }

  return sessionId;
}
async function handleInsightQuizit({ insightId, saved, combine, exclusive }, user, supabaseClient) {
  const insights = await fetchInsightsByRoot(insightId, saved, user, supabaseClient);
  await fisherYatesShuffle(insights);
  //Create a session data object to store in Redis
  const sessionId = generateSessionId();
  const sessionData = {
    combine,
    exclusive
  };
  await redisClient.set(`quizit-session:${sessionId}`, JSON.stringify(sessionData));
  // Store the book insights in Redis List
  for (const insight of insights){
    await redisClient.rpush(`quizit-session:${sessionId}:insights`, JSON.stringify(insight));
  }
  return sessionId;
}
async function fetchInsightsByBook(bookId, saved, user, supabaseClient) {
  let insights;
  let error;
  if (saved) {
    const { data, error: fetchError } = await supabaseClient.from('UserInsight').select('Insight(*), Book(coverURL)').eq('saved', true).eq('bookId', bookId).eq('userId', user.id);
    insights = data?.map((item)=>({
        ...item.Insight,
        coverURL: item.Book?.coverURL
      })) || [];
    error = fetchError;
  } else {
    const { data, error: fetchError } = await supabaseClient.from("Insight").select("*, Book(coverURL)").eq("bookId", bookId).eq('leaf', true);
    insights = data ? data.map((item)=>({
        ...item,
        coverURL: item.Book?.coverURL
      })) : [];
    error = fetchError;
  }
  if (error) {
    throw new Error(`Error fetching book: ${error.message}`);
  }
  return insights;
}
async function fetchInsightsByRoot(insightId, saved, user, supabaseClient) {
  let insights;
  let error;
  if (saved) {
    const { data, error: fetchError } = await supabaseClient.rpc('get_descendant_leaf_saved_insights_with_cover', {
      root_id: insightId,
      user_id: user.id
    });
    insights = data || [];
    error = fetchError;
  } else {
    const { data, error: fetchError } = await supabaseClient.rpc('get_descendant_leaf_insights_with_cover', {
      root_id: insightId
    });
    insights = data || [];
    error = fetchError;
  }
  if (error) {
    throw new Error(`Error fetching insights: ${error.message}`);
  }
  return insights;
}
async function fetchSecondaryInsightsByBook(bookId, user, supabaseClient) {
  let insights;
  let error;
  const { data, error: fetchError } = await supabaseClient.from('UserInsight').select('Insight(*), Book(coverURL)').eq('saved', true).neq('bookId', bookId).eq('userId', user.id).order('RANDOM()', { foreignTable: null }).limit(50);;
  insights = data?.map((item)=>({
      ...item.Insight,
      coverURL: item.Book?.coverURL
    })) || [];
  error = fetchError;
  if (error) {
    throw new Error(`Error fetching book: ${error.message}`);
  }
  return insights;
};
async function fisherYatesShuffle(array) {
  for(let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [
      array[j],
      array[i]
    ];
  }
  return array;
}
function generateSessionId() {
  return crypto.randomUUID(); // Use a UUID for the session ID
}


// Thinking
// 
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//