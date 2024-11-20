import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  if (!process.env.GEMINI_API_KEY) {
    console.log('API key missing');
    return Response.json(
      { error: "API key is not configured" },
      { status: 500 }
    );
  }

  try {
    console.log('API route hit, initializing Gemini...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Create a historical analysis of the Russia - Ukraine  War in 4 distinct points.

Format requirements:
1. Structure each point as follows:
   [Timeline Period]: [Historical Event Description]
   Example format: "1947-1948: The UN Partition Plan led to..."

2. Content guidelines:
   - Start each point with a clear date or time period
   - Keep descriptions under 25 words
   - Focus on key historical events and their immediate impacts
   - Maintain neutral, factual tone

3. Output format:
   - Present as plain text without any special characters or formatting
   - Separate points with line breaks
   - No bullet points or numbering needed

Please provide 4 chronological points following these guidelines.`;
    
    
    console.log('Generating content...');
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    
    console.log('Content generated successfully');
    return Response.json({ analysis: text });
    
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}