import { DocumentProvider } from "@/context/DocumentContext";

export default function AdminLayout({ children }) {
  return (
    <DocumentProvider>
      {children}
    </DocumentProvider>
  );
}