"use client";

import { useState } from "react";

interface InfoTooltipProps {
  title: string;
  content: React.ReactNode;
}

export function InfoTooltip({ title, content }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Info button */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white text-[10px] flex items-center justify-center transition-colors"
        aria-label={`Info: ${title}`}
      >
        i
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-slate-800 rounded-lg border border-slate-700 max-w-sm w-full p-4 shadow-xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-white font-semibold">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="text-sm text-slate-300 space-y-2">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
