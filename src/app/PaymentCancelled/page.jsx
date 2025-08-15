import Link from "next/link";

// components/PaymentCancelled.tsx
export default function PaymentCancelled() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-md border border-red-200">
        <div className="text-red-600 text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. If this was a mistake, you can try again
          below.
        </p>
        <Link
          href={"/user/document"}
          className="inline-block px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
