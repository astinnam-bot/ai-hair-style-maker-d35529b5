import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { styleId, styleName, prompt, forceRegenerate } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!styleId || !prompt) {
      return new Response(JSON.stringify({ error: "styleId and prompt are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if thumbnail already exists (skip if forceRegenerate)
    const filePath = `thumbnails/${styleId}.jpg`;
    if (!forceRegenerate) {
      const { data: existing } = await supabase.storage.from("hair-images").list("thumbnails", {
        search: `${styleId}.jpg`,
      });

      if (existing && existing.length > 0) {
        const { data: urlData } = supabase.storage.from("hair-images").getPublicUrl(filePath);
        return new Response(JSON.stringify({ url: urlData.publicUrl, cached: true }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate thumbnail image with retry and fallback
    let imageUrl: string | null = null;
    const maxRetries = 3;

    // Clean prompt: remove contradictory instructions
    const cleanPrompt = prompt
      .replace(/studio lighting/gi, 'natural lighting')
      .replace(/clean background/gi, '');

    const prompts = [
      `Generate an image of a hair model: ${cleanPrompt}. Show only the head and upper shoulders, focused on the hairstyle. Photorealistic, high quality.`,
      `Create a photo of a Korean hair model: ${cleanPrompt}. Portrait photo, head and shoulders only.`,
      `Hair model portrait photo: ${cleanPrompt}. Photorealistic.`,
    ];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash-image",
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: prompts[attempt] || prompts[prompts.length - 1],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`CometAPI error (attempt ${attempt + 1}):`, response.status, errText);
        if (attempt === maxRetries - 1) {
          return new Response(JSON.stringify({ error: "이미지 생성 실패" }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        continue;
      }

      const data = await response.json();
      imageUrl = extractImageUrl(data.choices?.[0]?.message);

      if (imageUrl) break;
      console.error(`No image extracted (attempt ${attempt + 1}):`, JSON.stringify(data).slice(0, 300));
    }

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "이미지를 추출할 수 없습니다." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upload to storage
    const base64Match = imageUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (base64Match) {
      const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
      const binaryData = Uint8Array.from(atob(base64Match[2]), c => c.charCodeAt(0));
      const uploadPath = `thumbnails/${styleId}.${ext === "jpg" ? "jpg" : ext}`;
      const { error: uploadError } = await supabase.storage.from("hair-images").upload(uploadPath, binaryData, {
        contentType: `image/${base64Match[1]}`,
        upsert: true,
      });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(JSON.stringify({ error: "업로드 실패" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: publicUrlData } = supabase.storage.from("hair-images").getPublicUrl(uploadPath);
      return new Response(JSON.stringify({ url: publicUrlData.publicUrl, cached: false }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If not base64, return the URL directly
    return new Response(JSON.stringify({ url: imageUrl, cached: false }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-thumbnails error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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
    return closeParen !== -1 ? content.substring(dataIdx, closeParen) : content.substring(dataIdx).trim();
  }
  const urlMatch = content.match(/(https?:\/\/[^\s)]+\.(png|jpg|jpeg|webp)[^\s)]*)/i);
  return urlMatch ? urlMatch[1] : null;
}
