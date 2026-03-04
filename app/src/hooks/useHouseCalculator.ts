import { useMemo } from 'react';
import type { UserInput, CalculationResult, ScenarioResult } from '@/types';
import {
  shanghaiPolicy,
  calculateProvidentFundLimit,
  calculateDownPaymentRatio,
  calculateDeedTax,
  calculateAgencyFee,
  calculateMonthlyPayment,
  calculateLoanAmountByMonthlyPayment
} from '@/data/shanghaiPolicy';

const MIN_LOAN_YEARS = 5;
const MAX_LOAN_YEARS = 30;
const LIVING_RESERVE_MONTHS = 12;
const LOAN_BUFFER_MONTHS = 12;
const EMERGENCY_INCOME_FLOOR_MONTHS = 3;
const UPPER_RATIO_INCREMENT = 0.1;
const UPPER_RATIO_CAP = 0.6;
const BINARY_SEARCH_STEPS = 60;
const BINARY_GROWTH_STEPS = 30;
const INITIAL_PRICE_UPPER_BOUND = 100; // 万元
const LOW_FUND_TRIGGER_RULE_TEXT = '当可用资金-基线预留 <= 月生活费+负债月供时，进入低资金规划模式。';

interface LoanPlan {
  providentFundLoan: number;
  commercialLoan: number;
  providentFundPayment: number;
  commercialPayment: number;
  totalLoan: number;
  totalPayment: number;
}

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toFinite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function roundScenario(scenario: ScenarioResult): ScenarioResult {
  return {
    housePrice: roundTo2(scenario.housePrice),
    downPayment: roundTo2(scenario.downPayment),
    downPaymentRatio: roundTo2(scenario.downPaymentRatio),
    loanTotal: roundTo2(scenario.loanTotal),
    providentFundLoan: roundTo2(scenario.providentFundLoan),
    commercialLoan: roundTo2(scenario.commercialLoan),
    monthlyPayment: roundTo2(scenario.monthlyPayment),
    immediateCashNeeded: roundTo2(scenario.immediateCashNeeded),
    immediateGap: roundTo2(scenario.immediateGap),
    safetyTargetCashNeeded: roundTo2(scenario.safetyTargetCashNeeded),
    safetyGap: roundTo2(scenario.safetyGap),
    monthsToCloseImmediateGap: scenario.monthsToCloseImmediateGap,
    mandatoryReserve: roundTo2(scenario.mandatoryReserve),
    optionalReserve: roundTo2(scenario.optionalReserve),
    livingReserve: roundTo2(scenario.livingReserve),
    emergencyReserve: roundTo2(scenario.emergencyReserve),
    decoration: roundTo2(scenario.decoration),
    taxAndFee: roundTo2(scenario.taxAndFee),
    providentFundPayment: roundTo2(scenario.providentFundPayment),
    commercialPayment: roundTo2(scenario.commercialPayment)
  };
}

export function useHouseCalculator(input: UserInput): CalculationResult {
  return useMemo(() => {
    const monthlyIncome = Math.max(toFinite(input.monthlyIncome, 0), 0);
    const monthlyProvidentFund = Math.max(toFinite(input.monthlyProvidentFund, 0), 0);
    const providentFundBalance = Math.max(toFinite(input.providentFundBalance, 0), 0);
    const currentSavings = Math.max(toFinite(input.currentSavings, 0), 0);
    const existingDebts = Math.max(toFinite(input.existingDebts, 0), 0);
    const monthlyExpense = Math.max(toFinite(input.monthlyExpense, 0), 0);
    const houseArea = Math.max(toFinite(input.houseArea, 90), 1);
    const loanYears = Math.round(clamp(toFinite(input.loanYears, 30), MIN_LOAN_YEARS, MAX_LOAN_YEARS));
    const purchaseHorizonMonths = Math.round(Math.max(toFinite(input.purchaseHorizonMonths, 12), 0));
    const renovationCostPerSqm = Math.max(toFinite(input.renovationCostPerSqm, 4000), 0);
    const emergencyReserveMonths = Math.max(toFinite(input.emergencyReserveMonths, 6), 0);

    const incomeBase = monthlyIncome + monthlyProvidentFund;
    const totalAvailableFunds = currentSavings + providentFundBalance;

    const baseRatio = {
      conservative: 0.30,
      moderate: 0.40,
      aggressive: 0.50
    }[input.riskPreference];
    const safeRatio = baseRatio;
    const upperRatio = Math.min(baseRatio + UPPER_RATIO_INCREMENT, UPPER_RATIO_CAP);

    const safeMonthlyCap = Math.max(incomeBase * safeRatio - existingDebts, 0);
    const upperMonthlyCap = Math.max(incomeBase * upperRatio - existingDebts, 0);

    const monthlySurplus = Math.max(incomeBase - monthlyExpense - existingDebts, 0);
    const gapCapByHorizon = monthlySurplus * purchaseHorizonMonths;

    const livingReserve = monthlyExpense * LIVING_RESERVE_MONTHS;
    const emergencyReserve = Math.max(
      monthlyExpense * emergencyReserveMonths,
      incomeBase * EMERGENCY_INCOME_FLOOR_MONTHS
    );
    const decorationReserve = houseArea * renovationCostPerSqm / 10000;
    const baselineReserveAtZeroPrice = livingReserve + emergencyReserve + decorationReserve;
    const liquidityMargin = totalAvailableFunds - baselineReserveAtZeroPrice;
    const dynamicTriggerThreshold = monthlyExpense + existingDebts;
    const isLowFundMode = liquidityMargin <= dynamicTriggerThreshold;

    const providentFundRate = input.isFirstHome
      ? shanghaiPolicy.providentFund.firstHomeRate
      : shanghaiPolicy.providentFund.secondHomeRate;
    const commercialRate = Math.max(shanghaiPolicy.commercialLoan.currentLPR - 0.0045, 0);

    const maxProvidentFundLoan = calculateProvidentFundLimit(
      input.isFirstHome,
      input.isMultiChild,
      input.isGreenBuilding,
      input.hasSupplementaryProvidentFund
    );

    const policyMinDownPaymentRatio = calculateDownPaymentRatio(input.isFirstHome, input.houseType);

    const resolveLoanPlanByPaymentCap = (monthlyPaymentCap: number): LoanPlan => {
      const safeCap = Math.max(monthlyPaymentCap, 0);
      const providentFundLoanByCap = calculateLoanAmountByMonthlyPayment(
        safeCap,
        providentFundRate,
        loanYears
      );
      const providentFundLoan = Math.min(maxProvidentFundLoan, providentFundLoanByCap);
      const providentFundPayment = calculateMonthlyPayment(
        providentFundLoan,
        providentFundRate,
        loanYears
      );

      const remainingPayment = Math.max(safeCap - providentFundPayment, 0);
      const commercialLoan = calculateLoanAmountByMonthlyPayment(
        remainingPayment,
        commercialRate,
        loanYears
      );
      const commercialPayment = calculateMonthlyPayment(
        commercialLoan,
        commercialRate,
        loanYears
      );

      return {
        providentFundLoan,
        commercialLoan,
        providentFundPayment,
        commercialPayment,
        totalLoan: providentFundLoan + commercialLoan,
        totalPayment: providentFundPayment + commercialPayment
      };
    };

    const resolveLoanPlanByLoanAmount = (totalLoanAmount: number): LoanPlan => {
      const safeLoan = Math.max(totalLoanAmount, 0);
      const providentFundLoan = Math.min(maxProvidentFundLoan, safeLoan);
      const commercialLoan = Math.max(safeLoan - providentFundLoan, 0);
      const providentFundPayment = calculateMonthlyPayment(
        providentFundLoan,
        providentFundRate,
        loanYears
      );
      const commercialPayment = calculateMonthlyPayment(
        commercialLoan,
        commercialRate,
        loanYears
      );

      return {
        providentFundLoan,
        commercialLoan,
        providentFundPayment,
        commercialPayment,
        totalLoan: safeLoan,
        totalPayment: providentFundPayment + commercialPayment
      };
    };

    const createSnapshot = (housePrice: number, loanCapByMonthly: number): ScenarioResult => {
      const safeHousePrice = Math.max(housePrice, 0);
      const policyLoanMax = safeHousePrice * (1 - policyMinDownPaymentRatio);
      const loanTotal = Math.max(Math.min(loanCapByMonthly, policyLoanMax), 0);
      const loanPlan = resolveLoanPlanByLoanAmount(loanTotal);
      const downPayment = Math.max(safeHousePrice - loanTotal, 0);
      const downPaymentRatio = safeHousePrice > 0 ? downPayment / safeHousePrice : 0;

      const taxAndFee = calculateDeedTax(safeHousePrice, houseArea, input.isFirstHome)
        + calculateAgencyFee(safeHousePrice);
      const mandatoryReserve = livingReserve + emergencyReserve + decorationReserve + taxAndFee;
      const immediateCashNeeded = downPayment + mandatoryReserve;
      const optionalReserve = loanPlan.totalPayment * LOAN_BUFFER_MONTHS;
      const safetyTargetCashNeeded = immediateCashNeeded + optionalReserve;
      const immediateGap = immediateCashNeeded - totalAvailableFunds;
      const safetyGap = safetyTargetCashNeeded - totalAvailableFunds;
      const monthsToCloseImmediateGap = immediateGap > 0 && monthlySurplus > 0
        ? Math.ceil(immediateGap / monthlySurplus)
        : null;

      return {
        housePrice: safeHousePrice,
        downPayment,
        downPaymentRatio,
        loanTotal,
        providentFundLoan: loanPlan.providentFundLoan,
        commercialLoan: loanPlan.commercialLoan,
        monthlyPayment: loanPlan.totalPayment,
        immediateCashNeeded,
        immediateGap,
        safetyTargetCashNeeded,
        safetyGap,
        monthsToCloseImmediateGap,
        mandatoryReserve,
        optionalReserve,
        livingReserve,
        emergencyReserve,
        decoration: decorationReserve,
        taxAndFee,
        providentFundPayment: loanPlan.providentFundPayment,
        commercialPayment: loanPlan.commercialPayment
      };
    };

    const buildScenario = (monthlyCap: number, allowedGap: number): ScenarioResult => {
      const loanCapPlan = resolveLoanPlanByPaymentCap(monthlyCap);
      const loanCapByMonthly = loanCapPlan.totalLoan;

      const feasible = (housePrice: number): boolean => {
        const snapshot = createSnapshot(housePrice, loanCapByMonthly);
        return snapshot.immediateCashNeeded <= totalAvailableFunds + allowedGap;
      };

      let low = 0;
      let high = Math.max(
        INITIAL_PRICE_UPPER_BOUND,
        loanCapByMonthly + totalAvailableFunds + allowedGap
      );

      for (let i = 0; i < BINARY_GROWTH_STEPS && feasible(high); i += 1) {
        high *= 1.5;
      }

      for (let i = 0; i < BINARY_SEARCH_STEPS; i += 1) {
        const mid = (low + high) / 2;
        if (feasible(mid)) {
          low = mid;
        } else {
          high = mid;
        }
      }

      return roundScenario(createSnapshot(low, loanCapByMonthly));
    };

    const buildTargetScenario = (monthlyCap: number): ScenarioResult => {
      const loanCapByMonthly = resolveLoanPlanByPaymentCap(monthlyCap).totalLoan;
      if (loanCapByMonthly <= 0) {
        return roundScenario(createSnapshot(0, loanCapByMonthly));
      }

      const loanableRatio = Math.max(1 - policyMinDownPaymentRatio, 0);
      const targetHousePrice = loanableRatio > 0 ? loanCapByMonthly / loanableRatio : 0;
      return roundScenario(createSnapshot(targetHousePrice, loanCapByMonthly));
    };

    const safeScenario = isLowFundMode
      ? buildTargetScenario(safeMonthlyCap)
      : buildScenario(safeMonthlyCap, 0);
    const upperScenarioCandidate = isLowFundMode
      ? buildTargetScenario(upperMonthlyCap)
      : buildScenario(upperMonthlyCap, gapCapByHorizon);
    const upperScenario = upperScenarioCandidate.housePrice >= safeScenario.housePrice
      ? upperScenarioCandidate
      : safeScenario;

    const minDownPayment = upperScenario.housePrice * policyMinDownPaymentRatio;

    const stressRate1 = commercialRate + 0.01;
    const stressRate2 = commercialRate + 0.02;
    const stressPayment1 = calculateMonthlyPayment(safeScenario.commercialLoan, stressRate1, loanYears)
      + safeScenario.providentFundPayment;
    const stressPayment2 = calculateMonthlyPayment(safeScenario.commercialLoan, stressRate2, loanYears)
      + safeScenario.providentFundPayment;
    const incomeDecrease20Percent = Math.max(
      ((monthlyIncome * 0.8) + monthlyProvidentFund) * safeRatio - existingDebts,
      0
    );

    return {
      analysisMode: isLowFundMode ? 'low_fund' : 'standard',
      lowFundContext: {
        baselineReserveAtZeroPrice: roundTo2(baselineReserveAtZeroPrice),
        liquidityMargin: roundTo2(liquidityMargin),
        dynamicTriggerThreshold: roundTo2(dynamicTriggerThreshold),
        isTriggered: isLowFundMode,
        triggerRuleText: LOW_FUND_TRIGGER_RULE_TEXT
      },

      budgetRange: {
        safePrice: safeScenario.housePrice,
        upperPrice: upperScenario.housePrice
      },
      scenarios: {
        safe: safeScenario,
        upper: upperScenario
      },
      gapCapByHorizon: roundTo2(gapCapByHorizon),
      monthlySurplus: roundTo2(monthlySurplus),

      maxMonthlyPayment: roundTo2(upperMonthlyCap),
      recommendedMonthlyPayment: safeScenario.monthlyPayment,

      maxTotalLoan: upperScenario.loanTotal,
      providentFundLoan: safeScenario.providentFundLoan,
      commercialLoan: safeScenario.commercialLoan,

      maxHousePrice: upperScenario.housePrice,
      recommendedHousePrice: safeScenario.housePrice,

      downPaymentRatio: safeScenario.downPaymentRatio,
      policyMinDownPaymentRatio: roundTo2(policyMinDownPaymentRatio),
      minDownPayment: roundTo2(minDownPayment),
      recommendedDownPayment: safeScenario.downPayment,

      reservedCash: {
        livingExpense: safeScenario.livingReserve,
        decoration: safeScenario.decoration,
        taxAndFee: safeScenario.taxAndFee,
        medicalEmergency: safeScenario.emergencyReserve,
        loanBuffer: safeScenario.optionalReserve,
        other: 0,
        total: roundTo2(safeScenario.mandatoryReserve + safeScenario.optionalReserve)
      },

      totalCashNeeded: safeScenario.safetyTargetCashNeeded,
      cashGap: safeScenario.safetyGap,

      monthlyPaymentDetail: {
        providentFundPayment: safeScenario.providentFundPayment,
        commercialPayment: safeScenario.commercialPayment,
        totalPayment: safeScenario.monthlyPayment,
        loanYears
      },

      rates: {
        providentFundRate,
        commercialRate
      },

      stressTest: {
        rateIncrease1Percent: roundTo2(stressPayment1),
        rateIncrease2Percent: roundTo2(stressPayment2),
        incomeDecrease20Percent: roundTo2(incomeDecrease20Percent)
      }
    };
  }, [input]);
}
