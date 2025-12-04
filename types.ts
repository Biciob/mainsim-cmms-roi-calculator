export type IndustryType = 'Manufacturing' | 'Facility Management' | 'Retail' | 'Healthcare' | 'Logistics' | 'Hospitality' | 'Other';

export interface ROIInputs {
  // Context (Step 1)
  industry: IndustryType;
  numberOfSites: number;

  // Labor (Step 2)
  technicians: number;
  avgHourlyRate: number; // EUR
  weeklyHoursPerTech: number;
  
  // Downtime
  downtimeHoursPerYear: number;
  costPerDowntimeHour: number; // EUR
  
  // Inventory & Workflow
  annualMaintenanceMaterialSpend: number; // EUR
  totalWorkOrdersPerYear: number;
  avgTimePerWorkOrder: number; // Hours (administrative/process time)
  
  // Investment
  annualCmmsCost: number; // EUR
  
  // Optional / Advanced (Percentages) - if 0 or undefined, defaults will be used
  reductionDowntimePercent?: number;
  efficiencyWorkflowPercent?: number;
  savingsMaterialPercent?: number;
}

export interface ROICalculationResult {
  // Calculated Savings
  downtimeSavings: number;
  laborSavings: number;
  materialSavings: number;
  adminSavings: number;
  
  // Totals
  totalAnnualSavings: number;
  totalCostOfOwnership: number;
  
  // KPIs
  roiPercentage: number;
  paybackPeriodMonths: number;
  
  // Applied Rates (Inputs or Defaults)
  appliedDowntimeReduction: number;
  appliedEfficiencyGain: number;
  appliedMaterialSavings: number;
}

export interface AIReportContent {
  executiveSummary: string;
  qualitativeBenefits: string;
  recommendations: string;
}

export const DEFAULT_RATES = {
  DOWNTIME_REDUCTION: 0.20, // 20%
  WORKFLOW_EFFICIENCY: 0.25, // 25% - Restored to original standard
  MATERIAL_SAVINGS: 0.10, // 10%
  LABOR_OPTIMIZATION: 0.15 // 15%
};