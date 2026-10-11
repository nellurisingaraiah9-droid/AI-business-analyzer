/**
 * Deterministic Budget Calculation Engine
 * 
 * All calculations are server-side. The engine recalculates totals
 * from individual line items to prevent double-counting and ensure consistency.
 */

export interface BudgetLineItem {
  name: string;
  amount: number;
  type: 'one-time' | 'monthly' | 'annual' | 'refundable';
  notes: string;
}

export interface BudgetCategory {
  items: BudgetLineItem[];
  subtotal: number;
}

export interface BudgetBreakdown {
  premises: BudgetCategory;
  machinery: BudgetCategory;
  infrastructure: BudgetCategory;
  regulatory: BudgetCategory;
  operations: BudgetCategory;
  financial: BudgetCategory;
  totalStartupCost: number;
  monthlyOperatingCost: number;
  budgetSufficiency: {
    isSufficient: boolean;
    shortfall: number;
    surplus: number;
    recommendations: string[];
  };
}

export function recalculateBudget(
  breakdown: BudgetBreakdown,
  availableBudget: number
): BudgetBreakdown {
  const categories: (keyof Pick<BudgetBreakdown, 'premises' | 'machinery' | 'infrastructure' | 'regulatory' | 'operations' | 'financial'>)[] = 
    ['premises', 'machinery', 'infrastructure', 'regulatory', 'operations', 'financial'];

  let totalStartupCost = 0;
  let totalMonthlyCost = 0;

  for (const cat of categories) {
    const category = breakdown[cat];
    if (!category || !Array.isArray(category.items)) {
      (breakdown as any)[cat] = { items: [], subtotal: 0 };
      continue;
    }

    // Recalculate subtotal from items (one-time costs only for startup)
    let subtotal = 0;
    for (const item of category.items) {
      item.amount = Math.round(Math.max(0, Number(item.amount) || 0));
      if (item.type === 'one-time' || item.type === 'refundable') {
        subtotal += item.amount;
      } else if (item.type === 'monthly') {
        // Include 3 months of recurring costs in startup
        subtotal += item.amount * 3;
        totalMonthlyCost += item.amount;
      } else if (item.type === 'annual') {
        subtotal += item.amount;
      }
    }

    category.subtotal = subtotal;
    totalStartupCost += subtotal;
  }

  breakdown.totalStartupCost = totalStartupCost;
  breakdown.monthlyOperatingCost = totalMonthlyCost;

  const diff = availableBudget - totalStartupCost;
  
  const recommendations: string[] = [];
  if (diff >= 0) {
    recommendations.push(`Budget has a surplus of ₹${diff.toLocaleString('en-IN')}`);
    if (diff < totalStartupCost * 0.1) {
      recommendations.push('Budget is tight — consider maintaining a larger contingency reserve');
    }
  } else {
    recommendations.push(`Budget shortfall of ₹${Math.abs(diff).toLocaleString('en-IN')}`);
    recommendations.push('Consider reducing scope, phasing the setup, or arranging additional funding');
    
    if (breakdown.premises.subtotal > availableBudget * 0.3) {
      recommendations.push('Premises costs are significant — consider leasing instead of purchasing');
    }
    if (breakdown.machinery.subtotal > availableBudget * 0.4) {
      recommendations.push('Machinery costs are high — consider used equipment or phased procurement');
    }
  }

  breakdown.budgetSufficiency = {
    isSufficient: diff >= 0,
    shortfall: Math.max(0, -diff),
    surplus: Math.max(0, diff),
    recommendations,
  };

  return breakdown;
}

export function updateEquipmentInBudget(
  breakdown: BudgetBreakdown,
  equipmentItems: Array<{ name: string; totalCost: number; installationCost: number }>
): BudgetBreakdown {
  // Replace machinery items with actual equipment selections
  const machineryItems: BudgetLineItem[] = [];
  
  for (const eq of equipmentItems) {
    machineryItems.push({
      name: eq.name,
      amount: eq.totalCost,
      type: 'one-time',
      notes: 'Based on equipment selection',
    });
    
    if (eq.installationCost > 0) {
      machineryItems.push({
        name: `${eq.name} — Installation`,
        amount: eq.installationCost,
        type: 'one-time',
        notes: 'Installation cost',
      });
    }
  }

  breakdown.machinery.items = machineryItems;
  return breakdown;
}
