"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return context.confirm;
}

interface ConfirmProviderProps {
  children: ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef?.(true);
    setResolveRef(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef?.(false);
    setResolveRef(null);
  };

  const getTypeStyles = () => {
    switch (options?.type) {
      case "danger":
        return {
          icon: <Trash2 size={24} />,
          iconBg: "bg-red-500/20",
          iconColor: "text-red-400",
          buttonBg: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/25",
        };
      case "warning":
        return {
          icon: <AlertTriangle size={24} />,
          iconBg: "bg-amber-500/20",
          iconColor: "text-amber-400",
          buttonBg: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25",
        };
      default:
        return {
          icon: <AlertTriangle size={24} />,
          iconBg: "bg-blue-500/20",
          iconColor: "text-blue-400",
          buttonBg: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/25",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Modal */}
      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 pb-0">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className={styles.iconColor}>{styles.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white">
                    {options.title || "Təsdiq"}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    {options.message}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 border border-slate-700 transition-all font-medium"
              >
                {options.cancelText || "Ləğv et"}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-all font-medium shadow-lg ${styles.buttonBg}`}
              >
                {options.confirmText || "Təsdiq et"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
