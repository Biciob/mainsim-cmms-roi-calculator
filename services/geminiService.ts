import { GoogleGenAI } from "@google/genai";
import { ROICalculationResult, ROIInputs, AIReportContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateReportNarrative = async (
  inputs: ROIInputs,
  results: ROICalculationResult
): Promise<AIReportContent> => {
  
  const prompt = `
    Sei "ROI-Engineer", un consulente senior specializzato nel calcolo del ROI per l'adozione di un CMMS (mainsim).
    
    **CONTESTO CLIENTE:**
    - Settore: ${inputs.industry} (Adatta il linguaggio a questo settore: es. se Manifattura parla di impianti/linee, se Facility Management parla di edifici/asset immobiliari, se Sanità parla di sicurezza paziente/compliance).
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
    - Payback Period: ${results.paybackPeriodMonths.toFixed(1)} mesi
    - Risparmio da Fermo Macchina: €${results.downtimeSavings.toLocaleString()}
    - Efficienza/Risparmio Manodopera: €${(results.laborSavings + results.adminSavings).toLocaleString()}
    - Risparmio Materiali: €${results.materialSavings.toLocaleString()}

    **TASK:**
    Genera un oggetto JSON con tre chiavi: "executiveSummary", "qualitativeBenefits", e "recommendations".
    I valori devono essere stringhe formattate in Markdown.
    
    1. **executiveSummary**: Una panoramica di alto livello dell'impatto finanziario. Sii conciso, professionale e convincente per un C-level executive. Enfatizza il valore generato da mainsim specificamente per il settore ${inputs.industry}.
    2. **qualitativeBenefits**: Elenco puntato che descrive i benefici non monetari (es. sicurezza, compliance, visibilità dati, morale dei tecnici) pertinenti al settore ${inputs.industry} e alla gestione di ${inputs.numberOfSites} sedi.
    3. **recommendations**: Consigli strategici su come ottenere questi numeri (es. focus sull'adozione mobile, standardizzazione tra le ${inputs.numberOfSites} sedi).

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
      executiveSummary: "Impossibile generare l'Executive Summary in questo momento.",
      qualitativeBenefits: "Impossibile generare i benefici qualitativi in questo momento.",
      recommendations: "Impossibile generare le raccomandazioni in questo momento."
    };
  }
};