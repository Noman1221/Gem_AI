import "dotenv/config";

export async function getGemeniResponse(prompt) {

  const API_KEY = process.env.GEMINI_API_KEY;
  console.log(API_KEY);
  if (!API_KEY) {
    console.error("❌ API key not found. Please set the GEMINI_API_KEY environment variable.");
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`❌ API request failed with status: ${response.status}`);
      const errorData = await response.text();
      console.error("Response:", errorData);
      return null;
    }

    const data = await response.json();

    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response text found.";

    return generatedText.trim();
  } catch (error) {
    console.error("❌ Error while fetching Gemini response:", error.message);
    return null;
  }
}
