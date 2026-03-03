import Anthropic from "@anthropic-ai/sdk";
import { getApiKey } from "./background_llmApiCalls";
import { prompts } from "../prompts";
import { BackgroundError } from "./background_errors";

const MAIN_PROMPT = prompts.main;

const SANITY_CHECK = prompts.sanityCheck;

// TODO: REPLACE
export async function llmJobDescriptionProcessing(jobText: string): Promise<string> {
  let apiKey = undefined;
  try {
    apiKey = await getApiKey();
    if (!apiKey) {
      throw new BackgroundError('API_KEY_NOT_PRESENT', 'Anthropic API key is not present.');
    }
    const anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    const msg = await anthropic.messages.create({
      model: 'claude-4-sonnet-20250514',
      max_tokens: 1024,
      messages: [{ role: "user", content: MAIN_PROMPT + jobText + SANITY_CHECK }]
    });
    const response = msg.content[0];
    if (response.type === 'text') {
      return response.text;
    }
    throw new BackgroundError('ANTHROPIC_RESPONSE_INVALID', 'Anthropic response did not include text content.');
  } catch (error) {
    if (error instanceof BackgroundError) {
      throw error;
    }

    if (apiKey === undefined || apiKey === '') {
      throw new BackgroundError('API_KEY_NOT_PRESENT', 'Anthropic API key is not present.', { cause: error });
    }

    if (error instanceof Error && 'status' in error && error.status === 401) {
      throw new BackgroundError('ANTHROPIC_AUTH', 'Anthropic authentication failed.', { status: 401, cause: error });
    }

    throw new BackgroundError('UNKNOWN_ERROR', 'Anthropic processing failed.', { cause: error });
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
      dangerouslyAllowBrowser: true
    });
    await anthropic.messages.create({
      model: 'claude-4-sonnet-20250514',
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
