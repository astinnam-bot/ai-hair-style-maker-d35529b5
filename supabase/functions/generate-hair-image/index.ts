import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, count = 1 } = await req.json();

    const COMET_API_KEY = Deno.env.get("COMET_API_KEY");
    if (!COMET_API_KEY) throw new Error("COMET_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const images: string[] = [];
    const timestamp = Date.now();
    let referenceImageUrl: string | null = null;

    const angleDescriptions = [
      "front view portrait",
      "45 degree angle side view",
      "complete side profile view",
      "back view long shot showing full hairstyle from behind",
    ];

    for (let i = 0; i < Math.min(count, 4); i++) {
      let messages: any[];

      if (i === 0 || !referenceImageUrl) {
        messages = [
          {
            role: "user",
            content: `Generate a photorealistic hair model image: ${prompt}. The image should look like a professional salon hair catalog photo with studio lighting and clean background.`,
          },
        ];
      } else {
        messages = [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: referenceImageUrl },
              },
              {
                type: "text",
                text: `This is a reference photo of a hair model. Generate the EXACT SAME person with the EXACT SAME hairstyle, hair color, face, and clothing, but now shown from a ${angleDescriptions[i]}. Keep the same studio lighting and clean background. The person must look identical - same face shape, skin tone, hair texture, and style. Only the camera angle changes to ${angleDescriptions[i]}.`,
              },
            ],
          },
        ];
      }

      const response = await fetch("https://api.cometapi.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${COMET_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash-image",
          messages,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "크레딧이 부족합니다." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("CometAPI error:", response.status, errorText);
        return new Response(JSON.stringify({ error: "이미지 생성에 실패했습니다." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      
      // CometAPI gpt-image-1 returns images in choices[0].message.content as base64 or URL
      const choice = data.choices?.[0]?.message;
      let imageDataUrl: string | null = null;

      // Handle different response formats
      if (choice?.images?.[0]?.image_url?.url) {
        imageDataUrl = choice.images[0].image_url.url;
      } else if (choice?.content) {
        // gpt-image-1 may return content as array with image_url type
        if (Array.isArray(choice.content)) {
          const imgPart = choice.content.find((p: any) => p.type === "image_url" || p.type === "image");
          if (imgPart?.image_url?.url) {
            imageDataUrl = imgPart.image_url.url;
          } else if (imgPart?.url) {
            imageDataUrl = imgPart.url;
          }
        } else if (typeof choice.content === "string" && choice.content.startsWith("data:image")) {
          imageDataUrl = choice.content;
        }
      }

      if (imageDataUrl) {
        if (i === 0) {
          referenceImageUrl = imageDataUrl;
        }
        // Upload to storage
        try {
          const base64Match = imageDataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
          if (base64Match) {
            const ext = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
            const base64Data = base64Match[2];
            const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            const filePath = `generated/${timestamp}_${i}.${ext}`;

            const { error: uploadError } = await supabase.storage
              .from("hair-images")
              .upload(filePath, binaryData, {
                contentType: `image/${base64Match[1]}`,
                upsert: true,
              });

            if (uploadError) {
              console.error("Upload error:", uploadError);
              images.push(imageDataUrl);
            } else {
              const { data: urlData } = supabase.storage
                .from("hair-images")
                .getPublicUrl(filePath);
              images.push(urlData.publicUrl);
            }
          } else if (imageDataUrl.startsWith("http")) {
            // If CometAPI returns a URL directly, use it
            images.push(imageDataUrl);
            if (i === 0) referenceImageUrl = imageDataUrl;
          } else {
            images.push(imageDataUrl);
          }
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
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
