import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const SYSTEM_PROMPT = `You are PeaksAI, an intelligent browser automation assistant. Your job is to understand user requests and convert them into actionable browser automation steps that will be executed on a real browser.

When a user asks you to do something (like "order me a coffee", "find the best laptop deals", "book a flight"), you should:

1. Provide a helpful, conversational response explaining what you'll do
2. Generate a detailed sequence of browser actions that can be executed by Puppeteer

IMPORTANT: Always respond with a valid JSON object containing both "message" and "actions" fields.

Available action types:
- "goto": Navigate to a URL
- "click": Click on an element (use CSS selector or XPath)
- "type": Type text into an input field
- "press": Press a keyboard key (Enter, Tab, etc.)
- "waitForSelector": Wait for an element to appear
- "waitForTimeout": Wait for a specific time (in milliseconds)
- "scroll": Scroll the page (direction: "up", "down", or coordinates)
- "screenshot": Take a screenshot
- "hover": Hover over an element
- "select": Select an option from dropdown
- "evaluate": Execute JavaScript in the browser

Example response:
{
  "message": "I'll help you search for coffee shops nearby! Let me open Google and search for local coffee options.",
  "actions": [
    { "type": "goto", "url": "https://www.google.com" },
    { "type": "waitForSelector", "selector": "input[name='q']", "timeout": 5000 },
    { "type": "click", "selector": "input[name='q']" },
    { "type": "type", "selector": "input[name='q']", "text": "coffee shops near me" },
    { "type": "press", "key": "Enter" },
    { "type": "waitForSelector", "selector": "#search", "timeout": 10000 },
    { "type": "screenshot" }
  ]
}

For shopping requests, use popular sites like Amazon, eBay, or specific retailer websites.
For food orders, suggest popular delivery services like DoorDash, Uber Eats, or restaurant websites.
For travel, use sites like Google Flights, Expedia, or airline websites.
For general searches, use Google or other search engines.

Always provide realistic, working URLs and CSS selectors. Include screenshot actions at key steps to show progress.
Be specific with selectors and include timeouts for waitForSelector actions.`;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { message: userMessage } = await req.json();
    console.log('Received user message:', userMessage);

    // Use OpenRouter API directly with the provided key
    const openRouterApiKey = "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";
    
    console.log('Calling OpenRouter API...');

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tngtech/deepseek-r1t-chimera:free',
        messages: [
          { 
            role: 'system', 
            content: SYSTEM_PROMPT
          },
          { 
            role: 'user', 
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      // Fallback to mock response
      const fallbackResponse = generateFallbackResponse(userMessage);
      return new Response(
        JSON.stringify(fallbackResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('OpenRouter API response received');
    
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
      
      // Validate response structure
      if (!parsedResponse.message || !parsedResponse.actions) {
        throw new Error('Invalid response structure');
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', aiResponse);
      
      // Generate fallback response
      parsedResponse = generateFallbackResponse(userMessage);
    }

    console.log('Sending response with', parsedResponse.actions?.length || 0, 'actions');

    return new Response(
      JSON.stringify(parsedResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in browser-agent function:', error);
    
    // Return fallback response even on error
    const fallbackResponse = {
      message: "I'm having some technical difficulties right now, but I've prepared a basic web search for you.",
      actions: [
        { "type": "goto", "url": "https://www.google.com" },
        { "type": "waitForSelector", "selector": "input[name='q']" },
        { "type": "click", "selector": "input[name='q']" },
        { "type": "type", "selector": "input[name='q']", "text": "search query" },
        { "type": "press", "key": "Enter" }
      ]
    };
    
    return new Response(
      JSON.stringify(fallbackResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateFallbackResponse(userMessage: string) {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('coffee') || lowerMessage.includes('latte') || lowerMessage.includes('order')) {
    return {
      message: "I'll help you find coffee options! Let me search for local coffee shops and delivery options.",
      actions: [
        { "type": "goto", "url": "https://www.google.com" },
        { "type": "waitForSelector", "selector": "input[name='q']" },
        { "type": "click", "selector": "input[name='q']" },
        { "type": "type", "selector": "input[name='q']", "text": "coffee delivery near me" },
        { "type": "press", "key": "Enter" },
        { "type": "waitForSelector", "selector": "#search" },
        { "type": "waitForTimeout", "timeout": 2000 }
      ]
    };
  }
  
  if (lowerMessage.includes('shop') || lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
    return {
      message: "I'll help you find shopping options! Let me search for what you're looking for.",
      actions: [
        { "type": "goto", "url": "https://www.amazon.com" },
        { "type": "waitForSelector", "selector": "#twotabsearchtextbox" },
        { "type": "click", "selector": "#twotabsearchtextbox" },
        { "type": "type", "selector": "#twotabsearchtextbox", "text": userMessage },
        { "type": "press", "key": "Enter" },
        { "type": "waitForSelector", "selector": "[data-component-type='s-search-result']" }
      ]
    };
  }
  
  if (lowerMessage.includes('flight') || lowerMessage.includes('travel') || lowerMessage.includes('book')) {
    return {
      message: "I'll help you search for flights! Let me open a travel booking site.",
      actions: [
        { "type": "goto", "url": "https://www.google.com/travel/flights" },
        { "type": "waitForSelector", "selector": "input[placeholder*='Where from']" },
        { "type": "waitForTimeout", "timeout": 3000 }
      ]
    };
  }
  
  // Default fallback
  return {
    message: "I'll help you search for information about your request. Let me open Google and search for what you need.",
    actions: [
      { "type": "goto", "url": "https://www.google.com" },
      { "type": "waitForSelector", "selector": "input[name='q']" },
      { "type": "click", "selector": "input[name='q']" },
      { "type": "type", "selector": "input[name='q']", "text": userMessage },
      { "type": "press", "key": "Enter" },
      { "type": "waitForSelector", "selector": "#search" }
    ]
  };
}