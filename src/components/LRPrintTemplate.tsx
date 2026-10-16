import React from 'react';
import type { LR, CompanySettings } from '../types/index';

interface Props {
  lr: LR;
  settings: CompanySettings;
  copyType: 'Consignor Copy' | 'Consignee Copy' | 'Driver Copy' | 'Office Copy';
  isCompact?: boolean;
}

export const LRPrintTemplate: React.FC<Props> = ({ lr, settings, copyType }) => {
  const currency = settings.currencySymbol || '₹';

  // Format currency
  const fmt = (num?: number) => {
    const val = Number(num) || 0;
    return `${currency}${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date DD-MM-YYYY
  const fmtDate = (dStr?: string) => {
    if (!dStr) return '';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    } catch {}
    return dStr;
  };

  // Combine loading & unloading charges for the template display if needed or show separately
  const loadingUnloadingTotal = (Number(lr.loadingCharges) || 0) + (Number(lr.unloadingCharges) || 0) + (Number(lr.hamaliCharges) || 0);
  const otherChargesTotal = (Number(lr.otherCharges) || 0) + (Number(lr.additionalCharges) || 0) - (Number(lr.discount) || 0);

  return (
    <div className="lr-print-container bg-white text-black text-xs font-sans p-6 border-2 border-black max-w-[1000px] mx-auto select-text shadow-sm print:shadow-none print:border-black print:p-4 print:max-w-none print:w-full print:m-0">
      {/* 1. Header Row */}
      <div className="flex justify-between items-start pb-2 border-b-2 border-black">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-black">
            {settings.companyName || 'SRI MURUGAN TRANSPORT'}
          </h1>
          <p className="text-[11px] text-gray-800 leading-tight mt-0.5">
            {settings.address}
          </p>
          <p className="text-[11px] font-semibold text-gray-800 mt-0.5">
            Ph: {settings.phone} &nbsp;|&nbsp; GSTIN: {settings.gstin}
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="text-lg font-black uppercase tracking-widest text-black">
            LORRY RECEIPT
          </span>
          <div className="mt-1 px-3 py-0.5 border border-black rounded text-[11px] font-bold tracking-wide uppercase bg-gray-50 print:bg-transparent">
            {copyType}
          </div>
        </div>
      </div>

      {/* 2. Key Metadata Strip */}
      <div className="grid grid-cols-5 border-b border-black text-center divide-x divide-black bg-gray-50 print:bg-transparent">
        <div className="py-1 px-2 text-left">
          <div className="text-[9px] uppercase font-bold text-gray-600">LR NO.</div>
          <div className="font-extrabold text-sm text-black">{lr.lrNumber}</div>
        </div>
        <div className="py-1 px-2 text-left">
          <div className="text-[9px] uppercase font-bold text-gray-600">DATE</div>
          <div className="font-bold text-[12px] text-black">{fmtDate(lr.lrDate)}</div>
        </div>
        <div className="py-1 px-2 text-left">
          <div className="text-[9px] uppercase font-bold text-gray-600">VEHICLE NO.</div>
          <div className="font-bold text-[12px] text-black uppercase">{lr.vehicleNumber || '—'}</div>
        </div>
        <div className="py-1 px-2 text-left">
          <div className="text-[9px] uppercase font-bold text-gray-600">FROM</div>
          <div className="font-bold text-[12px] text-black">{lr.fromCity}</div>
        </div>
        <div className="py-1 px-2 text-left">
          <div className="text-[9px] uppercase font-bold text-gray-600">TO</div>
          <div className="font-bold text-[12px] text-black">{lr.toCity}</div>
        </div>
      </div>

      {/* 3. Consignor & Consignee Columns */}
      <div className="grid grid-cols-2 border-b border-black divide-x divide-black min-h-[90px]">
        {/* Consignor Box */}
        <div className="p-2">
          <div className="text-[10px] font-extrabold uppercase tracking-wide text-gray-700 mb-0.5">
            CONSIGNOR (FROM)
          </div>
          <div className="font-bold text-sm text-black leading-tight">
            {lr.consignorName}
          </div>
          {lr.consignorBusinessName && lr.consignorBusinessName !== lr.consignorName && (
            <div className="text-[10px] text-gray-700 italic">{lr.consignorBusinessName}</div>
          )}
          <div className="text-[11px] text-gray-800 leading-snug mt-0.5 whitespace-pre-line">
            {lr.consignorAddress || `${lr.consignorCity}, ${lr.consignorState}`}
          </div>
          <div className="text-[10px] text-gray-800 mt-1 flex flex-wrap gap-x-3">
            {lr.consignorPhone && <span><span className="font-semibold">Ph:</span> {lr.consignorPhone}</span>}
            {lr.consignorGstin && <span><span className="font-semibold">GSTIN:</span> {lr.consignorGstin}</span>}
          </div>
        </div>

        {/* Consignee Box */}
        <div className="p-2">
          <div className="text-[10px] font-extrabold uppercase tracking-wide text-gray-700 mb-0.5">
            CONSIGNEE (TO)
          </div>
          <div className="font-bold text-sm text-black leading-tight">
            {lr.consigneeName}
          </div>
          {lr.consigneeBusinessName && lr.consigneeBusinessName !== lr.consigneeName && (
            <div className="text-[10px] text-gray-700 italic">{lr.consigneeBusinessName}</div>
          )}
          <div className="text-[11px] text-gray-800 leading-snug mt-0.5 whitespace-pre-line">
            {lr.consigneeAddress || `${lr.consigneeCity}, ${lr.consigneeState}`}
          </div>
          <div className="text-[10px] text-gray-800 mt-1 flex flex-wrap gap-x-3">
            {lr.consigneePhone && <span><span className="font-semibold">Ph:</span> {lr.consigneePhone}</span>}
            {lr.consigneeGstin && <span><span className="font-semibold">GSTIN:</span> {lr.consigneeGstin}</span>}
          </div>
        </div>
      </div>

      {/* 4. Goods Table */}
      <table className="w-full border-collapse border-b border-black text-left">
        <thead>
          <tr className="border-b border-black text-[10px] font-black uppercase bg-gray-50 print:bg-transparent">
            <th className="py-1 px-2 border-r border-black w-8 text-center">#</th>
            <th className="py-1 px-2 border-r border-black">Description of Goods</th>
            <th className="py-1 px-2 border-r border-black w-20 text-center">Pkgs</th>
            <th className="py-1 px-2 border-r border-black w-24 text-right">Weight (kg)</th>
            <th className="py-1 px-2 border-r border-black w-24 text-right">Rate</th>
            <th className="py-1 px-2 w-28 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {lr.items && lr.items.length > 0 ? (
            lr.items.map((item, idx) => (
              <tr key={item.id || idx} className="text-[11px]">
                <td className="py-1.5 px-2 border-r border-black text-center font-medium">{idx + 1}</td>
                <td className="py-1.5 px-2 border-r border-black font-medium text-black">
                  {item.description}
                  {item.packageType && <span className="text-[9px] text-gray-600 ml-1.5 font-normal">({item.packageType})</span>}
                </td>
                <td className="py-1.5 px-2 border-r border-black text-center font-bold">{item.packages}</td>
                <td className="py-1.5 px-2 border-r border-black text-right font-medium">{item.weight}</td>
                <td className="py-1.5 px-2 border-r border-black text-right font-medium">
                  {item.rate.toFixed(2)}
                  <span className="text-[8px] text-gray-500 block leading-none">
                    {item.rateBasis === 'per_pkg' ? '/pkg' : item.rateBasis === 'per_kg' ? '/kg' : 'flat'}
                  </span>
                </td>
                <td className="py-1.5 px-2 text-right font-semibold">{item.amount.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr className="text-[11px]">
              <td className="py-1.5 px-2 border-r border-black text-center">1</td>
              <td className="py-1.5 px-2 border-r border-black">General Goods</td>
              <td className="py-1.5 px-2 border-r border-black text-center">{lr.totalPackages}</td>
              <td className="py-1.5 px-2 border-r border-black text-right">{lr.totalWeight}</td>
              <td className="py-1.5 px-2 border-r border-black text-right">0.00</td>
              <td className="py-1.5 px-2 text-right font-semibold">{lr.freightAmount.toFixed(2)}</td>
            </tr>
          )}

          {/* Fill blank row if needed for aesthetic height */}
          {(!lr.items || lr.items.length <= 1) && (
            <tr className="text-[11px] h-6">
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td></td>
            </tr>
          )}

          {/* Subtotal row */}
          <tr className="border-t border-black font-extrabold text-[11px] bg-gray-50 print:bg-transparent">
            <td colSpan={2} className="py-1 px-2 border-r border-black text-right uppercase">
              Total
            </td>
            <td className="py-1 px-2 border-r border-black text-center font-black">
              {lr.totalPackages}
            </td>
            <td className="py-1 px-2 border-r border-black text-right font-black">
              {lr.totalWeight}
            </td>
            <td className="border-r border-black"></td>
            <td className="py-1 px-2 text-right font-black">
              {currency}{lr.freightAmount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 5. Invoice & Charges Split */}
      <div className="grid grid-cols-2 border-b border-black divide-x divide-black">
        {/* Left: Invoice & Payment Type */}
        <div className="p-2 space-y-1 text-[11px]">
          <div>
            <span className="font-bold text-gray-700">Invoice No:</span>{' '}
            <span className="font-semibold text-black">{lr.invoiceNumber || '—'}</span>
            {lr.invoiceDate && <span className="text-[10px] text-gray-600 ml-1.5">({fmtDate(lr.invoiceDate)})</span>}
          </div>
          <div>
            <span className="font-bold text-gray-700">Invoice Value:</span>{' '}
            <span className="font-semibold text-black">{fmt(lr.invoiceValue)}</span>
          </div>
          {lr.ewayBillNumber && (
            <div>
              <span className="font-bold text-gray-700">E-way Bill No:</span>{' '}
              <span className="font-semibold text-black">{lr.ewayBillNumber}</span>
            </div>
          )}
          <div className="pt-1">
            <span className="font-bold text-gray-700">Payment:</span>{' '}
            <span className="font-black text-sm uppercase px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 print:border-none print:bg-transparent text-blue-900 print:text-black">
              {lr.paymentType}
            </span>
          </div>
        </div>

        {/* Right: Freight & Charges Breakdown */}
        <div className="divide-y divide-gray-300 text-[11px]">
          <div className="flex justify-between py-1 px-2">
            <span className="text-gray-700 font-medium">Freight</span>
            <span className="font-semibold">{fmt(lr.freightAmount)}</span>
          </div>
          <div className="flex justify-between py-1 px-2">
            <span className="text-gray-700 font-medium">Loading / Unloading</span>
            <span className="font-semibold">{fmt(loadingUnloadingTotal)}</span>
          </div>
          <div className="flex justify-between py-1 px-2">
            <span className="text-gray-700 font-medium">Other Charges</span>
            <span className="font-semibold">{fmt(otherChargesTotal)}</span>
          </div>
          {lr.gstApplicable && (
            <div className="flex justify-between py-1 px-2">
              <span className="text-gray-700 font-medium">GST ({lr.gstRate}%)</span>
              <span className="font-semibold">{fmt(lr.gstAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 px-2 bg-gray-50 print:bg-transparent border-t-2 border-black font-black text-sm text-black">
            <span>Total</span>
            <span>{fmt(lr.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* 6. Legal / Goods Carriage Declaration */}
      <div className="py-2 px-1 text-[9.5px] leading-tight text-gray-800 border-b border-black">
        {settings.declaration || "Goods are carried at owner's risk. Subject to local jurisdiction. Please check goods at the time of delivery."}
      </div>

      {/* 7. Signatures Row */}
      <div className="grid grid-cols-3 pt-8 pb-1 text-center divide-x divide-gray-200">
        <div>
          <div className="border-t border-black w-4/5 mx-auto pt-1 font-bold text-[10px] uppercase text-black">
            Consignor Signature
          </div>
        </div>
        <div>
          <div className="border-t border-black w-4/5 mx-auto pt-1 font-bold text-[10px] uppercase text-black">
            Driver Signature
          </div>
        </div>
        <div>
          <div className="border-t border-black w-4/5 mx-auto pt-1 font-bold text-[10px] uppercase text-black">
            Authorised Signatory
          </div>
        </div>
      </div>
    </div>
  );
};
