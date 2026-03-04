import type { ShanghaiPolicy } from '@/types';

// 上海购房政策（2026-02-26起执行口径）
export const shanghaiPolicy: ShanghaiPolicy = {
  // 限购政策
  purchaseLimit: {
    localFamily: '沪籍居民家庭和沪籍成年单身人士：外环外不限套数，外环内限购2套',
    nonLocalFamily: '非沪籍居民家庭和成年单身人士：社保/个税连续满1年可外环外不限套数且外环内限购1套；连续满3年可外环内限购2套；持《上海市居住证》满5年可全市限购1套（无需社保/个税证明）',
    multiChild: '多子女家庭在公积金贷款方面可享受额度上浮，且第二套改善型住房贷款额度同样适用上浮政策'
  },
  
  // 公积金政策（2026年2月新政）
  providentFund: {
    // 首套家庭基础最高200万（不含补充公积金）
    firstHomeMax: 200,
    // 二套改善家庭基础最高160万（不含补充公积金）
    secondHomeMax: 160,
    // 首套房利率：5年以上2.6%
    firstHomeRate: 0.026,
    // 二套房利率：5年以上3.075%
    secondHomeRate: 0.03075,
    // 首套房首付比例：20%
    downPaymentFirst: 0.20,
    // 二套房首付比例：25%（临港等6区20%）
    downPaymentSecond: 0.25
  },
  
  // 商业贷款政策
  commercialLoan: {
    // 首套房首付比例：15%
    firstHomeDownPayment: 0.15,
    // 二套房首付比例（差异化区域最低可20%）
    secondHomeDownPayment: 0.25,
    // 当前5年期LPR：3.5%
    currentLPR: 0.035
  },
  
  // 税费政策
  taxes: {
    // 首套房≤140㎡契税：1%
    deedTaxFirstUnder140: 0.01,
    // 首套房>140㎡契税：1.5%
    deedTaxFirstOver140: 0.015,
    // 二套房≤140㎡契税：1%
    deedTaxSecondUnder140: 0.01,
    // 二套房>140㎡契税：2%
    deedTaxSecondOver140: 0.02,
    // 中介费：约2%
    agencyFee: 0.02
  }
};

// 公积金上浮政策说明
export const providentFundBonus = {
  // 多子女家庭上浮20%
  multiChildBonus: 0.20,
  // 绿色建筑和装配式建筑上浮
  greenBuildingBonus: 0.15,
  // 两者叠加最高上浮35%
  maxBonus: 0.35
};

// 补充公积金可增加的家庭贷款额度（万元）
export const supplementaryProvidentFundBonus = {
  familyExtraLimit: 40
};

// 计算公积金额度（考虑上浮）
export function calculateProvidentFundLimit(
  isFirstHome: boolean,
  isMultiChild: boolean,
  isGreenBuilding: boolean,
  hasSupplementaryProvidentFund: boolean
): number {
  const baseLimit = isFirstHome 
    ? shanghaiPolicy.providentFund.firstHomeMax 
    : shanghaiPolicy.providentFund.secondHomeMax;

  const supplementaryLimit = hasSupplementaryProvidentFund
    ? supplementaryProvidentFundBonus.familyExtraLimit
    : 0;
  const policyBaseLimit = baseLimit + supplementaryLimit;
  
  let bonus = 0;
  if (isMultiChild) bonus += providentFundBonus.multiChildBonus;
  if (isGreenBuilding) bonus += providentFundBonus.greenBuildingBonus;
  
  // 最高上浮35%
  bonus = Math.min(bonus, providentFundBonus.maxBonus);
  
  return policyBaseLimit * (1 + bonus);
}

// 计算首付比例
export function calculateDownPaymentRatio(
  isFirstHome: boolean,
  houseType: 'within' | 'outside'
): number {
  if (isFirstHome) {
    return shanghaiPolicy.providentFund.downPaymentFirst;
  } else {
    // 二套房：外环外部分区域可20%，其他25%
    return houseType === 'outside' 
      ? 0.20 
      : shanghaiPolicy.providentFund.downPaymentSecond;
  }
}

// 计算契税
export function calculateDeedTax(
  housePrice: number,
  houseArea: number,
  isFirstHome: boolean
): number {
  if (isFirstHome) {
    return houseArea <= 140 
      ? housePrice * shanghaiPolicy.taxes.deedTaxFirstUnder140
      : housePrice * shanghaiPolicy.taxes.deedTaxFirstOver140;
  } else {
    return houseArea <= 140
      ? housePrice * shanghaiPolicy.taxes.deedTaxSecondUnder140
      : housePrice * shanghaiPolicy.taxes.deedTaxSecondOver140;
  }
}

// 计算中介费
export function calculateAgencyFee(housePrice: number): number {
  return housePrice * shanghaiPolicy.taxes.agencyFee;
}

// 计算月供（等额本息）
export function calculateMonthlyPayment(
  loanAmount: number,  // 万元
  annualRate: number,  // 年利率
  years: number = 30   // 贷款年限
): number {
  if (loanAmount <= 0 || years <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return loanAmount / months;
  }
  
  const payment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) 
    / (Math.pow(1 + monthlyRate, months) - 1);
  
  return payment;
}

// 根据月供反推贷款额（等额本息）
export function calculateLoanAmountByMonthlyPayment(
  monthlyPayment: number, // 万元
  annualRate: number,     // 年利率
  years: number = 30      // 贷款年限
): number {
  if (monthlyPayment <= 0 || years <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return monthlyPayment * months;
  }

  const factor = Math.pow(1 + monthlyRate, months);
  return monthlyPayment * (factor - 1) / (monthlyRate * factor);
}
