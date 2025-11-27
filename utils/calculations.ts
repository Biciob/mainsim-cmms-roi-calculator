import { ROIInputs, ROICalculationResult, DEFAULT_RATES } from "../types";

export const calculateROI = (inputs: ROIInputs): ROICalculationResult => {
  // 1. Determine Rates (User input or Conservative Default)
  const downtimeRate = inputs.reductionDowntimePercent 
    ? inputs.reductionDowntimePercent / 100 
    : DEFAULT_RATES.DOWNTIME_REDUCTION;
    
  const efficiencyRate = inputs.efficiencyWorkflowPercent 
    ? inputs.efficiencyWorkflowPercent / 100 
    : DEFAULT_RATES.WORKFLOW_EFFICIENCY;
    
  const materialRate = inputs.savingsMaterialPercent 
    ? inputs.savingsMaterialPercent / 100 
    : DEFAULT_RATES.MATERIAL_SAVINGS;

  // 2. Calculate Base Costs
  const totalAnnualLaborCost = inputs.technicians * inputs.avgHourlyRate * inputs.weeklyHoursPerTech * 52;
  const annualDowntimeCost = inputs.downtimeHoursPerYear * inputs.costPerDowntimeHour;
  
  // 3. Calculate Savings
  
  // Downtime Savings = (Downtime Cost * Reduction %)
  const downtimeSavings = annualDowntimeCost * downtimeRate;

  // Labor Savings (Technician Efficiency) = Labor Cost * Efficiency Rate
  // This represents time saved finding parts, manual paperwork, travelling, etc.
  const laborSavings = totalAnnualLaborCost * efficiencyRate;

  // Admin/Workflow Savings (Specific Work Order Optimization)
  // Represents "Management Efficiency": saving time on data entry, reporting, phone calls per ticket.
  let adminSavings = 0;
  if (inputs.totalWorkOrdersPerYear > 0) {
     // Assume saving 15 minutes (0.25h) per WO on data entry/reporting is standard with CMMS
     const hoursSavedPerYear = inputs.totalWorkOrdersPerYear * 0.25;
     adminSavings = hoursSavedPerYear * (inputs.avgHourlyRate * 1.2); // Assume admin rate is slightly higher (20%) than tech rate
  }

  // Material Savings
  const materialSavings = inputs.annualMaintenanceMaterialSpend * materialRate;

  // 4. Totals
  const totalAnnualSavings = downtimeSavings + laborSavings + adminSavings + materialSavings;
  
  // 5. ROI & Payback
  // ROI = (Net Savings / Cost) * 100
  // Net Savings = Total Savings - CMMS Cost
  const netSavings = totalAnnualSavings - inputs.annualCmmsCost;
  
  let roiPercentage = 0;
  if (inputs.annualCmmsCost > 0) {
    roiPercentage = (netSavings / inputs.annualCmmsCost) * 100;
  }

  let paybackPeriodMonths = 0;
  if (totalAnnualSavings > 0) {
    paybackPeriodMonths = (inputs.annualCmmsCost / totalAnnualSavings) * 12;
  }

  return {
    downtimeSavings,
    laborSavings,
    materialSavings,
    adminSavings,
    totalAnnualSavings,
    totalCostOfOwnership: inputs.annualCmmsCost,
    roiPercentage,
    paybackPeriodMonths,
    appliedDowntimeReduction: downtimeRate * 100,
    appliedEfficiencyGain: efficiencyRate * 100,
    appliedMaterialSavings: materialRate * 100
  };
};