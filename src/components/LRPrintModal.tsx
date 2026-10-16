import React, { useState } from 'react';
import { Printer, X, Copy, Check, Eye } from 'lucide-react';
import type { LR, CompanySettings } from '../types/index';
import { LRPrintTemplate } from './LRPrintTemplate';

interface Props {
  lr: LR;
  settings: CompanySettings;
  onClose: () => void;
  initialCopy?: 'Consignor Copy' | 'Consignee Copy' | 'Driver Copy' | 'Office Copy' | 'All 4 Copies';
}

const COPY_TYPES = [
  'Consignor Copy',
  'Consignee Copy',
  'Driver Copy',
  'Office Copy'
] as const;

export const LRPrintModal: React.FC<Props> = ({ lr, settings, onClose, initialCopy = 'All 4 Copies' }) => {
  const [selectedView, setSelectedView] = useState<'All 4 Copies' | typeof COPY_TYPES[number]>(initialCopy);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-auto flex flex-col max-h-[96vh] overflow-hidden no-print">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              LR
            </div>
            <div>
              <h2 className="text-base font-bold">
                Lorry Receipt Print Preview — <span className="text-blue-400">{lr.lrNumber}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {lr.fromCity} → {lr.toCity} &nbsp;|&nbsp; {lr.consignorName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print {selectedView === 'All 4 Copies' ? 'All 4 Copies' : selectedView}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copy Selector Tabs */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span className="text-slate-500 mr-1 font-semibold">Select View:</span>
            <button
              onClick={() => setSelectedView('All 4 Copies')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                selectedView === 'All 4 Copies'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              All 4 Copies (Full Set)
            </button>
            {COPY_TYPES.map(copy => (
              <button
                key={copy}
                onClick={() => setSelectedView(copy)}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                  selectedView === copy
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {copy}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>A4 Landscape standard</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Print ready</span>
          </div>
        </div>

        {/* Scrollable Preview Area (On-screen) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/80 space-y-8">
          {selectedView === 'All 4 Copies' ? (
            COPY_TYPES.map((copy, i) => (
              <div key={copy} className="relative">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
                  <span>Page {i + 1} of 4: {copy}</span>
                  <span className="text-slate-500">Official Sri Murugan Transport Format</span>
                </div>
                <LRPrintTemplate lr={lr} settings={settings} copyType={copy} />
              </div>
            ))
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
                <span>Single Sheet: {selectedView}</span>
                <span className="text-slate-500">Official Sri Murugan Transport Format</span>
              </div>
              <LRPrintTemplate lr={lr} settings={settings} copyType={selectedView} />
            </div>
          )}
        </div>
      </div>

      {/* Hidden container dedicated to native print */}
      <div className="hidden print:block printable-area">
        {selectedView === 'All 4 Copies' ? (
          COPY_TYPES.map((copy, i) => (
            <div key={copy} className={i < 3 ? 'page-break mb-8' : ''}>
              <LRPrintTemplate lr={lr} settings={settings} copyType={copy} />
            </div>
          ))
        ) : (
          <LRPrintTemplate lr={lr} settings={settings} copyType={selectedView} />
        )}
      </div>
    </div>
  );
};
