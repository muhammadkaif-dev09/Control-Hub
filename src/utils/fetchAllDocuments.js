import { supabase } from "@/supabase/createClient";

export const fetchAllDocuments = async () => {
  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      user_profiles (
        full_name
      )
    `
    )
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("Error fetching all documents:", error.message);
    return [];
  }

  return data.map((doc) => {
    // Build files array
    const files = [];
    if (doc.front_file_url) {
      files.push({
        name: doc.front_file_url.split("/").pop(),
        url: doc.front_file_url,
        caption: "Front side document",
      });
    }
    if (doc.back_file_url) {
      files.push({
        name: doc.back_file_url.split("/").pop(),
        url: doc.back_file_url,
        caption: "Back side document",
      });
    }

    return {
      id: doc.id,
      document_name: doc.document_name,
      document_type: doc.document_type,
      upload_date: doc.upload_date,
      status: doc.status,
      owner_name: doc.user_profiles?.full_name || "Unknown",
      caption: doc.caption,
      rejection_note: doc.rejection_note,
      files,
    };
  });
};
