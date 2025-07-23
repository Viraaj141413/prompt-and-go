import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are PeaksAI, an AI assistant that acts as a smart browser agent. Your job is to understand the user's requests and convert them into clear, step-by-step browser actions that a Puppeteer script can follow to automate tasks on the web.

Your responses should include two parts:

1. A natural language reply to the user explaining what you are going to do or have done.
2. A JSON-formatted instruction set listing the browser commands to perform, such as navigating to a URL, clicking elements, typing text, or waiting for page elements.

Example of the JSON instructions format:

{
  "actions": [
    { "type": "goto", "url": "https://www.google.com" },
    { "type": "type", "selector": "input[name='q']", "text": "order me a latte" },
    { "type": "press", "key": "Enter" },
    { "type": "waitForSelector", "selector": "#search" }
  ]
}

Available action types:
- "goto": Navigate to a URL
- "click": Click on an element (use CSS selector)
- "type": Type text into an input field
- "press": Press a keyboard key (Enter, Tab, etc.)
- "waitForSelector": Wait for an element to appear
- "waitForTimeout": Wait for a specific time (in milliseconds)
- "scroll": Scroll the page
- "screenshot": Take a screenshot
- "evaluate": Execute JavaScript on the page

If the user requests to order something online, search for information, fill forms, or browse pages, generate the best possible sequence of browser actions to fulfill the request.

IMPORTANT: Always respond with a JSON object containing both "message" and "actions" fields. The message should be conversational and explain what you're doing, while actions should be the technical browser automation steps.

Example response format:
{
  "message": "I'll help you order a latte! Let me navigate to a popular coffee ordering site and guide you through the process.",
  "actions": [
    { "type": "goto", "url": "https://www.starbucks.com/store-locator" },
    { "type": "waitForSelector", "selector": "#store-search" },
    { "type": "type", "selector": "#store-search", "text": "Enter your location" },
    { "type": "press", "key": "Enter" }
  ]
}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message: userMessage } = await req.json();
    console.log('Received user message:', userMessage);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: SYSTEM_PROMPT
          },
          { 
            role: 'user', 
            content: `User request: "${userMessage}"\n\nYour reply and instructions:` 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);
    
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', aiResponse);
      
      // Fallback response if JSON parsing fails
      parsedResponse = {
        message: aiResponse,
        actions: []
      };
    }

    console.log('Parsed AI response:', parsedResponse);

    return new Response(
      JSON.stringify(parsedResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in browser-agent function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});