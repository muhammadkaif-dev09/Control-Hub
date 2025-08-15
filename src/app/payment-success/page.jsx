// components/PaymentSuccess.tsx
export default function PaymentSuccess() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-md border border-green-200">
        <div className="text-green-600 text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your payment has been processed
          successfully.
        </p>
        <a
          href="/user"
          className="inline-block px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
