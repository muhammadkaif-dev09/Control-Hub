"use client";

import UserLayout from "@/components/UserLayout";
import React, { useState, useEffect } from "react";
import { Eye, AlertCircle, Trash2, Loader2, Edit } from "lucide-react";
import DocumentDetailsModal from "@/components/DocumentDetailsModal";
import { useUser } from "@/context/UserProvider";
import { supabase } from "@/supabase/createClient";
import { AuthProvider } from "@/context/AuthContext";
import UpdateDocumentModal from "@/components/UpdateDocumentModel";

const ViewUserDocument = () => {
  const [documents, setDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showRejectionNoteId, setShowRejectionNoteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [editDoc, setEditDoc] = useState(null);
  const { user } = useUser();

  // Fetch documents function, reusable for refresh
  const fetchUserDocuments = async () => {
    if (!user?.id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select(
        `
      id,
      document_name,
      document_type,
      front_file_url,
      back_file_url,
      upload_date,
      status,
      rejection_note,
      caption,
      user_profiles(full_name)
    `
      )
      .eq("user_id", user.id)
      .order("upload_date", { ascending: false });

    if (error) {
      console.error("Error fetching user's documents:", error.message);
      setLoading(false);
      return;
    }

    const transformedDocs = data.map((doc) => ({
      id: doc.id,
      uploader_name: doc.user_profiles?.full_name || "Unknown",
      document_name: doc.document_name,
      document_type: doc.document_type,
      upload_date: doc.upload_date,
      status: doc.status,
      rejection_note: doc.rejection_note,
      caption: doc.caption,
      files: [
        {
          name: doc.front_file_url?.split("/").pop() || "Front File",
          url: doc.front_file_url,
          caption: "Front side document",
        },
        ...(doc.back_file_url
          ? [
              {
                name: doc.back_file_url.split("/").pop() || "Back File",
                url: doc.back_file_url,
                caption: "Back side document",
              },
            ]
          : []),
      ],
    }));

    setDocuments(transformedDocs);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserDocuments();
  }, [user]);

  const handleDeleteDocument = async (docId) => {
    setDeletingDocId(docId);
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", docId);

      if (error) {
        alert("Failed to delete document");
        return;
      }
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err) {
      alert("Error deleting document");
    } finally {
      setDeletingDocId(null);
    }
  };

  return (
    <AuthProvider>
      <UserLayout>
        <h1 className="text-3xl font-semibold text-gray-800 mb-1">
          Uploaded Documents
        </h1>
        <p className="text-gray-500 mb-6">
          Manage your uploaded documents below
        </p>

        <div className="bg-white p-6 rounded-md shadow-md">
          {loading ? (
            <p className="text-gray-600">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 w-16">S.No.</th>
                  <th className="text-left p-2">Document Name</th>
                  <th className="text-left p-2">Uploader</th>
                  <th className="text-left p-2">Upload Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, idx) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{doc.document_name}</td>
                    <td className="p-2">{doc.uploader_name}</td>
                    <td className="p-2">
                      {new Date(doc.upload_date).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {doc.status === "Approved" && (
                        <span className="text-green-600 font-semibold">
                          Approved
                        </span>
                      )}
                      {doc.status === "Pending" && (
                        <span className="text-yellow-600 font-semibold">
                          Pending
                        </span>
                      )}
                      {doc.status === "Rejected" && (
                        <span className="text-red-600 font-semibold">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-2 space-x-3 flex items-center">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        title="View Document"
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        type="button"
                      >
                        <Eye size={20} />
                      </button>

                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete Document"
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        type="button"
                      >
                        {deletingDocId === doc.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </button>

                      {doc.status === "Rejected" && doc.rejection_note && (
                        <button
                          onClick={() => setShowRejectionNoteId(doc.id)}
                          title="View Rejection Note"
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          type="button"
                        >
                          <AlertCircle size={20} />
                        </button>
                      )}

                      {doc.status === "Rejected" && (
                        <button
                          onClick={() => setEditDoc(doc)}
                          title="Update Document"
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          type="button"
                        >
                          <Edit size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Document Preview Modal */}
          {previewDoc && (
            <DocumentDetailsModal
              isOpen={!!previewDoc}
              onClose={() => setPreviewDoc(null)}
              document={previewDoc}
            />
          )}

          {/* Rejection Note Modal */}
          {showRejectionNoteId && (
            <div
              className="fixed inset-0 bg-[#000000cc] bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowRejectionNoteId(null)}
            >
              <div
                className="bg-white p-6 rounded-md max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-semibold mb-4">Rejection Note</h3>
                <p>
                  {
                    documents.find((doc) => doc.id === showRejectionNoteId)
                      ?.rejection_note
                  }
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setShowRejectionNoteId(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Update Document Modal */}
          {editDoc && (
            <UpdateDocumentModal
              isOpen={!!editDoc}
              onClose={() => setEditDoc(null)}
              documentData={editDoc}
              onUpdate={fetchUserDocuments}
              userId={user?.id}
            />
          )}
        </div>
      </UserLayout>
    </AuthProvider>
  );
};

export default ViewUserDocument;
