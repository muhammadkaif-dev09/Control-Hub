export default function UserNavbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
      {/* Left side: Profile */}
      <div className="flex items-center gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold">
          KR
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Welcome back, <span className="font-bold">Keiko Rios</span>
          </p>
          <p className="text-xs text-gray-500">dexok@yopmail.com</p>
        </div>
      </div>

      {/* Right side: Logout button */}
      <button
        type="button"
        className="flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
          />
        </svg>
        Logout
      </button>
    </nav>
  );
}
