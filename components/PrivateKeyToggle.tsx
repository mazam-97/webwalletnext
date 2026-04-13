import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // eye icons from lucide

const PrivateKeyToggle = ({privateKey}:{privateKey:string}) => {
  const [visible, setVisible] = useState(false);


  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Private Key</h2>

      <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
        <p className="flex-1 break-words text-sm text-slate-900 dark:text-slate-100">
          {visible
            ? privateKey
            : "•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••"}
        </p>
        <button
          onClick={() => setVisible(!visible)}
          className="ml-4 rounded-md p-1 text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-300 dark:hover:text-slate-50 dark:focus-visible:ring-offset-slate-900"
          aria-label="Toggle seed visibility"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};

export default PrivateKeyToggle;
