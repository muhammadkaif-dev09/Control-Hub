export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center fixed w-full top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <span className="text-blue-700 font-bold text-xl">ControlHub</span>
      </div>
    </nav>
  );
}
