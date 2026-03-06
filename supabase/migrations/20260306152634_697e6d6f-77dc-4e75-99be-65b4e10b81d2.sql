-- Create storage bucket for hair images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hair-images', 'hair-images', true);

-- Allow public read access
CREATE POLICY "Public read access for hair images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hair-images');

-- Allow anonymous uploads (from edge functions via service role, but also anon)
CREATE POLICY "Allow uploads to hair images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'hair-images');