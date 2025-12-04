import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, TrendingUp, Clock, DollarSign, Activity, ExternalLink, Loader2, ArrowRight, FileText } from 'lucide-react';
import { ROICalculationResult, AIReportContent, ROIInputs } from '../types';

interface ResultsViewProps {
  inputs: ROIInputs;
  results: ROICalculationResult;
  aiContent: AIReportContent | null;
  loading: boolean;
  onReset: () => void;
}

// Mainsim Palette
const BRAND_PURPLE = '#6958dd';
const BRAND_DARK = '#3f4142';
const BRAND_GRAY = '#f7f7f7';

const COLORS = [BRAND_PURPLE, '#10B981', '#F59E0B', '#6366F1'];

const Card: React.FC<{ title: string; value: string; subtext: string; icon: React.ReactNode }> = ({ title, value, subtext, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow min-w-0 pdf-break-inside-avoid">
    <div className="flex justify-between items-start">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide truncate">{title}</p>
        <p className="text-3xl font-bold text-[#3f4142] mt-2 truncate">{value}</p>
        <p className="text-sm text-gray-600 mt-1 truncate">{subtext}</p>
      </div>
      <div className="p-3 bg-purple-50 rounded-lg text-[#6958dd] shrink-0 ml-4">
        {icon}
      </div>
    </div>
  </div>
);

const ResultsView: React.FC<ResultsViewProps> = ({ inputs, results, aiContent, loading, onReset }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const savingsData = [
    { name: 'Fermo Macchina', value: results.downtimeSavings },
    { name: 'Efficienza Tecnici', value: results.laborSavings },
    { name: 'Efficienza Gestionale', value: results.adminSavings },
    { name: 'Materiali', value: results.materialSavings },
  ].filter(d => d.value > 0);

  const comparisonData = [
    {
      name: 'Anno 1',
      'Costi Attuali': (inputs.technicians * inputs.avgHourlyRate * inputs.weeklyHoursPerTech * 52) + (inputs.downtimeHoursPerYear * inputs.costPerDowntimeHour) + inputs.annualMaintenanceMaterialSpend,
      'Con Mainsim': ((inputs.technicians * inputs.avgHourlyRate * inputs.weeklyHoursPerTech * 52) + (inputs.downtimeHoursPerYear * inputs.costPerDowntimeHour) + inputs.annualMaintenanceMaterialSpend) - results.totalAnnualSavings + inputs.annualCmmsCost
    }
  ];

  const handleDownloadPdf = () => {
    const element = document.getElementById('roi-report-content');
    if (!element) return;

    setIsDownloading(true);

    const opt = {
      margin: [10, 10], // top/bottom, left/right in mm
      filename: `Mainsim_ROI_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
        setIsDownloading(false);
      }).catch((err: any) => {
        console.error("PDF generation failed", err);
        setIsDownloading(false);
        alert("Errore durante la generazione del PDF. Riprova o usa la funzione di stampa del browser.");
      });
    } else {
      // Fallback
      window.print();
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center no-print gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <button onClick={onReset} className="text-sm text-gray-500 hover:text-[#6958dd] underline">
            ← Modifica Input
            </button>
            <a 
                href="https://www.mainsim.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm font-medium text-gray-600 hover:text-[#6958dd] flex items-center gap-1"
            >
                Torna al sito <ExternalLink size={14} />
            </a>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
            <a
                href="https://www.mainsim.com/richiesta-demo/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#6958dd] text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow-sm font-medium whitespace-nowrap"
            >
                Richiedi una demo
            </a>
            <button 
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#3f4142] text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isDownloading ? 'Generazione...' : 'Scarica PDF'}
            </button>
        </div>
      </div>

      {/* Report Container - Added ID for html2pdf */}
      <div id="roi-report-content" className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-[#3f4142]">Report Analisi ROI</h1>
                <p className="text-gray-500 mt-1">Generato da Mainsim ROI Engineer</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-400">Data</p>
                <p className="font-medium text-gray-700">{new Date().toLocaleDateString('it-IT')}</p>
            </div>
        </div>

        {/* Executive Summary Section */}
        <div className="mb-8 pdf-break-inside-avoid">
            <h2 className="text-lg font-bold text-[#3f4142] mb-3 uppercase tracking-wider text-xs">Executive Summary</h2>
            {loading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            ) : (
                <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed text-sm md:text-base">
                    <ReactMarkdown>{aiContent?.executiveSummary || ""}</ReactMarkdown>
                </div>
            )}
        </div>

        {/* KPI Cards - Grid Layout Modified: Max 2 cols on MD and LG screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card 
                title="Risparmio Totale Annuo" 
                value={formatCurrency(results.totalAnnualSavings)} 
                subtext="Risparmio Operativo Stimato"
                icon={<DollarSign size={24} />}
            />
            <Card 
                title="ROI Annuale" 
                value={`${results.roiPercentage.toFixed(0)}%`} 
                subtext="Ritorno sull'investimento"
                icon={<TrendingUp size={24} />}
            />
             <Card 
                title="Payback (a regime)" 
                value={`${results.paybackPeriodMonths.toFixed(1)} Mesi`} 
                subtext="Dalla piena operatività"
                icon={<Clock size={24} />}
            />
             <Card 
                title="Beneficio Netto (A1)" 
                value={formatCurrency(results.totalAnnualSavings - results.totalCostOfOwnership)} 
                subtext="Dopo costi CMMS"
                icon={<Activity size={24} />}
            />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pdf-break-inside-avoid">
            <div className="bg-[#f7f7f7] p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-[#3f4142] mb-4 text-center">Breakdown dei Risparmi</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={savingsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {savingsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-[#f7f7f7] p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-[#3f4142] mb-4 text-center">Confronto Costi (Annuale)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={comparisonData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(val) => `€${val/1000}k`} />
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            <Legend />
                            <Bar dataKey="Costi Attuali" fill="#9CA3AF" name="Attuale" />
                            <Bar dataKey="Con Mainsim" fill={BRAND_PURPLE} name="Con Mainsim" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Detailed breakdown table */}
        <div className="mb-12 pdf-break-inside-avoid">
            <h3 className="text-lg font-bold text-[#3f4142] mb-4">Dettaglio Finanziario</h3>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-[#f7f7f7]">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#3f4142]">Categoria Beneficio</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[#3f4142]">Assunzione Applicata</th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-[#3f4142]">Valore Annuo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Riduzione Fermo Macchina</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{results.appliedDowntimeReduction.toFixed(0)}% Riduzione</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 font-mono">{formatCurrency(results.downtimeSavings)}</td>
                        </tr>
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Produttività Tecnica</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{results.appliedEfficiencyGain.toFixed(0)}% Aumento Efficienza</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 font-mono">{formatCurrency(results.laborSavings)}</td>
                        </tr>
                        <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Efficienza Gestionale (Admin)</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                15 min risparmiati / Ordine Lavoro
                                <span className="block text-xs text-gray-400 font-normal">Risparmio tempo gestione & data entry</span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 font-mono">{formatCurrency(results.adminSavings)}</td>
                        </tr>
                         <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Ottimizzazione Ricambi</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{results.appliedMaterialSavings.toFixed(0)}% Risparmio</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 font-mono">{formatCurrency(results.materialSavings)}</td>
                        </tr>
                        <tr className="bg-purple-50">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-[#3f4142]">Risparmio Totale Annuo</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"></td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-[#6958dd] font-bold font-mono">{formatCurrency(results.totalAnnualSavings)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* AI Narrative Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pdf-break-inside-avoid">
             <div>
                <h3 className="text-lg font-bold text-[#3f4142] mb-3 border-b pb-2 border-gray-200">Benefici Qualitativi</h3>
                {loading ? (
                     <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-100 rounded"></div>
                        <div className="h-4 bg-gray-100 rounded"></div>
                        <div className="h-4 bg-gray-100 rounded"></div>
                    </div>
                ) : (
                    <div className="prose prose-sm prose-indigo text-gray-600">
                        <ReactMarkdown>{aiContent?.qualitativeBenefits || ""}</ReactMarkdown>
                    </div>
                )}
            </div>
             <div>
                <h3 className="text-lg font-bold text-[#3f4142] mb-3 border-b pb-2 border-gray-200">Raccomandazioni Strategiche</h3>
                {loading ? (
                     <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-100 rounded"></div>
                        <div className="h-4 bg-gray-100 rounded"></div>
                        <div className="h-4 bg-gray-100 rounded"></div>
                    </div>
                ) : (
                    <div className="prose prose-sm prose-indigo text-gray-600">
                        <ReactMarkdown>{aiContent?.recommendations || ""}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>

        {/* Modern Call to Action Box */}
        <div className="mt-16 bg-gradient-to-br from-[#6958dd] via-[#5b4bc4] to-[#4338ca] rounded-2xl p-10 md:p-12 text-center text-white shadow-xl relative overflow-hidden pdf-break-inside-avoid">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-900 opacity-20 rounded-full -ml-10 -mb-10 blur-xl"></div>
            
            <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Pronto per lo step successivo?</h3>
                <p className="text-purple-100 leading-relaxed text-lg max-w-2xl mx-auto mb-10">
                    Mettiti in contatto con i nostri esperti, ti aiuteranno a valutare le tue sfide e capire se il CMMS mainsim è la soluzione giusta per la tua azienda, guidandoti nel cambiamento.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                     <a 
                        href="https://www.mainsim.com/contatti/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto bg-white text-[#6958dd] hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        Parla con un esperto <ArrowRight size={20} />
                    </a>
                    
                    <a 
                        href="https://www.mainsim.com/brochure-mainsim-cmms/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto bg-purple-800/30 text-white hover:bg-purple-800/50 border border-purple-400/30 px-8 py-4 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all flex items-center justify-center gap-2"
                    >
                        <FileText size={20} /> Scarica Brochure
                    </a>
                </div>
            </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
             <img 
                src="https://mainsim.com/wp-content/uploads/2020/04/mainsim-logo-dark.png" 
                alt="mainsim logo" 
                className="h-8 mx-auto opacity-80 mb-4 grayscale hover:grayscale-0 transition-all"
                onError={(e) => {
                    // Fallback if image fails
                    e.currentTarget.style.display = 'none';
                }}
            />
            <p className="text-xs text-gray-400">
                Disclaimer: Questo report si basa su benchmark industriali. 
                Il Payback Period è calcolato sul risparmio "a regime" e non include i tempi di implementazione/onboarding (mediamente 3-6 mesi).
            </p>
        </div>

      </div>
    </div>
  );
};

export default ResultsView;