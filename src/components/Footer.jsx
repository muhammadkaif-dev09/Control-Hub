export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-4 mt-10">
      <p className="text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} ControlHub. All rights reserved.
      </p>
    </footer>
  );
}
