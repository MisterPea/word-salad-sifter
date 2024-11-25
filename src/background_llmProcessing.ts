import Anthropic from "@anthropic-ai/sdk";
import { getApiKey } from "./background_llmApiCalls";
import { prompts } from "./prompts";

const MAIN_PROMPT = prompts.main;

const SANITY_CHECK = prompts.sanityCheck;

export async function llmJobDescriptionProcessing(jobText: string): Promise<string> {
  let apiKey = undefined;
  try {
    apiKey = await getApiKey();
    const anthropic = new Anthropic({
      apiKey,
      defaultHeaders: {
        'anthropic-dangerous-direct-browser-access': 'true'
      }
    });
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [{ role: "user", content: MAIN_PROMPT + jobText + SANITY_CHECK }]
    });
    const response = msg.content[0];
    if (response.type === 'text') {
      return response.text;
    }
  } catch (error) {
    if (apiKey === undefined || apiKey === '') {
      throw 'API_KEY_NOT_PRESENT';
    } else {
      throw error; // Error in Anthropic Guts
    }
  }
}

export async function validateAnthropicApiKey(apiKey: string | undefined): Promise<boolean> {
  if (apiKey === undefined) {
    // console.log("IN VALIDATE");
    return false;
  }
  try {
    const anthropic = new Anthropic({
      apiKey,
      defaultHeaders: {
        'anthropic-dangerous-direct-browser-access': 'true'
      }
    });
    await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1,
      messages: [{ role: "user", content: "Test" }]
    });
    return true; // If we get here, the API key is valid
  } catch (error) {
    console.log("ERROR:", error);
    if (error.status === 401) {
      return false; // Unauthorized, invalid API key
    }
    throw error; // Other errors (e.g., network issues)
  }
}