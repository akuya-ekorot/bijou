import { supabase } from "../supabase/client";

export const upload = async (images: FileList) => {
  const urls: Array<string> = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    const { data: uploadData, error } = await supabase.storage
      .from("shops")
      .upload(`shops/images/${Date.now()}-${image.name}`, image);

    if (error) {
      return { error: [error.message], data: null };
    }

    const url = supabase.storage.from("shops").getPublicUrl(uploadData.path)
      .data.publicUrl;

    urls.push(url);
  }

  return { error: null, data: { urls } };
};
