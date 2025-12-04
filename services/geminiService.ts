import { GoogleGenAI } from "@google/genai";
import { ROICalculationResult, ROIInputs, AIReportContent } from "../types";

// Gestione robusta delle variabili d'ambiente per diversi bundler (Vite, CRA, Next.js) su Vercel
const getApiKey = () => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
  if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;
  return process.env.API_KEY;
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateReportNarrative = async (
  inputs: ROIInputs,
  results: ROICalculationResult
): Promise<AIReportContent> => {
  
  if (!ai) {
    console.warn("API Key mancante. Generazione report AI saltata.");
    return {
      executiveSummary: "Configurazione API Key mancante. Impossibile generare il report AI. Assicurati di aver impostato VITE_API_KEY o REACT_APP_API_KEY su Vercel.",
      qualitativeBenefits: "Dati non disponibili.",
      recommendations: "Dati non disponibili."
    };
  }

  // Costruzione del contesto specifico per settore
  let industryContext = "";
  if (inputs.industry === 'Industria Alimentare') {
    industryContext = "Settore: Industria Alimentare (Food & Beverage). È FONDAMENTALE che il linguaggio rifletta le priorità di questo settore: Compliance normativa stringente (HACCP, FDA, BRC, IFS), Sicurezza Alimentare, tracciabilità lotti, audit readiness e gestione della catena del freddo/deperibilità. Il fermo macchina qui significa rischio deterioramento materie prime (spreco alimentare).";
  } else {
    industryContext = `Settore: ${inputs.industry}. (Adatta il linguaggio: es. Manifattura = linee/OEE; Facility = asset/edifici/ticket SLA; Sanità = sicurezza paziente/accreditamento).`;
  }

  const prompt = `
    Sei "ROI-Engineer", un consulente senior specializzato nel calcolo del ROI per l'adozione di un CMMS (mainsim).
    
    **CONTESTO CLIENTE:**
    - ${industryContext}
    - Numero di sedi/siti: ${inputs.numberOfSites}
    
    **DATI DI INPUT:**
    - Tecnici: ${inputs.technicians}
    - Ore di fermo annuali: ${inputs.downtimeHoursPerYear}
    - Costo orario fermo: €${inputs.costPerDowntimeHour}
    - Spesa materiali: €${inputs.annualMaintenanceMaterialSpend}
    - Costo annuale CMMS: €${inputs.annualCmmsCost}

    **RISULTATI CALCOLATI:**
    - Risparmio Totale Annuo: €${results.totalAnnualSavings.toLocaleString()}
    - ROI: ${results.roiPercentage.toFixed(1)}%
    - Payback Period (calcolato a partire dalla piena operatività/regime del sistema): ${results.paybackPeriodMonths.toFixed(1)} mesi
    - Risparmio da Fermo Macchina: €${results.downtimeSavings.toLocaleString()}
    - Efficienza/Risparmio Manodopera: €${(results.laborSavings + results.adminSavings).toLocaleString()}
    - Risparmio Materiali: €${results.materialSavings.toLocaleString()}

    **TASK:**
    Genera un oggetto JSON con tre chiavi: "executiveSummary", "qualitativeBenefits", e "recommendations".
    I valori devono essere stringhe formattate in Markdown.
    
    1. **executiveSummary**: Una panoramica di alto livello dell'impatto finanziario. Sii conciso, professionale e convincente per un C-level executive. Enfatizza il valore generato da mainsim specificamente per il settore richiesto. **IMPORTANTE**: Quando citi il Payback Period, specifica esplicitamente che si intende "a regime" o "dalla piena operatività" del software.
    2. **qualitativeBenefits**: Elenco puntato che descrive i benefici non monetari.
       - Se Industria Alimentare: cita Audit, HACCP, FDA, Tracciabilità, Sicurezza Alimentare.
       - Altrimenti: generici ma rilevanti (morale tecnici, SLA, compliance).
    3. **recommendations**: Consigli strategici su come ottenere questi numeri (es. adozione mobile, integrazioni IoT, standardizzazione processi).

    **STILE:**
    - Professionale, stile consulenziale "Big 4".
    - Niente fronzoli.
    - Usa il grassetto per enfatizzare i punti chiave.
    - Lingua: ITALIANO.
    - Restituisci SOLO il JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Nessuna risposta dall'AI");
    
    return JSON.parse(text) as AIReportContent;
  } catch (error) {
    console.error("Errore generazione report:", error);
    return {
      executiveSummary: "Si è verificato un errore durante la generazione dell'analisi AI. Verifica la tua connessione o la quota API.",
      qualitativeBenefits: "Impossibile generare i benefici qualitativi in questo momento.",
      recommendations: "Impossibile generare le raccomandazioni in questo momento."
    };
  }
};