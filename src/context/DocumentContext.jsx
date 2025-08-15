"use client"
import { fetchAllDocuments } from "@/utils/fetchAllDocuments";
import { createContext, useContext, useEffect, useState } from "react";


const DocumentContext = createContext();

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    setLoading(true);
    const docs = await fetchAllDocuments();
    setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <DocumentContext.Provider value={{ documents, loading, reload: loadDocuments }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  return useContext(DocumentContext);
}