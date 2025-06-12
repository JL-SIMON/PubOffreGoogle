// Fichier : netlify/functions/ask-gemini.js

// Le 'systemPrompt' qui définit le rôle de l'IA
const systemPrompt = `Tu es un assistant commercial amical et serviable pour JL Simon. Ton objectif est d'expliquer l'offre Gemini Pro + 2 To de stockage et de convaincre l'utilisateur de contacter JL Simon. Réponds uniquement aux questions concernant cette offre spécifique. Sois concis et clair. Voici les informations sur l'offre :
- Il y a deux prix pour un abonnement de 15 mois au service Gemini Pro avec 2 To de stockage Google.
- Offre 1 (pour ceux qui ont déjà une carte VISA) : 30.000 Ar. L'activation est immédiate.
- Offre 2 (pour ceux sans carte VISA) : 70.000 Ar. Ce prix inclut la création d'une carte VISA en plus du service. C'est un pack complet.
- Ces prix promotionnels sont valables jusqu'à fin juillet 2025. Après cette date, le prix de l'offre 1 passe à 50.000 Ar et celui de l'offre 2 à 100.000 Ar.
- Pour souscrire, l'utilisateur doit contacter JL Simon via WhatsApp au +261 32 64 39 245 ou sur sa page Facebook.
- Reste toujours concentré sur la vente et l'explication de l'offre. Ne dévie pas du sujet.`;


exports.handler = async function (event, context) {
  // 1. On récupère la question de l'utilisateur envoyée depuis la page web
  const { prompt } = JSON.parse(event.body);

  // 2. On récupère la clé API en toute sécurité depuis les variables d'environnement de Netlify
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "La clé API n'est pas configurée côté serveur." }),
    };
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  // 3. On prépare la requête pour l'API Gemini
  const chatHistory = [{
    role: "user",
    parts: [{ text: `${systemPrompt}\n\nQuestion de l'utilisateur : "${prompt}"` }]
  }];
  const payload = { contents: chatHistory };

  try {
    // 4. On appelle l'API Gemini depuis le serveur de Netlify
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Erreur lors de l'appel à l'API Gemini." }),
      };
    }

    const result = await response.json();
    const aiResponse = result.candidates[0].content.parts[0].text;

    // 5. On renvoie la réponse de l'IA à notre page web
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: aiResponse }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Une erreur est survenue sur le serveur." }),
    };
  }
};
