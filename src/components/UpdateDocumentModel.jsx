"use client";

import { supabase } from "@/supabase/createClient";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

export default function UpdateDocumentModal({
  isOpen,
  onClose,
  documentData,
  onUpdate,
  userId,
}) {
  const [documentName, setDocumentName] = useState("");
  const [uploadDate, setUploadDate] = useState("");
  const [documentType, setDocumentType] = useState(null);
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // Document options list
  const documentOptions = [
    { value: "aadhar_card", label: "Aadhaar Card" },
    { value: "affidavit", label: "Affidavit" },
    {
      value: "bank_account_passbook",
      label: "Bank Account Passbook/Statement (with address)",
    },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "birth_certificate", label: "Birth Certificate" },
    { value: "court_decree", label: "Court Decrees/Judgments" },
    { value: "degree_certificate", label: "Degree Certificates" },
    { value: "death_certificate", label: "Death Certificate" },
    { value: "disability_certificate", label: "Disability Certificate" },
    { value: "driver_license", label: "Driving Licence" },
    { value: "employer_letter", label: "Employer Letter" },
    { value: "encumbrance_certificate", label: "Encumbrance Certificate (EC)" },
    { value: "form_16", label: "Form 16" },
    { value: "govt_employee_id", label: "Government Employee ID Card" },
    { value: "health_insurance_policy", label: "Health Insurance Policy" },
    { value: "income_tax_return", label: "Income Tax Return (ITR)" },
    {
      value: "insurance_papers",
      label: "Insurance Papers (Property or Vehicle)",
    },
    {
      value: "investment_proofs",
      label: "Investment Proofs (FD, Mutual Funds, Shares)",
    },
    { value: "land_records", label: "Land Records/Patta/Chitta" },
    { value: "mark_sheets", label: "Mark Sheets" },
    { value: "marriage_certificate", label: "Marriage Certificate" },
    { value: "medical_reports", label: "Medical Reports" },
    { value: "mutation_certificate", label: "Mutation/Khata Certificate" },
    { value: "pan_card", label: "PAN Card" },
    { value: "passport", label: "Passport" },
    {
      value: "puc_certificate",
      label: "Pollution Under Control (PUC) Certificate",
    },
    { value: "power_of_attorney", label: "Power of Attorney" },
    {
      value: "property_registration_certificate",
      label: "Property Registration Certificate",
    },
    { value: "property_sale_deed", label: "Property Sale Deed" },
    { value: "property_tax_receipt", label: "Property Tax Receipt" },
    { value: "ration_card", label: "Ration Card" },
    { value: "rent_agreement", label: "Rent Agreement (registered)" },
    { value: "salary_slip", label: "Salary Slip" },
    {
      value: "utility_bills",
      label: "Utility Bills (Electricity, Water, Gas, Landline)",
    },
    { value: "vaccination_certificate", label: "Vaccination Certificate" },
    {
      value: "vehicle_registration_certificate",
      label: "Vehicle Registration Certificate (RC)",
    },
    { value: "voter_id", label: "Voter ID (EPIC Card)" },
    { value: "will_testament", label: "Will/Testament" },
  ];

  // Update document function (calls reupload edge function)
  async function updateDocument(
    documentId,
    userId,
    documentType,
    frontFile,
    backFile,
    documentName,
    uploadDate,
    note
  ) {
    // Helper to upload file to Supabase Storage and get public URL
    async function uploadFileToStorage(file, path) {
      if (!file) return null;
      const { data, error } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(path);
      return urlData.publicUrl;
    }

    let frontFileUrl = null;
    let backFileUrl = null;

    // Only upload if new files are selected
    if (frontFile) {
      const path = `user_${userId}/${documentId}_front_${Date.now()}_${frontFile.name}`;
      frontFileUrl = await uploadFileToStorage(frontFile, path);
    }
    if (backFile) {
      const path = `user_${userId}/${documentId}_back_${Date.now()}_${backFile.name}`;
      backFileUrl = await uploadFileToStorage(backFile, path);
    }

    // If no new files, keep old URLs
    if (!frontFileUrl && documentData?.files?.[0]?.url) {
      frontFileUrl = documentData.files[0].url;
    }
    if (!backFileUrl && documentData?.files?.[1]?.url) {
      backFileUrl = documentData.files[1].url;
    }

    const payload = {
      id: documentId,
      user_id: userId,
      document_name: documentName,
      document_type: documentType,
      upload_date: uploadDate,
      caption: note,
      front_file_url: frontFileUrl,
      back_file_url: backFileUrl,
    };

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const response = await fetch(
      "https://fylgaowoigzaxqhgugxr.supabase.co/functions/v1/update-document",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || "Update failed" };
    }

    return await response.json();
  }

  // Load data when modal opens or documentData changes
  useEffect(() => {
    if (isOpen && documentData) {
      setDocumentName(documentData.document_name || "");
      setUploadDate(
        documentData.upload_date?.split("T")[0] ||
          new Date().toISOString().split("T")[0]
      );
      setNote(documentData.caption || "");

      const selectedType = documentOptions.find(
        (opt) => opt.value === documentData.document_type
      );
      setDocumentType(selectedType || null);
      setFiles([]);
    }
  }, [isOpen, documentData]);

  // File validation & addition
  const handleFilesAdd = (newFiles) => {
    let validFiles = [];
    Array.from(newFiles).forEach((file) => {
      if (
        !["image/jpeg", "image/png", "image/gif", "application/pdf"].includes(
          file.type
        )
      ) {
        toast.error(`${file.name} is not a valid file type`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
      validFiles.push(file);
    });

    const combined = [...files, ...validFiles];

    if (combined.length > 2) {
      toast.error("You can upload at most 2 files.");
      return;
    }

    setFiles(combined);
  };

  const handleFileChange = (e) => handleFilesAdd(e.target.files);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdd(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentData || !documentData.id) {
      toast.error("Document data is missing. Please try again.");
      return;
    }

    if (!documentName.trim() || !documentType) {
      toast.error("Document Name and Type are required.");
      return;
    }

    if (files.length > 2) {
      toast.error("You can upload at most 2 files.");
      return;
    }

    setLoading(true);

    try {
      const result = await updateDocument(
        documentData.id,
        userId,
        documentType.value,
        files[0] || null,
        files[1] || null,
        documentName,
        uploadDate,
        note
      );

      if (result.success) {
        toast.success("Document updated successfully!");
        onUpdate();
        onClose();
      } else {
        toast.error(result.error || "Update failed.");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong while updating document.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex justify-center items-center fixed top-0 inset-0 bg-[#000000d6] bg-opacity-30 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-4 relative shadow-lg h-[35rem] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-3">Update Document</h2>

        <form onSubmit={handleSubmit}>
          {/* Document Name */}
          <div className="mb-3">
            <label
              htmlFor="documentName"
              className="block font-medium mb-1 text-sm"
            >
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              id="documentName"
              type="text"
              required
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
              className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Document Type */}
          <div className="mb-3">
            <label className="block font-medium mb-1 text-sm">
              Document Type <span className="text-red-500">*</span>
            </label>
            <Select
              options={documentOptions}
              value={documentType}
              onChange={setDocumentType}
              placeholder="Select document type..."
              isClearable
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "30px",
                  fontSize: "0.875rem",
                }),
              }}
            />
          </div>

          {/* Upload Date */}
          <div className="mb-4">
            <label
              htmlFor="uploadDate"
              className="block font-medium mb-1 text-sm"
            >
              Upload Date
            </label>
            <input
              id="uploadDate"
              type="date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Drag and Drop Upload Area */}
          <div
            className={`mb-4 border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors text-sm ${
              dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-400"
            }`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="font-semibold">UPDATE FILES (Optional)</p>
            <p className="text-xs text-gray-500">
              Drag & Drop or Click to Select new files (max 2).
            </p>
            <p className="text-xs text-gray-400">
              Only JPEG, PNG, GIF, and PDF files with a max size of 5 MB.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mt-1 px-3 py-1 border border-gray-300 rounded-md text-xs hover:bg-gray-100"
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              id="fileInput"
              type="file"
              accept=".jpeg,.jpg,.png,.gif,.pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={files.length >= 2}
            />
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="mb-4">
              <label className="block font-medium mb-2 text-sm">
                New Uploaded Files ({files.length}/2)
              </label>
              <ul className="space-y-1 text-sm">
                {files.map((file, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between bg-gray-50 p-1.5 rounded text-xs"
                  >
                    <span className="flex items-center gap-2">
                      📄 {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Remove"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Note/Description */}
          <div className="mb-4">
            <label htmlFor="note" className="block font-medium mb-1 text-sm">
              Note/Description (Optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Add any notes or description here..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 w-full disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Document"}
          </button>
        </form>
      </div>
    </div>
  );
}
