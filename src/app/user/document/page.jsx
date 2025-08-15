"use client";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import UserLayout from "@/components/UserLayout";
import { AuthProvider } from "@/context/AuthContext";
import { useUser } from "@/context/UserProvider";
import Select from "react-select";
import { fetchUserDetails } from "@/utils/fetchSignleUser";
import { uploadDocument } from "@/utils/uploadDocument";
import { supabase } from "@/supabase/createClient";
// Optional: PlanDisplay shows available subscription plans (adjust path if needed)
import PlanDisplay from "@/components/PlanDisplay";

export default function DocumentUpload() {
  // --- auth & user ---
  const { user } = useUser();
  const user_id = user?.id;

  // --- form state ---
  const [documentName, setDocumentName] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [uploadDate, setUploadDate] = useState(today);
  const [documentType, setDocumentType] = useState(null);
  const [note, setNote] = useState("");

  // files: array of File objects (max 2)
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // drag/drop UI state
  const [dragActive, setDragActive] = useState(false);

  // loading state
  const [loading, setLoading] = useState(false);

  // credit state (object from fetchUserDetails)
  const [credit, setCreadit] = useState(null);

  // subscription modal
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  // document options (kept from your original)
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

  // -------------------------
  // fetch user credits on mount / when user changes
  // -------------------------
  useEffect(() => {
    if (!user_id) return;

    const load = async () => {
      try {
        const res = await fetchUserDetails(user_id);
        setCreadit(res); // just update credits, don't trigger modal here
      } catch (err) {
        console.error("fetchUserDetails error:", err);
      }
    };

    load();
  }, [user_id]);

  // -------------------------
  // file helpers
  // -------------------------
  const VALID_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  // Add files with validation, and show toast on 3rd attempt instead of disabling UI
  const handleFilesAdd = (newFilesList) => {
    const newFiles = Array.from(newFilesList);

    // Validate each file first
    const validated = [];
    for (const f of newFiles) {
      if (!VALID_TYPES.includes(f.type)) {
        toast.error(`${f.name} is not a valid file type`);
        continue;
      }
      if (f.size > MAX_SIZE_BYTES) {
        toast.error(`${f.name} exceeds 5MB limit`);
        continue;
      }
      validated.push(f);
    }

    // If nothing valid, return
    if (validated.length === 0) return;

    // Check combined length
    const combined = [...files, ...validated];

    // If adding them would go beyond 2 files, show toast and do not add those extra files
    if (combined.length > 2) {
      // Show how many slots left
      const slotsLeft = 2 - files.length;
      if (slotsLeft <= 0) {
        // Already 2 present -> direct 3rd attempt
        toast.error("Only 2 files can upload at the time (Front & Back)");
        return;
      } else {
        toast.error(`Only 2 files can upload at the time (Front & Back)`);
        // add only up to remaining slots
        const allowed = validated.slice(0, slotsLeft);
        setFiles((prev) => [...prev, ...allowed]);
        return;
      }
    }

    // If ok, add them
    setFiles((prev) => [...prev, ...validated]);
  };

  // input change handler
  const handleFileChange = (e) => {
    handleFilesAdd(e.target.files);
    // reset input so same file can be selected again if needed
    e.target.value = "";
  };

  // drag handlers
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
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   // Basic validations
  //   if (!documentName.trim() || !documentType) {
  //     toast.error("Document Name and Type are required.");
  //     return;
  //   }
  //   if (files.length < 1 || files.length > 2) {
  //     toast.error("Please upload at least 1 and at most 2 files.");
  //     return;
  //   }

  //   const creditsNeeded = 10;

  //   if (!credit || typeof credit.remainingCredits !== "number") {
  //     toast.error("Unable to fetch your credits. Please try again.");
  //     return;
  //   }
  //   if (credit.remainingCredits < creditsNeeded) {
  //     toast.error(
  //       "You don't have an enough credits (10 credits required for each upload)"
  //     );
  //     setShowSubscribeModal(true);
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     // Call your existing utility that handles the actual upload (storage + DB meta)
  //     const result = await uploadDocument(
  //       user?.id,
  //       documentType.value,
  //       files[0],
  //       files[1] || null,
  //       documentName,
  //       uploadDate,
  //       note
  //     );

  //     if (result?.success) {
  //       // On success, deduct credits on user_profiles table via supabase client (client side)
  //       try {
  //         const { data: updatedData, error: updateError } = await supabase
  //           .from("user_profiles")
  //           .update({
  //             remainingCredits: (credit?.remainingCredits ?? 0) - creditsNeeded,
  //           })
  //           .eq("id", user?.id)
  //           .select("remainingCredits")
  //           .single();

  //         if (updateError) {
  //           console.error("Credits update error:", updateError);
  //           toast.error("Credits update failed (server).");
  //         } else {
  //           // Update local state and check subscription modal condition
  //           setCreadit((prev) => ({
  //             ...prev,
  //             remainingCredits: updatedData.remainingCredits,
  //           }));

  //           if ((updatedData.remainingCredits ?? 0) < 10) {
  //             setShowSubscribeModal(true);
  //           }
  //         }
  //       } catch (err) {
  //         console.error("Error updating credits:", err);
  //         toast.error("Credits update failed.");
  //       }

  //       // Reset form
  //       toast.success("Documents uploaded successfully!");
  //       setDocumentName("");
  //       setDocumentType(null);
  //       setUploadDate(today);
  //       setFiles([]);
  //       setNote("");
  //     } else {
  //       toast.error(result?.error || "Upload failed.");
  //     }
  //   } catch (err) {
  //     console.error("Upload exception:", err);
  //     toast.error("Something went wrong while uploading documents.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validations
    if (!documentName.trim() || !documentType) {
      toast.error("Document Name and Type are required.");
      return;
    }
    if (files.length < 1 || files.length > 2) {
      toast.error("Please upload at least 1 and at most 2 files.");
      return;
    }

    const creditsNeeded = 10;

    if (!credit || typeof credit.remainingCredits !== "number") {
      toast.error("Unable to fetch your credits. Please try again.");
      return;
    }
    if (credit.remainingCredits < creditsNeeded) {
      toast.error(
        "You don't have enough credits (10 credits required for each upload)"
      );
      setShowSubscribeModal(true);
      return;
    }

    setLoading(true);

    try {
      // Call your existing utility that handles the actual upload (storage + DB meta)
      const result = await uploadDocument(
        user?.id,
        documentType.value,
        files[0],
        files[1] || null,
        documentName,
        uploadDate,
        note
      );

      if (result?.success) {
        // On success, deduct credits on user_profiles table via supabase client (client side)
        try {
          const { data: updatedData, error: updateError } = await supabase
            .from("user_profiles")
            .update({
              remainingCredits: (credit?.remainingCredits ?? 0) - creditsNeeded,
            })
            .eq("id", user?.id)
            .select("remainingCredits")
            .single();

          if (updateError) {
            console.error("Credits update error:", updateError);
            toast.error("Credits update failed (server).");
          } else {
            // Update local state but DO NOT show modal here
            setCreadit((prev) => ({
              ...prev,
              remainingCredits: updatedData.remainingCredits,
            }));

            // Removed modal trigger here
            // if ((updatedData.remainingCredits ?? 0) < 10) {
            //   setShowSubscribeModal(true);
            // }
          }
        } catch (err) {
          console.error("Error updating credits:", err);
          toast.error("Credits update failed.");
        }

        // Reset form
        toast.success("Documents uploaded successfully!");
        setDocumentName("");
        setDocumentType(null);
        setUploadDate(today);
        setFiles([]);
        setNote("");
      } else {
        toast.error(result?.error || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload exception:", err);
      toast.error("Something went wrong while uploading documents.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan) => {
    setShowSubscribeModal(false);
    toast.success(`Plan selected: ${plan?.name || plan?.title || plan?.id}`);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
          userId: user_id,
          name: plan?.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Checkout session creation failed.");
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
      toast.error("Something went wrong initiating payment.");
    }
  };

  return (
    <AuthProvider>
      <UserLayout>
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Document Upload
          </h1>

          {/* show remaining credits */}
          <p className="text-gray-500 mb-2">
            Remaining Credits: <strong>{credit?.remainingCredits ?? 0}</strong>{" "}
            — 10 credits per document
          </p>

          <div className="bg-white p-6 mx-auto rounded-md shadow-md">
            <form onSubmit={handleSubmit}>
              {/* Document Name */}
              <div className="mb-4">
                <label
                  htmlFor="documentName"
                  className="block font-medium mb-1"
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
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Document Type */}
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <Select
                  options={documentOptions}
                  value={documentType}
                  onChange={setDocumentType}
                  placeholder="Select document type..."
                  isClearable
                />
              </div>

              {/* Upload Date */}
              <div className="mb-6">
                <label htmlFor="uploadDate" className="block font-medium mb-1">
                  Upload Date
                </label>
                <input
                  id="uploadDate"
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Drag & Drop area */}
              <div
                className={`mb-6 border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-400"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <p className="font-semibold">UPLOAD FILES</p>
                <p className="text-xs text-gray-500">
                  Drag & Drop or Click to Select
                </p>
                <p className="text-xs text-gray-400">
                  Only JPEG, PNG, GIF, and PDF files with a max size of 5 MB.
                </p>
                <p className="text-xs text-gray-400">
                  You must upload at least 1 and at most 2 files for each
                  document (Front &/or Back).
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
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
                />
              </div>

              {/* Files list */}
              {files.length > 0 && (
                <div className="mb-6">
                  <label className="block font-medium mb-2">
                    Uploaded Documents ({files.length}/2)
                  </label>
                  <ul className="space-y-2">
                    {files.map((file, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
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

              {/* Note */}
              <div className="mb-6">
                <label htmlFor="note" className="block font-medium mb-1">
                  Note/Description (Optional)
                </label>
                <textarea
                  id="note"
                  rows={3}
                  placeholder="Add any additional notes..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Submit Documents"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDocumentName("");
                    setDocumentType(null);
                    setUploadDate(today);
                    setFiles([]);
                    setNote("");
                  }}
                  className="border border-gray-300 px-5 py-2 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Subscription modal: shows PlanDisplay and a close button */}
        {showSubscribeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg max-w-3xl h-[37rem] w-full p-6 pl-[3rem] relative overflow-auto">
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                ✖
              </button>

              <h3 className="text-xl font-semibold mb-2">
                Your credits are low
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                You have only <strong>{credit?.remainingCredits ?? 0}</strong>{" "}
                credits left. To upload more documents you need at least 10
                credits. Choose a plan below to continue.
              </p>

              {/* PlanDisplay fetches plans itself — pass handler */}
              <PlanDisplay onSelect={(plan) => handlePlanSelect(plan)} />
            </div>
          </div>
        )}
      </UserLayout>
    </AuthProvider>
  );
}
