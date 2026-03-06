import { supabase } from "@/integrations/supabase/client";

export async function generateHairImage(prompt: string, count: number = 1): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke("generate-hair-image", {
    body: { prompt, count },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "이미지 생성에 실패했습니다.");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.images as string[];
}
