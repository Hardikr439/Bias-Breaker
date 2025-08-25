import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request) {
  if (!process.env.GEMINI_API_KEY) {
    console.log('API key missing');
    return Response.json(
      { error: "API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return Response.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    console.log('API route hit, initializing Gemini...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a historical analysis of ${query} news in detail.

Format requirements:
1. Structure each point as follows:
   [Timeline Period]: [Historical Event Description]
   Example format: "1947-1948: The UN Partition Plan led to..."

2. Content guidelines:
   - Start each point with a clear date or time period
   - Focus on key historical events and their immediate impacts and build up to the present
   - Use clear, concise language
   - Maintain neutral, factual tone

3. Output format:
   - Present as plain text without any special characters or formatting
   - Separate points with line breaks
   - No bullet points or numbering needed`;

    console.log('Generating content for:', query);
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