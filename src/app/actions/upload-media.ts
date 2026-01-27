"use server";

import { supabase } from "@/lib/supabase";
import { PHOTOS_BUCKET } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function uploadMedia(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            throw new Error("Nenhum arquivo enviado");
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const buffer = await file.arrayBuffer();

        const { data, error } = await supabase.storage
            .from(PHOTOS_BUCKET)
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false
            });

        if (error) {
            throw new Error(error.message);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(PHOTOS_BUCKET)
            .getPublicUrl(filePath);

        return { success: true, url: publicUrl };

    } catch (error: any) {
        console.error("Upload Error:", error);
        return { success: false, error: error.message || "Erro ao fazer upload" };
    }
}
