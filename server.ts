import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON with generous limit for base64 images
  app.use(express.json({ limit: "50mb" }));

  // API Route: health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Generate reminder
  app.post("/api/generate-reminder", async (req, res) => {
    try {
      const { client, typeRappel } = req.body;
      if (!client) {
        return res.status(400).json({ error: "Données de la cliente manquantes" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY non configurée sur le serveur" });
      }
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        Tu es l'assistant virtuel de "Maison Zeyna", une boutique de location de robes traditionnelles algériennes de prestige.
        Génère un message chaleureux, poli et professionnel destiné à être envoyé sur WhatsApp.
        
        Données de la cliente :
        - Nom : ${client.nom}
        - Ville : ${client.ville || 'Non spécifiée'}
        - Robe louée : ${client.robe}
        - Note dossier : ${client.note || 'Pas de note particulière'} (Prends en compte cette information pour personnaliser le message)
        - Dates : du ${client.dateDebut} au ${client.dateFin}
        - Reste à payer : ${client.resteAPayer} DA

        Type de message attendu : ${typeRappel === 'confirmation' ? 'Confirmation de contrat' : 'Rappel pour le retour de la robe'}

        CONSIGNES DE RÉDACTION :
        1. Utilise un ton accueillant, digne d'une grande maison de couture algérienne (élégant, chaleureux et raffiné).
        2. Si c'est une confirmation, félicite-la chaleureusement pour son événement à venir mentionné dans la note (mariage, fiançailles, fête, etc.).
        3. Si c'est un rappel de retour, rappelle-lui gentiment la date limite et le montant restant à solder sans être agressif, avec bienveillance.
        4. Reste concis (adapté pour une lecture rapide sur smartphone/WhatsApp). Ne mets pas de titres ou de métadonnées, juste le corps du message WhatsApp directement copiable, avec quelques émojis appropriés de manière raffinée.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Erreur generation rappel:", error);
      res.status(500).json({ error: error.message || "Erreur interne du serveur lors de la génération" });
    }
  });

  // API Route: Analyze dress photo
  app.post("/api/analyze-dress", async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      if (!image || !mimeType) {
        return res.status(400).json({ error: "Données d'image manquantes (image base64 et mimeType requis)" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY non configurée sur le serveur" });
      }
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        Tu es l'expert de mode et conservateur de catalogue de "Maison Zeyna", une boutique prestigieuse de location de tenues traditionnelles algériennes.
        Analyse l'image de cette tenue traditionnelle algérienne et génère une fiche produit structurée au format JSON.
        
        Identifie :
        1. Le "typeRobe" : Choisis STRICTEMENT parmi l'une de ces valeurs : "Karakou", "Caftan", "Chedda", "Robe Kabyle", "Robe Chaouie", "Blousa Oranaise", "Robe de Mariée", "Autre".
        2. Le "couleurs" : Une description très courte des couleurs et ornements visibles (ex: "Velours Rouge Bordeaux & Broderies Or", "Vert Émeraude & Perlage").
        3. Le "description" : Une description élégante, valorisante et poétique de la robe, mettant en avant les broderies, les détails du tissu, les ornements traditionnels algériens (Karakou algérois, majboud, fetla, chaabia, perlage, velours royal, etc.). Reste concis (environ 2-3 phrases) et digne d'une grande maison.
        4. Le "size" : Une estimation ou suggestion de taille si visible, sinon renvoie "38".
        5. Le "rentalPrice" : Un prix de location estimé cohérent pour ce type de pièce en boutique de prestige en Algérie (un nombre entre 8000 et 35000, exprimé en Dinars Algériens. Suggère par exemple 15000 si c'est un Karakou de prestige).
        6. Le "deposit" : Un montant de caution cohérent (généralement entre 5000 et 15000 DA, souvent environ 50% du prix de location).

        Réponds STRICTEMENT au format JSON suivant :
        {
          "typeRobe": "Karakou" | "Caftan" | "Chedda" | "Robe Kabyle" | "Robe Chaouie" | "Blousa Oranaise" | "Robe de Mariée" | "Autre",
          "couleurs": "description courte des couleurs et tissus",
          "description": "description poétique et vendeuse",
          "size": "38",
          "rentalPrice": 15000,
          "deposit": 5000
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: image,
              mimeType: mimeType
            }
          },
          prompt
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const resultText = response.text || "{}";
      const resultJson = JSON.parse(resultText);
      res.json(resultJson);
    } catch (error: any) {
      console.error("Erreur analyse robe:", error);
      res.status(500).json({ error: error.message || "Erreur interne du serveur lors de l'analyse" });
    }
  });

  // API Route: Analyze jewelry photo
  app.post("/api/analyze-jewelry", async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      if (!image || !mimeType) {
        return res.status(400).json({ error: "Données d'image manquantes" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY non configurée sur le serveur" });
      }
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        Tu es l'expert de joaillerie et conservateur de catalogue de "Maison Zeyna", une boutique prestigieuse de tenues et d'accessoires de joaillerie traditionnelle algérienne.
        Analyse l'image de cet accessoire ou bijou traditionnel algérien et génère une fiche produit structurée au format JSON.
        
        Identifie :
        1. Le "typeBijou" : Choisis STRICTEMENT parmi l'une de ces valeurs : "Parure", "Diadème", "Collier", "Bracelet", "Boucles d'oreilles", "Ceinture", "Autre".
        2. Le "color" : Les couleurs des métaux et des pierres visibles (ex: "Argent ciselé & Corail rouge", "Plaqué or & Émeraude d'imitation").
        3. Le "description" : Une description élégante, valorisante et poétique du bijou, mettant en avant les motifs, le travail de l'émail, la finesse des perles ou du métal ciselé (ex: Khabcha, maddama, perlage Louiza, etc.). Reste concis (environ 2-3 phrases).
        4. Le "rentalPrice" : Un prix de location cohérent (un nombre entre 2000 et 10000, exprimé en Dinars Algériens).
        5. Le "deposit" : Un montant de caution cohérent (généralement entre 2000 et 8000 DA, environ 50% à 100% du prix de location).

        Réponds STRICTEMENT au format JSON suivant :
        {
          "typeBijou": "Parure" | "Diadème" | "Collier" | "Bracelet" | "Boucles d'oreilles" | "Ceinture" | "Autre",
          "color": "description courte des métaux et pierres",
          "description": "description poétique et vendeuse",
          "rentalPrice": 5000,
          "deposit": 3000
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: image,
              mimeType: mimeType
            }
          },
          prompt
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const resultText = response.text || "{}";
      const resultJson = JSON.parse(resultText);
      res.json(resultJson);
    } catch (error: any) {
      console.error("Erreur analyse bijou:", error);
      res.status(500).json({ error: error.message || "Erreur interne du serveur lors de l'analyse" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
