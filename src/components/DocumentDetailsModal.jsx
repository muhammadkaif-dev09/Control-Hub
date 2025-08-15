"use client";
import { X, Eye, CheckCircle2 } from "lucide-react";
import React from "react";

export default function DocumentDetailsModal({ isOpen, onClose, document }) {
  // console.log(document);
  if (!isOpen || !document) return null;

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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
      <div
        className="bg-white rounded-lg shadow-lg w-[520px] p-6 relative transform transition-all duration-300 ease-out scale-95 animate-fadeIn"
        style={{
          animation: "fadeInScale 0.3s ease-out forwards",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-5">Document Details</h2>

        {/* Document Name & Type */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-gray-500 text-sm">Document Name</p>
            <p className="font-medium">{document.document_name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Type</p>
            <p className="font-medium">
              {documentTypeLabels[document.document_type] ||
                document.document_type}
            </p>
          </div>
        </div>

        {/* Status & Owner */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-gray-500 text-sm">Status</p>
            <span
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium w-fit mt-1 ${
                document.status === "Approved"
                  ? "bg-green-100 text-green-600"
                  : document.status === "Rejected"
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {document.status === "Approved" && <CheckCircle2 size={14} />}
              {document.status}
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Owner</p>
            <p className="font-medium">
              {document.owner_name || document.uploader_name}
            </p>
          </div>
        </div>

        {/* Uploader's Caption */}
        {document.caption && (
          <div className="mb-3">
            <p className="text-gray-500 text-sm">Uploader's Caption</p>
            <p className="text-gray-800">{document.caption}</p>
          </div>
        )}

        {/* Uploaded date & Files count */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-gray-500 text-sm">Uploaded</p>
            <p className="font-medium">
              {new Date(document.upload_date).toLocaleDateString("en-US", {
                dateStyle: "medium",
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Files</p>
            <p className="font-medium">{document.files?.length} file(s)</p>
          </div>
        </div>

        {/* Rejection Note */}
        {document.rejection_note && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 font-medium text-sm">Rejection Note:</p>
            <p className="text-gray-700">{document.rejection_note}</p>
          </div>
        )}

        {/* Files List */}
        <div>
          <p className="text-gray-500 text-sm mb-2">Document Files</p>
          <div className="space-y-2">
            {document.files?.map((file, index) => (
              <div key={index} className="bg-gray-100 rounded-md px-3 py-2">
                <div className="flex justify-between items-center">
                  <span className="truncate max-w-[350px]" title={file.name}>
                    {file.name}
                  </span>
                  <button
                    onClick={() => window.open(file.url, "_blank")}
                    className="text-gray-500 hover:text-indigo-600"
                    title="View File"
                  >
                    <Eye size={18} />
                  </button>
                </div>
                {file.caption && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {file.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
