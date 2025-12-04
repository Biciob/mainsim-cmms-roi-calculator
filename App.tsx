import React, { useState } from 'react';
import InputField from './components/InputField';
import ResultsView from './components/ResultsView';
import { ROIInputs, ROICalculationResult, AIReportContent, DEFAULT_RATES, IndustryType } from './types';
import { calculateROI } from './utils/calculations';
import { generateReportNarrative } from './services/geminiService';
import { Calculator, ArrowRight, Check, Building2, Info, ExternalLink } from 'lucide-react';

const initialInputs: ROIInputs = {
  industry: 'Facility Management',
  numberOfSites: 1,
  technicians: 5,
  avgHourlyRate: 35,
  weeklyHoursPerTech: 40,
  downtimeHoursPerYear: 120,
  costPerDowntimeHour: 500,
  annualMaintenanceMaterialSpend: 50000,
  totalWorkOrdersPerYear: 2500,
  avgTimePerWorkOrder: 1,
  annualCmmsCost: 15000,
  reductionDowntimePercent: 0,
  efficiencyWorkflowPercent: 0,
  savingsMaterialPercent: 0
};

// Mainsim Brand Colors
// const BRAND_PURPLE = '#6958dd';
// const BRAND_DARK = '#3f4142';

const INDUSTRIES: IndustryType[] = [
    'Facility Management',
    'Manufacturing', 
    'Industria Alimentare',
    'Retail', 
    'Logistics', 
    'Healthcare', 
    'Hospitality', 
    'Other'
];

export default function App() {
  const [step, setStep] = useState<'context' | 'data' | 'results'>('context');
  const [inputs, setInputs] = useState<ROIInputs>(initialInputs);
  const [results, setResults] = useState<ROICalculationResult | null>(null);
  const [aiContent, setAiContent] = useState<AIReportContent | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name: string, value: number | string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = async () => {
    // 1. Calculate Math
    const calcResults = calculateROI(inputs);
    setResults(calcResults);
    setStep('results');
    setLoading(true);
    
    // 2. Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 3. Generate Narrative
    const narrative = await generateReportNarrative(inputs, calcResults);
    setAiContent(narrative);
    setLoading(false);
  };

  // Dynamic Labels based on Industry
  const getIndustryLabels = (industry: IndustryType) => {
    switch (industry) {
        case 'Manufacturing':
            return {
                sites: 'Stabilimenti / Impianti',
                downtime: 'Ore Fermo Linea (Stima Annuale)',
                downtimeCost: 'Costo Orario Fermo Linea',
                workOrder: 'Ordini di Lavoro (Stima Annuale)',
                material: 'Spesa Ricambi (Stima Annuale)'
            };
        case 'Industria Alimentare':
            return {
                sites: 'Stabilimenti / Linee Produttive',
                downtime: 'Ore Fermo / Rischio Deperibilità',
                downtimeCost: 'Costo Fermo + Spreco Prodotto',
                workOrder: 'OdL / Controlli Qualità & HACCP',
                material: 'Ricambi e Consumabili'
            };
        case 'Facility Management':
        case 'Retail':
        case 'Hospitality':
            return {
                sites: 'Edifici / Sedi Gestite',
                downtime: 'Ore Indisponibilità Asset (Stima Annuale)',
                downtimeCost: 'Costo Disservizio / Penali',
                workOrder: 'Ticket / Interventi (Stima Annuale)',
                material: 'Spesa Materiali (Stima Annuale)'
            };
        case 'Healthcare':
            return {
                sites: 'Strutture / Presidi',
                downtime: 'Ore Fermo Apparecchiature (Stima Annuale)',
                downtimeCost: 'Costo Orario Disservizio',
                workOrder: 'OdL Clinici/Tecnici (Stima Annuale)',
                material: 'Spesa Ricambi (Stima Annuale)'
            };
        default:
            return {
                sites: 'Numero di Sedi',
                downtime: 'Ore di Fermo (Stima Annuale)',
                downtimeCost: 'Costo per Ora di Fermo',
                workOrder: 'Ordini di Lavoro (Stima Annuale)',
                material: 'Spesa Materiali (Stima Annuale)'
            };
    }
  };

  const labels = getIndustryLabels(inputs.industry);

  // Timeline Helper
  const getStepStatus = (currentStep: number) => {
      const stepMap = { 'context': 1, 'data': 2, 'results': 3 };
      const current = stepMap[step];
      if (current > currentStep) return 'completed';
      if (current === currentStep) return 'active';
      return 'pending';
  };

  const renderStepIcon = (stepNumber: number, label: string) => {
      const status = getStepStatus(stepNumber);
      const isCompleted = status === 'completed';
      const isActive = status === 'active';
      
      return (
          <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isCompleted ? 'bg-[#3f4142] text-white' : ''}
                  ${isActive ? 'bg-[#6958dd] text-white ring-4 ring-purple-100 shadow-lg' : ''}
                  ${status === 'pending' ? 'bg-white border border-gray-200 text-gray-300' : ''}
              `}>
                  {isCompleted ? <Check size={16} /> : stepNumber}
              </div>
              <span className={`text-sm font-semibold hidden md:block
                  ${isActive ? 'text-[#6958dd]' : 'text-gray-400'}
                  ${isCompleted ? 'text-[#3f4142]' : ''}
              `}>{label}</span>
          </div>
      );
  };

  return (
    <div className="min-h-screen pb-12 bg-[#f7f7f7] font-sans text-[#3f4142] flex flex-col">
      
      {/* Compact Header with Title & Workflow */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            {/* Left: Title */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="bg-purple-50 p-2 rounded-lg text-[#6958dd]">
                    <Calculator className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-[#3f4142] leading-tight">ROI Calculator</h1>
                    <p className="text-xs text-gray-500">by mainsim</p>
                </div>
            </div>

            {/* Center: Timeline */}
            <div className="flex items-center gap-4 md:gap-8">
                {renderStepIcon(1, 'Contesto')}
                <div className="w-8 h-px bg-gray-200 hidden md:block"></div>
                {renderStepIcon(2, 'Dati')}
                <div className="w-8 h-px bg-gray-200 hidden md:block"></div>
                {renderStepIcon(3, 'Report')}
            </div>

            {/* Right: Actions & Logo */}
            <div className="flex items-center gap-6 shrink-0">
                 <a 
                    href="https://www.mainsim.com/richiesta-demo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#6958dd] transition-colors"
                 >
                    Torna al sito <ExternalLink size={16} />
                 </a>
                 <img 
                    src="https://mainsim.com/wp-content/uploads/2020/04/mainsim-logo-dark.png" 
                    alt="mainsim logo" 
                    className="h-6 md:h-8 opacity-90"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-grow w-full">
        
        {/* Step 1: Context */}
        {step === 'context' && (
             <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 pb-4 text-center">
                        <h2 className="text-2xl font-bold text-[#3f4142] mb-2">Iniziamo dal contesto</h2>
                        <p className="text-gray-500">Selezionando il settore corretto, adatteremo le domande e i calcoli alla tua operatività.</p>
                    </div>

                    <div className="p-8 pt-4 space-y-6">
                        <div>
                             <label className="block text-sm font-semibold text-[#3f4142] mb-2">Settore di Attività</label>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {INDUSTRIES.map((ind) => (
                                    <button
                                        key={ind}
                                        onClick={() => handleInputChange('industry', ind)}
                                        className={`p-3 rounded-lg border text-left text-sm transition-all flex items-center justify-between
                                            ${inputs.industry === ind 
                                                ? 'border-[#6958dd] bg-purple-50 text-[#6958dd] font-semibold shadow-sm' 
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {ind}
                                        {inputs.industry === ind && <Check size={16} />}
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#3f4142] mb-2">{labels.sites}</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="number" 
                                    min="1"
                                    value={inputs.numberOfSites}
                                    onChange={(e) => handleInputChange('numberOfSites', parseInt(e.target.value) || 1)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#6958dd] focus:border-[#6958dd]"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Usato per stimare la complessità della gestione multi-sito.</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 px-8 py-6 flex justify-end border-t border-gray-100">
                        <button 
                            onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); setStep('data'); }}
                            className="flex items-center gap-2 bg-[#3f4142] text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition-all"
                        >
                            Prosegui <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* Step 2: Data Input */}
        {step === 'data' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            
            {/* Smart Estimation Box */}
            <div className="bg-white border border-gray-200 p-6 mb-8 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#6958dd]"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[#6958dd] text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Stima Intelligente</span>
                        <h4 className="font-bold text-[#3f4142] text-lg">Non hai tutti i numeri?</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        Il nostro motore utilizzerà benchmark specifici per il settore <strong>{inputs.industry}</strong> per completare i dati mancanti.
                        Concentrati sui parametri che conosci, al resto pensiamo noi.
                    </p>
                </div>
                 {/* Decorative background circle */}
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-50 rounded-full z-0 opacity-50"></div>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[#3f4142]">Parametri Operativi</h2>
                        <p className="text-gray-500 text-sm mt-1">Configurazione per: <span className="font-medium text-[#6958dd]">{inputs.industry}</span></p>
                    </div>
                    <button onClick={() => setStep('context')} className="text-sm text-gray-400 hover:text-[#6958dd] underline">Modifica Contesto</button>
                </div>
                
                <div className="p-8 space-y-10">
                    {/* Section 1: Team & Labor */}
                    <div>
                        <h3 className="text-lg font-bold text-[#3f4142] mb-1 flex items-center gap-3">
                            <span className="bg-[#f7f7f7] text-[#6958dd] w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border border-gray-200">A</span>
                            Team e Manodopera
                        </h3>
                        <p className="text-xs text-gray-400 mb-6 ml-11 italic">Non hai questi dati? Inserisci una stima.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Numero di Tecnici/Manutentori" name="technicians" value={inputs.technicians} onChange={handleInputChange} />
                            <InputField label="Costo Orario Medio (€)" name="avgHourlyRate" value={inputs.avgHourlyRate} onChange={handleInputChange} prefix="€" />
                            <InputField label="Ore Settimanali per Tecnico" name="weeklyHoursPerTech" value={inputs.weeklyHoursPerTech} onChange={handleInputChange} suffix="h" />
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100"></div>

                    {/* Section 2: Downtime */}
                    <div>
                        <h3 className="text-lg font-bold text-[#3f4142] mb-1 flex items-center gap-3">
                             <span className="bg-[#f7f7f7] text-[#6958dd] w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border border-gray-200">B</span>
                             Impatto Fermi / Disservizi
                        </h3>
                        <p className="text-xs text-gray-400 mb-6 ml-11 italic">Non hai questi dati? Inserisci una stima.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label={labels.downtime} name="downtimeHoursPerYear" value={inputs.downtimeHoursPerYear} onChange={handleInputChange} suffix="h" />
                            <InputField 
                                label={labels.downtimeCost} 
                                name="costPerDowntimeHour" 
                                value={inputs.costPerDowntimeHour} 
                                onChange={handleInputChange} 
                                prefix="€" 
                                tooltip="Includi la perdita di fatturato, costi penali o costi generali durante il guasto/indisponibilità." 
                            />
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100"></div>

                     {/* Section 3: Operations */}
                     <div>
                        <h3 className="text-lg font-bold text-[#3f4142] mb-1 flex items-center gap-3">
                             <span className="bg-[#f7f7f7] text-[#6958dd] w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border border-gray-200">C</span>
                             Workflow e Materiali
                        </h3>
                        <p className="text-xs text-gray-400 mb-6 ml-11 italic">Non hai questi dati? Inserisci una stima.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label={labels.workOrder} name="totalWorkOrdersPerYear" value={inputs.totalWorkOrdersPerYear} onChange={handleInputChange} />
                            <InputField label={labels.material} name="annualMaintenanceMaterialSpend" value={inputs.annualMaintenanceMaterialSpend} onChange={handleInputChange} prefix="€" />
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100"></div>

                     {/* Section 4: Investment */}
                     <div className="bg-[#f7f7f7] p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-bold text-[#3f4142] mb-6 flex items-center gap-3">
                             <span className="bg-[#3f4142] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-md">D</span>
                             Investimento
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Costo Annuale Stimato CMMS" name="annualCmmsCost" value={inputs.annualCmmsCost} onChange={handleInputChange} prefix="€" />
                        </div>
                        
                        {/* Disclaimer Costi CMMS */}
                        <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600">
                            <div className="flex gap-3 items-start">
                                <Info className="shrink-0 text-[#6958dd] mt-0.5" size={18} />
                                <div>
                                    <p className="mb-2 text-[#3f4142]">
                                        <strong>Struttura Costi:</strong> Il budget per un CMMS si compone tipicamente di <strong>Licenze Ricorrenti</strong> (OPEX, variabili per utente/anno) e <strong>Servizi di Avviamento e Onboarding</strong> una tantum (CAPEX) che includono configurazione, personalizzazioni, training ed eventuali integrazioni con altri sistemi in uso, pagati solo il primo anno.
                                    </p>
                                    <p>
                                        Il valore sopra è una stima "all-inclusive" (Licenze + Servizi) per il primo anno. Per un'analisi dettagliata, 
                                        <a href="https://www.mainsim.com/contatti/" target="_blank" rel="noopener noreferrer" className="text-[#6958dd] font-bold hover:underline ml-1">
                                            parla con un nostro esperto
                                        </a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Settings Toggle */}
                    <div className="pt-2">
                        <details className="group bg-white rounded-lg border border-gray-200 overflow-hidden" open={false}>
                            <summary className="flex cursor-pointer items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors select-none">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-[#3f4142]">Avanzate: Personalizza Benchmark</span>
                                </div>
                                <span className="text-gray-400 transition group-open:rotate-180">▼</span>
                            </summary>
                            <div className="p-6 border-t border-gray-200 bg-gray-50/50">
                                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                    Di default, utilizziamo stime conservative basate sulla media dei clienti mainsim nel settore {inputs.industry}. 
                                    Se hai KPI specifici, inseriscili qui sotto. (Lascia 0 per default).
                                </p>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    <InputField 
                                        label="Riduzione Fermi %" 
                                        name="reductionDowntimePercent" 
                                        value={inputs.reductionDowntimePercent || 0} 
                                        onChange={handleInputChange} 
                                        suffix="%"
                                        tooltip={`Valore standard suggerito: ${DEFAULT_RATES.DOWNTIME_REDUCTION * 100}%`}
                                    />
                                    <InputField 
                                        label="Efficienza Tecnici %" 
                                        name="efficiencyWorkflowPercent" 
                                        value={inputs.efficiencyWorkflowPercent || 0} 
                                        onChange={handleInputChange} 
                                        suffix="%"
                                        tooltip={`Valore standard suggerito: ${DEFAULT_RATES.WORKFLOW_EFFICIENCY * 100}%`}
                                    />
                                    <InputField 
                                        label="Risparmio Materiali %" 
                                        name="savingsMaterialPercent" 
                                        value={inputs.savingsMaterialPercent || 0} 
                                        onChange={handleInputChange} 
                                        suffix="%"
                                        tooltip={`Valore standard suggerito: ${DEFAULT_RATES.MATERIAL_SAVINGS * 100}%`}
                                    />
                                </div>
                            </div>
                        </details>
                    </div>

                </div>

                <div className="bg-gray-50 px-8 py-6 flex justify-end border-t border-gray-100">
                    <button 
                        onClick={handleCalculate}
                        className="flex items-center gap-2 bg-[#6958dd] text-white px-8 py-3.5 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Genera Report ROI <ArrowRight size={20} />
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && results && (
          <ResultsView 
            inputs={inputs} 
            results={results} 
            aiContent={aiContent} 
            loading={loading}
            onReset={() => setStep('data')}
          />
        )}
      </main>

      <footer className="text-center py-6 text-gray-400 text-sm no-print">
         ©2025 mainsim - what maintenance can be | Designed with ❤️ for maintenance professionals.
      </footer>
    </div>
  );
}