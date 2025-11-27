import React from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, TrendingUp, Clock, DollarSign, Activity } from 'lucide-react';
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
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-[#3f4142] mt-2">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{subtext}</p>
      </div>
      <div className="p-3 bg-purple-50 rounded-lg text-[#6958dd]">
        {icon}
      </div>
    </div>
  </div>
);

const ResultsView: React.FC<ResultsViewProps> = ({ inputs, results, aiContent, loading, onReset }) => {
  
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center no-print">
        <button onClick={onReset} className="text-sm text-gray-500 hover:text-[#6958dd] underline">
          ← Modifica Input
        </button>
        <div className="flex gap-3">
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-[#3f4142] text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-sm font-medium"
            >
                <Download size={18} />
                Scarica PDF
            </button>
        </div>
      </div>

      {/* Report Header */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
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
        <div className="mb-8">
            <h2 className="text-lg font-bold text-[#3f4142] mb-3 uppercase tracking-wider text-xs">Executive Summary</h2>
            {loading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            ) : (
                <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 print-break-before">
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
        <div className="mb-12">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print-break-before">
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
        
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
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