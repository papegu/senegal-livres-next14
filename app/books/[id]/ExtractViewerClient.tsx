"use client";
import { useState } from "react";

export default function ExtractViewerClient({ bookId }: { bookId: string | number }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button
        className="bg-[#128A41] text-white px-4 py-2 rounded hover:bg-green-700 font-semibold mb-2"
        onClick={() => setShow((v) => !v)}
      >
        {show ? "Masquer l'extrait" : "Lire un extrait (introduction)"}
      </button>
      {show && (
        <iframe
          src={`/api/pdfs/extract?bookId=${bookId}`}
          title="Extrait PDF"
          className="w-full h-96 border mt-2"
        />
      )}
    </div>
  );
}
