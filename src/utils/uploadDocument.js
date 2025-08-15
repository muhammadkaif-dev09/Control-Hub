import { supabase } from "@/supabase/createClient";

export async function uploadDocument(
  userId,
  documentType,
  frontFile,
  backFile,
  documentName,
  uploadDate,
  note
) {
  try {
    if (!userId) return { success: false, error: "User ID is missing." };
    if (!frontFile && !backFile)
      return {
        success: false,
        error: "At least one document file (front or back) is required.",
      };

    const timestamp = Date.now();
    let frontUrl = null;
    let backUrl = null;

    // ✅ Upload front file (if exists)
    if (frontFile) {
      const frontPath = `${userId}/${documentType}/${timestamp}_front_${frontFile.name.replace(
        /\s+/g,
        "_"
      )}`;
      const { error: frontErr } = await supabase.storage
        .from("dummy-data")
        .upload(frontPath, frontFile, { upsert: true });
      if (frontErr) return { success: false, error: frontErr.message };

      const { data: frontUrlData } = supabase.storage
        .from("dummy-data")
        .getPublicUrl(frontPath);
      frontUrl = frontUrlData.publicUrl;
    }

    // ✅ Upload back file (if exists)
    if (backFile) {
      const backPath = `${userId}/${documentType}/${timestamp}_back_${backFile.name.replace(
        /\s+/g,
        "_"
      )}`;
      const { error: backErr } = await supabase.storage
        .from("dummy-data")
        .upload(backPath, backFile, { upsert: true });
      if (backErr) return { success: false, error: backErr.message };

      const { data: backUrlData } = supabase.storage
        .from("dummy-data")
        .getPublicUrl(backPath);
      backUrl = backUrlData.publicUrl;
    }

    // ✅ Call Edge Function
    const { data: session } = await supabase.auth.getSession();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/hyper-service`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          document_name: documentName,
          document_type: documentType,
          front_file_url: frontUrl,
          back_file_url: backUrl,
          upload_date: uploadDate,
          caption: note,
        }),
      }
    );

    return await response.json();
  } catch (err) {
    console.error("UploadDocument Error:", err);
    return { success: false, error: "Unexpected error occurred." };
  }
}
