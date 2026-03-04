// 用户输入数据
export interface UserInput {
  // 基本信息
  monthlyIncome: number;        // 税后月收入（万元）
  monthlyProvidentFund: number; // 月公积金缴存额（万元，个人+公司）
  providentFundBalance: number; // 可动用公积金余额（万元）
  
  // 现有资产
  currentSavings: number;       // 现有存款（万元）
  existingDebts: number;        // 现有负债月供（每月，万元）
  
  // 购房信息
  isFirstHome: boolean;         // 是否首套房
  houseType: 'within' | 'outside'; // 外环内/外环外
  houseArea: number;            // 房屋面积（平方米）
  loanYears: number;            // 贷款年限（年）
  purchaseHorizonMonths: number; // 购房准备时长（月）
  renovationCostPerSqm: number; // 装修标准（元/㎡）
  emergencyReserveMonths: number; // 应急金（月支出倍数）
  
  // 家庭情况
  isMultiChild: boolean;        // 是否多子女家庭
  isGreenBuilding: boolean;     // 是否购买绿色建筑
  hasSupplementaryProvidentFund: boolean; // 是否缴纳补充公积金
  
  // 风险承受
  monthlyExpense: number;       // 月生活支出（万元）
  riskPreference: 'conservative' | 'moderate' | 'aggressive'; // 风险偏好
}

export interface ScenarioResult {
  housePrice: number;           // 房屋总价（万元）
  downPayment: number;          // 首付（万元）
  downPaymentRatio: number;     // 首付比例
  loanTotal: number;            // 总贷款（万元）
  providentFundLoan: number;    // 公积金贷款（万元）
  commercialLoan: number;       // 商业贷款（万元）
  monthlyPayment: number;       // 总月供（万元）
  immediateCashNeeded: number;  // 成交必需现金（万元）
  immediateGap: number;         // 成交缺口（万元，负数表示有盈余）
  safetyTargetCashNeeded: number; // 安全目标现金需求（万元）
  safetyGap: number;            // 安全目标缺口（万元，负数表示有盈余）
  monthsToCloseImmediateGap: number | null; // 补齐成交缺口所需月数
  mandatoryReserve: number;     // 成交必需预留（万元）
  optionalReserve: number;      // 安全目标预留（万元）
  livingReserve: number;        // 12个月生活费（万元）
  emergencyReserve: number;     // 应急金（万元）
  decoration: number;           // 装修预算（万元）
  taxAndFee: number;            // 税费中介费（万元）
  providentFundPayment: number; // 公积金月供（万元）
  commercialPayment: number;    // 商贷月供（万元）
}

// 计算结果
export interface CalculationResult {
  analysisMode: 'standard' | 'low_fund'; // 计算模式：常规/低资金规划
  lowFundContext: {
    baselineReserveAtZeroPrice: number; // 0房价成交基线预留（万元）
    liquidityMargin: number;            // 可用资金 - 基线预留（万元）
    dynamicTriggerThreshold: number;    // 动态阈值（月生活费+负债月供，万元）
    isTriggered: boolean;               // 是否触发低资金模式
    triggerRuleText: string;            // 触发规则说明
  };

  // 区间预算
  budgetRange: {
    safePrice: number;          // 稳健预算（万元）
    upperPrice: number;         // 上限预算（万元）
  };
  scenarios: {
    safe: ScenarioResult;
    upper: ScenarioResult;
  };
  gapCapByHorizon: number;      // 准备期允许缺口（万元）
  monthlySurplus: number;       // 月结余（万元）

  // 可承受月供
  maxMonthlyPayment: number;    // 最大月供（万元）
  recommendedMonthlyPayment: number; // 建议月供（万元）
  
  // 贷款额度
  maxTotalLoan: number;         // 最大总贷款额（万元）
  providentFundLoan: number;    // 公积金贷款额（万元）
  commercialLoan: number;       // 商业贷款额（万元）
  
  // 房屋总价
  maxHousePrice: number;        // 最大房屋总价（万元）
  recommendedHousePrice: number; // 建议房屋总价（万元）
  
  // 首付相关
  downPaymentRatio: number;     // 首付比例
  policyMinDownPaymentRatio: number; // 政策最低首付比例
  minDownPayment: number;       // 最低首付（万元）
  recommendedDownPayment: number; // 建议首付（万元）
  
  // 现金预留
  reservedCash: {
    livingExpense: number;      // 12个月生活费
    decoration: number;         // 装修费
    taxAndFee: number;          // 税费中介费
    medicalEmergency: number;   // 医疗备用金
    loanBuffer: number;         // 还贷缓冲金
    other: number;              // 其他备用金
    total: number;              // 预留现金合计
  };
  
  // 总现金需求
  totalCashNeeded: number;      // 买房时应该有的现金（万元）
  cashGap: number;              // 现金缺口（万元，负数表示有盈余）
  
  // 详细数据
  monthlyPaymentDetail: {
    providentFundPayment: number;  // 公积金月供
    commercialPayment: number;     // 商贷月供
    totalPayment: number;          // 总月供
    loanYears: number;             // 贷款年限
  };

  // 利率信息
  rates: {
    providentFundRate: number;     // 公积金年化利率
    commercialRate: number;        // 商贷年化利率（估算）
  };
  
  // 压力测试
  stressTest: {
    rateIncrease1Percent: number;  // 利率上涨1%后的月供
    rateIncrease2Percent: number;  // 利率上涨2%后的月供
    incomeDecrease20Percent: number; // 收入下降20%后的压力
  };
}

// 上海政策参数
export interface ShanghaiPolicy {
  // 限购
  purchaseLimit: {
    localFamily: string;
    nonLocalFamily: string;
    multiChild: string;
  };
  
  // 公积金
  providentFund: {
    firstHomeMax: number;         // 首套房基础最高额度（不含补充公积金，万元）
    secondHomeMax: number;        // 二套房基础最高额度（不含补充公积金，万元）
    firstHomeRate: number;        // 首套房利率
    secondHomeRate: number;       // 二套房利率
    downPaymentFirst: number;     // 首套房首付比例
    downPaymentSecond: number;    // 二套房首付比例
  };
  
  // 商业贷款
  commercialLoan: {
    firstHomeDownPayment: number; // 首套房首付比例
    secondHomeDownPayment: number; // 二套房首付比例
    currentLPR: number;           // 当前LPR
  };
  
  // 税费
  taxes: {
    deedTaxFirstUnder140: number;  // 首套房≤140㎡契税
    deedTaxFirstOver140: number;   // 首套房>140㎡契税
    deedTaxSecondUnder140: number; // 二套房≤140㎡契税
    deedTaxSecondOver140: number;  // 二套房>140㎡契税
    agencyFee: number;             // 中介费比例
  };
}

// 分析步骤
export type AnalysisStep = 'input' | 'calculating' | 'result' | 'detail';
