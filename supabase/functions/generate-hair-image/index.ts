import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Variety traits to randomize model appearance
const modelTraits = {
  male: {
    ages: ["20대 초반", "20대 중반", "20대 후반", "30대 초반", "30대 중반"],
    faces: ["둥근 얼굴형", "갸름한 얼굴형", "각진 얼굴형", "타원형 얼굴형"],
    builds: ["슬림한 체형", "보통 체형", "건장한 체형"],
  },
  female: {
    ages: ["20대 초반", "20대 중반", "20대 후반", "30대 초반", "30대 중반"],
    faces: ["둥근 얼굴형", "갸름한 얼굴형", "하트형 얼굴형", "타원형 얼굴형"],
    builds: ["슬림한 체형", "보통 체형"],
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildVarietyPrompt(basePrompt: string): string {
  const isMale = basePrompt.toLowerCase().includes("male");
  const traits = isMale ? modelTraits.male : modelTraits.female;
  const age = pickRandom(traits.ages);
  const face = pickRandom(traits.faces);
  const build = pickRandom(traits.builds);
  return `${basePrompt}. The model is a Korean ${isMale ? "man" : "woman"} in their ${age} with ${face} and ${build}. Unique distinctive facial features.`;
}

function extractImageUrl(choice: any): string | null {
  if (choice?.images?.[0]?.image_url?.url) {
    return choice.images[0].image_url.url;
  }
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
    return closeParen !== -1
      ? content.substring(dataIdx, closeParen)
      : content.substring(dataIdx).trim();
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
    const { prompt, count = 1, referenceImage } = await req.json();

    const COMET_API_KEY = Deno.env.get("COMET_API_KEY");
    if (!COMET_API_KEY) throw new Error("COMET_API_KEY is not configured");

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
      "front view portrait",
      "45 degree angle side view",
      "complete side profile view",
      "back view long shot showing full hairstyle from behind",
    ];

    // If referenceImage is provided (from preview), use it for all 4 angles
    // Otherwise generate first image with variety, then use it as reference
    let currentReference = referenceImage || null;

    for (let i = 0; i < Math.min(count, 4); i++) {
      let messages: any[];

      if (currentReference) {
        // Use reference image for consistent person across angles
        messages = [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: currentReference } },
              {
                type: "text",
                text: `This is a reference photo of a hair model. Generate the EXACT SAME person with the EXACT SAME hairstyle, hair color, face, and clothing, but now shown from a ${angleDescriptions[i]}. Keep the same studio lighting and clean background. The person must look identical - same face shape, skin tone, hair texture, and style. Only the camera angle changes to ${angleDescriptions[i]}.`,
              },
            ],
          },
        ];
      } else {
        // First image with randomized model variety
        const variedPrompt = buildVarietyPrompt(prompt);
        messages = [
          {
            role: "user",
            content: `Generate a photorealistic hair model image: ${variedPrompt}. The image should look like a professional salon hair catalog photo with studio lighting and clean background.`,
          },
        ];
      }

      const response = await fetch("https://api.cometapi.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${COMET_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "gemini-2.5-flash-image", messages }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "크레딧이 부족합니다." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.error("CometAPI error:", status, await response.text());
        return new Response(JSON.stringify({ error: "이미지 생성에 실패했습니다." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const imageDataUrl = extractImageUrl(data.choices?.[0]?.message);

      if (imageDataUrl) {
        // Set as reference for subsequent images if this is the first
        if (!currentReference) currentReference = imageDataUrl;

        try {
          const finalUrl = await uploadToStorage(supabase, imageDataUrl, timestamp, i);
          images.push(finalUrl);
        } catch (uploadErr) {
          console.error("Storage upload failed:", uploadErr);
          images.push(imageDataUrl);
        }
      } else {
        console.error("No image in CometAPI response:", JSON.stringify(data).slice(0, 500));
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
