// Hair image generation using Lovable AI Gateway
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSeasonalClothing(isMale: boolean): string {
  const month = new Date().getMonth() + 1;
  if (isMale) {
    if (month >= 3 && month <= 5) return pickRandom(["light linen shirt", "thin cotton sweater over a collared shirt", "casual spring jacket with a t-shirt", "knit polo shirt", "denim jacket over a henley"]);
    if (month >= 6 && month <= 8) return pickRandom(["crisp white short-sleeve shirt", "breathable linen camp collar shirt", "casual cotton polo", "lightweight henley t-shirt", "relaxed fit crew neck tee"]);
    if (month >= 9 && month <= 11) return pickRandom(["wool crew-neck sweater", "layered flannel shirt", "corduroy jacket over a turtleneck", "knit cardigan over a shirt", "suede bomber jacket with a t-shirt"]);
    return pickRandom(["chunky knit turtleneck sweater", "wool overcoat over a button-up shirt", "cashmere crew-neck sweater", "padded vest over a hoodie", "heavy knit cable sweater"]);
  } else {
    if (month >= 3 && month <= 5) return pickRandom(["floral blouse", "light cardigan over a camisole", "pastel knit top", "denim jacket over a spring dress", "cotton wrap blouse"]);
    if (month >= 6 && month <= 8) return pickRandom(["off-shoulder blouse", "lightweight linen top", "airy cotton camisole with a light cardigan", "sleeveless knit top", "breezy floral top"]);
    if (month >= 9 && month <= 11) return pickRandom(["cozy knit sweater", "trench coat over a blouse", "turtleneck with a blazer", "chunky cardigan", "suede jacket over a fitted top"]);
    return pickRandom(["cashmere turtleneck", "wool coat over a knit dress", "faux fur collar coat over a blouse", "thick cable-knit sweater", "padded jacket with a scarf"]);
  }
}

const modelTraits = {
  male: {
    ages: ["early 20s", "mid 20s", "late 20s"],
    faces: ["round face shape", "oval face shape", "square jawline", "angular face with high cheekbones", "soft diamond-shaped face"],
    skins: ["fair skin", "light tan skin", "warm medium skin tone", "slightly tanned skin"],
    builds: ["slim build", "average build", "athletic muscular build", "broad-shouldered build"],
    vibes: ["calm relaxed expression", "confident sharp gaze", "friendly warm smile", "serious editorial expression", "playful youthful look"],
  },
  female: {
    ages: ["early 20s", "mid 20s", "late 20s"],
    faces: ["round soft face", "oval face shape", "heart-shaped face", "V-line jawline", "small delicate face with high cheekbones"],
    skins: ["porcelain fair skin", "light natural skin", "warm honey skin tone", "slightly tanned glowing skin"],
    builds: ["slim petite build", "average build", "tall slender build"],
    vibes: ["elegant poised expression", "cute bright smile", "chic cool gaze", "natural effortless look", "dreamy soft expression"],
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cleanBasePrompt(prompt: string): string {
  return prompt
    .replace(/studio lighting/gi, "natural warm lighting")
    .replace(/bright sheer curtain background/gi, "")
    .replace(/clean background/gi, "");
}

function buildVarietyPrompt(basePrompt: string, bgPrompt?: string): string {

const backgroundDesc = bgPrompt || "cozy stylish cafe atmosphere with warm ambient lighting";
  const cleaned = cleanBasePrompt(basePrompt);
  const lowerPrompt = cleaned.toLowerCase();
  const isFemale = lowerPrompt.includes("female") || lowerPrompt.includes("woman") || lowerPrompt.includes("여성");
  const isMale = !isFemale;
  const traits = isMale ? modelTraits.male : modelTraits.female;
  const age = pickRandom(traits.ages);
  const face = pickRandom(traits.faces);
  const skin = pickRandom(traits.skins);
  const build = pickRandom(traits.builds);
  const vibe = pickRandom(traits.vibes);
  const uniqueId = Math.random().toString(36).substring(2, 8);
  const clothing = getSeasonalClothing(isMale);

  const isWestern = lowerPrompt.includes("western") || lowerPrompt.includes("caucasian") || lowerPrompt.includes("foreign");
  const ethnicityDesc = isWestern ? "Western Caucasian" : "Korean";

  return `${cleaned}. IMPORTANT: Generate a UNIQUE and DISTINCTIVE person, NOT a generic model. The model is a ${ethnicityDesc} ${isMale ? "man" : "woman"} in their ${age}, with a ${face}, ${skin}, ${build}, and a ${vibe}. The person MUST be wearing a ${clothing}. NEVER generate a bare-shouldered or unclothed model. The background should be ${backgroundDesc}. FRAMING: Upper body close-up shot (chest and above), tightly framed to clearly showcase the hairstyle in detail. The hairstyle must be the focal point of the image. The pose should be natural and candid like an SNS Instagram photo, not stiff or overly posed. The outfit should be trendy and fashionable, looking stylish and well-coordinated. This person has unique individual features that make them look like a real specific person (model ID: ${uniqueId}). Do NOT reuse the same face from previous generations.`;
}

function extractImageUrl(choice: any): string | null {
  if (choice?.images?.[0]?.image_url?.url) return choice.images[0].image_url.url;
  if (!choice?.content) return null;
  if (Array.isArray(choice.content)) {
    const imgPart = choice.content.find((p: any) => p.type === "image_url" || p.type === "image");
    if (imgPart?.image_url?.url) return imgPart.image_url.url;
    if (imgPart?.url) return imgPart.url;
    return null;
  }
  if (typeof choice.content !== "string") return null;
  const content = choice.content;
  if (content.startsWith("data:image")) return content;
  const dataIdx = content.indexOf("data:image/");
  if (dataIdx !== -1) {
    const closeParen = content.indexOf(")", dataIdx);
    return closeParen !== -1 ? content.substring(dataIdx, closeParen) : content.substring(dataIdx).trim();
  }
  const urlMatch = content.match(/(https?:\/\/[^\s)]+\.(png|jpg|jpeg|webp)[^\s)]*)/i);
  return urlMatch ? urlMatch[1] : null;
}

async function uploadToStorage(supabase: any, imageDataUrl: string, timestamp: number, index: number): Promise<string> {
  const base64Match = imageDataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (base64Match) {
    const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
    const binaryData = Uint8Array.from(atob(base64Match[2]), c => c.charCodeAt(0));
    const filePath = `generated/${timestamp}_${index}.${ext}`;
    const { error } = await supabase.storage.from("hair-images").upload(filePath, binaryData, {
      contentType: `image/${base64Match[1]}`,
      upsert: true,
    });
    if (!error) {
      const { data: urlData } = supabase.storage.from("hair-images").getPublicUrl(filePath);
      return urlData.publicUrl;
    }
  }
  return imageDataUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, count = 1, referenceImage, copyrightText, backgroundPrompt } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const images: string[] = [];
    const timestamp = Date.now();

    const angleDescriptions = [
      "front view upper body close-up portrait, chest and above, clearly showing the hairstyle",
      "45 degree angle side view upper body close-up, chest and above, clearly showing the hairstyle from an angle",
      "complete side profile upper body close-up, chest and above, clearly showing the hairstyle silhouette",
      "back view upper body close-up showing full hairstyle from behind, head and shoulders",
    ];

    let currentReference = referenceImage || null;
    const copyrightInstruction = copyrightText
      ? ` Add a small, elegant copyright watermark text "${copyrightText}" at the bottom center of the image in a semi-transparent white font, like a professional photo watermark.`
      : '';

    for (let i = 0; i < Math.min(count, 4); i++) {
      let messages: any[];

      if (currentReference) {
        messages = [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: currentReference } },
              {
                type: "text",
                text: `This is a reference photo of a hair model. Generate the EXACT SAME person with the EXACT SAME hairstyle, hair color, face, and clothing, but now shown from a ${angleDescriptions[i]}. IMPORTANT: Frame as an upper body close-up (chest and above) to clearly showcase the hairstyle. The hairstyle must be the focal point. The person MUST be wearing appropriate clothing at all times. Keep the same background atmosphere. The pose should be natural and candid like an SNS photo. The person must look identical - same face shape, skin tone, hair texture, and style. Only the camera angle changes.${copyrightInstruction}`,
              },
            ],
          },
        ];
      } else {
        const bgDesc = backgroundPrompt || "cozy stylish cafe atmosphere with warm ambient lighting";
        const variedPrompt = buildVarietyPrompt(prompt, backgroundPrompt);
        messages = [
          {
            role: "user",
            content: `Generate a photorealistic hair model image: ${variedPrompt}. FRAMING: Upper body close-up (chest and above), tightly framed to clearly showcase the hairstyle. The image should look like a stylish SNS Instagram photo with ${bgDesc}. The pose should be natural and candid, not stiff. The outfit should be trendy and well-coordinated.${copyrightInstruction}`,
          },
        ];
      }

      let imageDataUrl: string | null = null;
      const maxRetries = 3;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ model: "google/gemini-2.5-flash-image", modalities: ["image", "text"], messages }),
          });

          if (!response.ok) {
            const status = response.status;
            const body = await response.text();
            console.error(`AI Gateway error (attempt ${attempt + 1}):`, status, body);
            if (status === 429) {
              return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
                status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
            if (attempt < maxRetries - 1) continue;
            return new Response(JSON.stringify({ error: "이미지 생성에 실패했습니다." }), {
              status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          const data = await response.json();
          imageDataUrl = extractImageUrl(data.choices?.[0]?.message);

          if (imageDataUrl) break;
          console.error(`No image extracted (attempt ${attempt + 1}):`, JSON.stringify(data).slice(0, 500));
        } catch (fetchErr) {
          console.error(`Fetch error (attempt ${attempt + 1}):`, fetchErr);
          if (attempt >= maxRetries - 1) break;
        }
      }

      if (imageDataUrl) {
        if (!currentReference) currentReference = imageDataUrl;
        try {
          const finalUrl = await uploadToStorage(supabase, imageDataUrl, timestamp, i);
          images.push(finalUrl);
        } catch (uploadErr) {
          console.error("Storage upload failed:", uploadErr);
          images.push(imageDataUrl);
        }
      } else {
        console.error("Failed to extract image after all retries for angle", i);
      }
    }

    if (images.length === 0) {
      return new Response(JSON.stringify({ error: "이미지를 생성할 수 없습니다." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ images }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-hair-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
