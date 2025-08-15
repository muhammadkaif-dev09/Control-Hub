"use client";

import React, { useState, useEffect } from "react";
import {
  DocumentIcon,
  ExclamationCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import Layout from "@/components/Layout";
import { supabase } from "@/supabase/createClient";
import { CircleAlert } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchAllDocuments } from "@/utils/fetchAllDocuments";
import DocumentDetailsModal from "@/components/DocumentDetailsModal";

const STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const documentTypeLabels = {
  aadhar_card: "Aadhaar Card",
  affidavit: "Affidavit",
  bank_account_passbook: "Bank Account Passbook/Statement (with address)",
  bank_statement: "Bank Statement",
  birth_certificate: "Birth Certificate",
  court_decree: "Court Decrees/Judgments",
  degree_certificate: "Degree Certificates",
  death_certificate: "Death Certificate",
  disability_certificate: "Disability Certificate",
  driver_license: "Driving Licence",
  employer_letter: "Employer Letter",
  encumbrance_certificate: "Encumbrance Certificate (EC)",
  form_16: "Form 16",
  govt_employee_id: "Government Employee ID Card",
  health_insurance_policy: "Health Insurance Policy",
  income_tax_return: "Income Tax Return (ITR)",
  insurance_papers: "Insurance Papers (Property or Vehicle)",
  investment_proofs: "Investment Proofs (FD, Mutual Funds, Shares)",
  land_records: "Land Records/Patta/Chitta",
  mark_sheets: "Mark Sheets",
  marriage_certificate: "Marriage Certificate",
  medical_reports: "Medical Reports",
  mutation_certificate: "Mutation/Khata Certificate",
  pan_card: "PAN Card",
  passport: "Passport",
  puc_certificate: "Pollution Under Control (PUC) Certificate",
  power_of_attorney: "Power of Attorney",
  property_registration_certificate: "Property Registration Certificate",
  property_sale_deed: "Property Sale Deed",
  property_tax_receipt: "Property Tax Receipt",
  ration_card: "Ration Card",
  rent_agreement: "Rent Agreement (registered)",
  salary_slip: "Salary Slip",
  utility_bills: "Utility Bills (Electricity, Water, Gas, Landline)",
  vaccination_certificate: "Vaccination Certificate",
  vehicle_registration_certificate: "Vehicle Registration Certificate (RC)",
  voter_id: "Voter ID (EPIC Card)",
  will_testament: "Will/Testament",
};

export default function DocumentDashboard() {
  const [documents, setDocuments] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectDocId, setRejectDocId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All"); // <-- NEW
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [captionModalOpen, setCaptionModalOpen] = useState(false);
  const [currentCaption, setCurrentCaption] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);

  const loadDocuments = async () => {
    const docs = await fetchAllDocuments();
    setDocuments(docs);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === STATUS.REJECTED) {
      setRejectDocId(id);
      setShowRejectModal(true);
      return;
    }

    const { error } = await supabase
      .from("documents")
      .update({ status: newStatus, rejection_note: "" })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error.message);
      return;
    }

    await loadDocuments();
  };

  // Submit rejection with note
  const handleRejectSubmit = async () => {
    if (!rejectDocId) return;

    const { error } = await supabase
      .from("documents")
      .update({
        status: STATUS.REJECTED,
        rejection_note: rejectNote || "No note provided", // <-- Fix typo here
      })
      .eq("id", rejectDocId);

    if (error) {
      console.error("Error rejecting document:", error.message);
      return;
    }

    // Refresh list
    await loadDocuments();

    // Reset modal state
    setShowRejectModal(false);
    setRejectNote("");
    setRejectDocId(null);
  };

  // Delete document handler
  const handleDelete = async (id) => {
    setDeletingId(id);
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      alert("Error deleting document: " + error.message);
    } else {
      await loadDocuments();
    }
    setDeletingId(null);
  };

  //  Summary counts
  const totalDocs = documents.length;
  const pendingCount = documents.filter(
    (d) => d.status === STATUS.PENDING
  ).length;
  const approvedCount = documents.filter(
    (d) => d.status === STATUS.APPROVED
  ).length;
  const rejectedCount = documents.filter(
    (d) => d.status === STATUS.REJECTED
  ).length;

  //  Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) =>
      filterStatus === "All" ? true : doc.status === filterStatus
    )
    .sort(
      (a, b) =>
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );

  // Pagination logic
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page if filter changes or documents change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, documents]);

  // console.log(documents);
  return (
    <ProtectedRoute>
      <Layout>
        <h1 className="text-3xl font-semibold text-gray-800 mb-1">
          Document Management
        </h1>
        <p className="text-gray-500 mb-6">
          Recently uploaded documents and their status
        </p>

        {/* ✅ Filter Button/Dropdown */}
        <div className="mb-4 flex items-center gap-2">
          <label className="font-medium">Filter by Status:</label>
          <select
            className="border rounded px-2 py-1"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value={STATUS.PENDING}>Pending</option>
            <option value={STATUS.APPROVED}>Approved</option>
            <option value={STATUS.REJECTED}>Rejected</option>
          </select>
        </div>

        <div className="p-6 mx-auto space-y-6 bg-white rounded-lg">
          {/* ✅ Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div
              className="border rounded-lg p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setFilterStatus("All")}
              title="Show all documents"
            >
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Total Documents
                </p>
                <p className="text-2xl font-bold">{totalDocs}</p>
              </div>
              <DocumentIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div
              className="border rounded-lg p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setFilterStatus(STATUS.PENDING)}
              title="Show pending documents"
            >
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Pending Review
                </p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div
              className="border rounded-lg p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setFilterStatus(STATUS.APPROVED)}
              title="Show approved documents"
            >
              <div>
                <p className="text-sm font-semibold text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <div
              className="border rounded-lg p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setFilterStatus(STATUS.REJECTED)}
              title="Show rejected documents"
            >
              <div>
                <p className="text-sm font-semibold text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
              <XCircleIcon className="h-6 w-6 text-red-500" />
            </div>
          </div>

          {/* ✅ Recent Documents Table */}
          <div className=" rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Recent Documents</h2>
            <table className="w-full text-sm border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="py-2 px-2 text-center font-semibold">Sr No</th>
                  <th className="py-2 px-2 text-center font-semibold w-[9rem]">
                    Uploader
                  </th>
                  <th className="py-2 px-2 text-center font-semibold">
                    Document
                  </th>
                  <th className="py-2 px-2 text-center font-semibold">
                    Upload Date
                  </th>
                  <th className="py-2 px-2 text-center font-semibold w-[9rem] text-ellipsis">
                    Type
                  </th>
                  <th className="py-2 px-2 text-center font-semibold">
                    Status
                  </th>
                  <th className="py-2 px-2 text-center font-semibold">
                    Caption
                  </th>
                  <th className="py-2 px-2 text-center font-semibold">
                    Rejection
                  </th>
                  <th className="py-2 px-2 text-center font-semibold">View</th>
                  <th className="py-2 px-2 text-center font-semibold">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedDocuments.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    className={`border-b border-gray-200 hover:bg-blue-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-2 text-center">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3 px-2 text-center">{doc.owner_name}</td>
                    <td className="py-3 px-2 text-center">
                      {doc.document_name}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {doc.upload_date
                        ? new Date(doc.upload_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : ""}
                    </td>
                    <td className="py-3 px-2 text-center truncate whitespace-nowrap max-w-[7rem]">
                      {documentTypeLabels[doc.document_type] ||
                        doc.document_type}
                    </td>

                    <td className="py-3 px-2 text-center">
                      <select
                        className={`border rounded px-2 py-1 text-xs font-medium ${
                          doc.status === STATUS.APPROVED
                            ? "bg-green-100 text-green-700"
                            : doc.status === STATUS.REJECTED
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                        value={doc.status}
                        onChange={(e) =>
                          handleStatusChange(doc.id, e.target.value)
                        }
                      >
                        <option value={STATUS.PENDING}>Pending</option>
                        <option value={STATUS.APPROVED}>Approved</option>
                        <option value={STATUS.REJECTED}>Rejected</option>
                      </select>
                    </td>
                    {/* Caption Icon */}
                    <td className="py-3 px-2 text-center">
                      {doc.caption ? (
                        <button
                          className="text-gray-600 hover:text-blue-600"
                          title="View Caption"
                          onClick={() => {
                            setCurrentCaption(doc.caption);
                            setCaptionModalOpen(true);
                          }}
                        >
                          <DocumentTextIcon className="h-5 w-5 inline" />
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    {/* Rejection Note Icon */}
                    <td className="py-3 px-2 text-center">
                      {doc.rejection_note ? (
                        <button
                          className="text-gray-600 hover:text-blue-600"
                          title="View Rejection Note"
                          onClick={() => {
                            setCurrentNote(doc.rejection_note);
                            setNoteModalOpen(true);
                          }}
                        >
                          <CircleAlert className="text-red-700 h-5 w-5 inline" />
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    {/* View Icon */}
                    <td className="py-3 px-2 text-center">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setViewDoc({
                            document_name: doc.document_name,
                            document_type: doc.document_type,
                            document_type_label:
                              documentTypeLabels[doc.document_type] ||
                              doc.document_type, // <-- Add this line
                            owner_name: doc.owner_name,
                            caption: doc.caption,
                            upload_date: doc.upload_date,
                            rejection_note: doc.rejection_note,
                            files: doc.files,
                            status: doc.status,
                          });
                          setViewModalOpen(true);
                        }}
                        title="View Document"
                      >
                        <EyeIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                    {/* Delete Icon with Loader */}
                    <td className="py-3 px-2 text-center">
                      <button
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        title="Delete Document"
                      >
                        {deletingId === doc.id ? (
                          <svg
                            className="animate-spin h-5 w-5 inline"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                        ) : (
                          <TrashIcon className="h-5 w-5 inline" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages || 1}
              </span>
              <div className="space-x-2">
                <button
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Reject Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-[#00000094] backdrop-blur-sm" />
              <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Reject Document</h3>
                <p className="mb-2 text-gray-600">
                  (Optional) Please provide a note for rejection:
                </p>
                <textarea
                  className="w-full border rounded p-2 mb-4"
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Enter rejection note..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectNote("");
                      setRejectDocId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={handleRejectSubmit}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Note Modal */}
          {noteModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-[#00000094] backdrop-blur-sm" />
              <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Rejection Note</h3>
                <p className="mb-4 text-gray-700 whitespace-pre-line">
                  {currentNote}
                </p>
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setNoteModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Caption Modal */}
          {captionModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-[#00000094] backdrop-blur-sm" />
              <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Caption</h3>
                <p className="mb-4 text-gray-700 whitespace-pre-line">
                  {currentCaption}
                </p>
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setCaptionModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <DocumentDetailsModal
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            document={viewDoc}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
