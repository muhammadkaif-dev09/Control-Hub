const EmailExpiration = ({ confirmationURL }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e0e3e] to-[#0c144a] p-8 text-[#e5e5e5] font-sans">
      <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] text-black">
        <h2 className="text-2xl mb-4">Hello, User 👋</h2>

        <p className="text-base leading-relaxed mb-4">
          Thank you for Choosing Us, But your Email Verification link is
          expired, Login your account and generate a new fresh confirmation
          link.
        </p>

        <p className="text-base leading-relaxed mb-6">
          Just click the button below:
        </p>

        <a
          href={confirmationURL}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
        >
          Control-Hub!
        </a>

        <p className="mt-8 text-xs text-gray-500 text-center">
          If you didn’t sign up for Control-Hub, you can ignore this email.
        </p>
      </div>
    </div>
  );
};

export default EmailExpiration;
