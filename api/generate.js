export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Missing topic' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 60,
        messages: [{
          role: 'user',
          content: `Create a punny business name for: "${topic.trim()}". The name must be a playful twist on a well-known phrase, movie title, saying, or expression â€” swapping one word for something specific to this business type. Examples: "Dramatic Paws" (dramatic pause â†’ dog groomer), "Loaf Actually" (Love Actually â†’ bakery), "Fangs for the Memories" (Thanks for the Memories â†’ exotic animal vet), "Scoop There It Is" (Whoop There It Is â†’ ice cream shop), "Wheat it and Weep" (Wait and Weep â†’ gluten-free bakery). Be specific to ALL details given, not just the general category. Reply with just the name, nothing else.`
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: 'Upstream API error', detail: data });
    }

    const name = data.content?.[0]?.text?.trim() || '';
    return res.status(200).json({ name });

  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
