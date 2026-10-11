import { describe, it, expect } from 'vitest';
import { recalculateBudget, updateEquipmentInBudget, BudgetBreakdown } from './budgetEngine.js';

describe('BudgetEngine', () => {
  const createMockBreakdown = (): BudgetBreakdown => ({
    premises: {
      items: [{ name: 'Lease deposit', amount: 50000, type: 'refundable', notes: '' }],
      subtotal: 50000,
    },
    machinery: {
      items: [{ name: 'Machine A', amount: 100000, type: 'one-time', notes: '' }],
      subtotal: 100000,
    },
    infrastructure: { items: [], subtotal: 0 },
    regulatory: { items: [], subtotal: 0 },
    operations: {
      items: [{ name: 'Staff Salary', amount: 30000, type: 'monthly', notes: '' }],
      subtotal: 30000,
    },
    financial: { items: [], subtotal: 0 },
    totalStartupCost: 0,
    monthlyOperatingCost: 0,
    budgetSufficiency: {
      isSufficient: false,
      shortfall: 0,
      surplus: 0,
      recommendations: [],
    },
  });

  it('should recalculate startup cost and check budget sufficiency when budget is sufficient', () => {
    const breakdown = createMockBreakdown();
    const result = recalculateBudget(breakdown, 500000);

    expect(result.premises.subtotal).toBe(50000);
    expect(result.machinery.subtotal).toBe(100000);
    // 3 months of recurring operational expenses included in startup working capital:
    expect(result.operations.subtotal).toBe(90000);
    expect(result.monthlyOperatingCost).toBe(30000);
    // Total startup = 50k + 100k + 90k = 240,000
    expect(result.totalStartupCost).toBe(240000);
    expect(result.budgetSufficiency.isSufficient).toBe(true);
    expect(result.budgetSufficiency.surplus).toBe(260000);
    expect(result.budgetSufficiency.shortfall).toBe(0);
  });

  it('should detect shortfall when available budget is insufficient', () => {
    const breakdown = createMockBreakdown();
    const result = recalculateBudget(breakdown, 100000);

    expect(result.budgetSufficiency.isSufficient).toBe(false);
    expect(result.budgetSufficiency.shortfall).toBe(140000);
    expect(result.budgetSufficiency.recommendations.length).toBeGreaterThan(0);
  });

  it('should correctly update equipment in budget and recalculate', () => {
    const breakdown = createMockBreakdown();
    const newEquipment = [
      { name: 'Oven', totalCost: 80000, installationCost: 5000 },
      { name: 'Mixer', totalCost: 40000, installationCost: 0 },
    ];

    const updated = updateEquipmentInBudget(breakdown, newEquipment);
    expect(updated.machinery.items.length).toBe(3); // 2 equipment + 1 installation
    
    // After recalculating budget
    const recalculated = recalculateBudget(updated, 500000);
    expect(recalculated.machinery.subtotal).toBe(125000);
  });
});
