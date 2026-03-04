import { useState } from 'react';
import {
  Home,
  Wallet,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  Info,
  Calculator,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateMonthlyPayment } from '@/data/shanghaiPolicy';
import type { CalculationResult, ScenarioResult, UserInput } from '@/types';

interface ResultViewProps {
  result: CalculationResult;
  input: UserInput;
  onReset: () => void;
}

type Mode = 'safe' | 'upper';

const BASE_RISK_RATIO: Record<UserInput['riskPreference'], number> = {
  conservative: 0.30,
  moderate: 0.40,
  aggressive: 0.50
};

function formatGap(gap: number): string {
  return `${Math.abs(gap).toFixed(0)}万`;
}

function gapText(gap: number): string {
  return gap > 0 ? `缺口 ${formatGap(gap)}` : `盈余 ${formatGap(gap)}`;
}

function ratioText(payment: number, incomeBase: number): string {
  if (incomeBase <= 0) {
    return '0';
  }
  return ((payment / incomeBase) * 100).toFixed(0);
}

function computeSafetyCoverage(availableFunds: number, safetyTargetCashNeeded: number): number {
  if (safetyTargetCashNeeded <= 0) {
    return 1;
  }
  return availableFunds / safetyTargetCashNeeded;
}

function formatSafetyCoverage(coverage: number): string {
  if (coverage >= 1) {
    return '>=100%（已覆盖）';
  }

  const normalized = Math.max(coverage, 0);
  return `${(normalized * 100).toFixed(0)}%`;
}

function HelpLabel({ label, content }: { label: string; content: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="p-1 -m-1 rounded text-gray-400 hover:text-gray-600"
              aria-label={`${label}说明`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}

function ScenarioCard({
  title,
  subtitle,
  scenario,
  policyMinDownPaymentRatio,
  incomeBase,
  selected,
  onSelect,
  footnote
}: {
  title: string;
  subtitle: string;
  scenario: ScenarioResult;
  policyMinDownPaymentRatio: number;
  incomeBase: number;
  selected: boolean;
  onSelect: () => void;
  footnote?: string;
}) {
  const immediateOk = scenario.immediateGap <= 0;
  const safetyOk = scenario.safetyGap <= 0;

  return (
    <Card
      className={`cursor-pointer transition-colors ${
        selected ? 'border-blue-400 bg-blue-50/40' : 'hover:border-blue-300'
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <span>{title}</span>
          {selected && <span className="text-xs text-blue-600 font-medium">当前查看</span>}
        </CardTitle>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-sm text-gray-600">总价</span>
          <span className="text-2xl sm:text-3xl font-bold text-gray-900">{scenario.housePrice.toFixed(0)}万</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="p-2 rounded bg-white">
            <div className="text-gray-500">首付</div>
            <div className="font-semibold text-gray-900">
              {scenario.downPayment.toFixed(0)}万（{(scenario.downPaymentRatio * 100).toFixed(0)}%）
            </div>
            <div className="text-xs text-gray-500">
              政策最低 {(policyMinDownPaymentRatio * 100).toFixed(0)}%
            </div>
          </div>
          <div className="p-2 rounded bg-white">
            <div className="text-gray-500">月供</div>
            <div className="font-semibold text-gray-900">{scenario.monthlyPayment.toFixed(2)}万</div>
            <div className="text-xs text-gray-500">占收入 {ratioText(scenario.monthlyPayment, incomeBase)}%</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">成交缺口</span>
            <span className={immediateOk ? 'text-green-700 font-medium' : 'text-orange-700 font-medium'}>
              {gapText(scenario.immediateGap)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">安全目标缺口</span>
            <span className={safetyOk ? 'text-green-700 font-medium' : 'text-orange-700 font-medium'}>
              {gapText(scenario.safetyGap)}
            </span>
          </div>
        </div>

        {footnote && (
          <p className="text-xs text-gray-500 border-t pt-2 leading-relaxed break-words">
            {footnote}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ResultView({ result, input, onReset }: ResultViewProps) {
  const [activeMode, setActiveMode] = useState<Mode>('safe');

  const incomeBase = input.monthlyIncome + input.monthlyProvidentFund;
  const availableFunds = input.currentSavings + input.providentFundBalance;
  const safeScenario = result.scenarios.safe;
  const upperScenario = result.scenarios.upper;
  const activeScenario = activeMode === 'safe' ? safeScenario : upperScenario;
  const activeModeText = activeMode === 'safe' ? '稳健模式' : '上限模式';
  const safetyCoverage = computeSafetyCoverage(availableFunds, activeScenario.safetyTargetCashNeeded);

  const baseRatio = BASE_RISK_RATIO[input.riskPreference];
  const activeRatio = activeMode === 'safe' ? baseRatio : Math.min(baseRatio + 0.1, 0.6);

  const stressRate1 = result.rates.commercialRate + 0.01;
  const stressRate2 = result.rates.commercialRate + 0.02;
  const stressPayment1 = calculateMonthlyPayment(
    activeScenario.commercialLoan,
    stressRate1,
    result.monthlyPaymentDetail.loanYears
  ) + activeScenario.providentFundPayment;
  const stressPayment2 = calculateMonthlyPayment(
    activeScenario.commercialLoan,
    stressRate2,
    result.monthlyPaymentDetail.loanYears
  ) + activeScenario.providentFundPayment;
  const incomeDecrease20Percent = Math.max(
    ((input.monthlyIncome * 0.8) + input.monthlyProvidentFund) * activeRatio - input.existingDebts,
    0
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 核心结论 */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">建议购房预算区间</h2>
            <div className="text-3xl sm:text-5xl font-bold text-blue-600 mb-2 leading-tight">
              {result.budgetRange.safePrice.toFixed(0)}
              <span className="text-xl sm:text-2xl text-gray-600 mx-1">~</span>
              {result.budgetRange.upperPrice.toFixed(0)}
              <span className="text-xl sm:text-2xl text-gray-600 ml-1">万</span>
            </div>
            <p className="text-sm sm:text-base text-gray-600">当前查看：{activeModeText}（点击下方预算卡切换）</p>
          </div>
        </CardContent>
      </Card>

      {/* 双档明细 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScenarioCard
          title="稳健预算"
          subtitle="成交缺口<=0，适合立即执行"
          scenario={safeScenario}
          policyMinDownPaymentRatio={result.policyMinDownPaymentRatio}
          incomeBase={incomeBase}
          selected={activeMode === 'safe'}
          onSelect={() => setActiveMode('safe')}
          footnote="稳健档保证可成交，不保证一次性覆盖1年还贷缓冲金。"
        />
        <ScenarioCard
          title="上限预算"
          subtitle="允许准备期内补齐缺口"
          scenario={upperScenario}
          policyMinDownPaymentRatio={result.policyMinDownPaymentRatio}
          incomeBase={incomeBase}
          selected={activeMode === 'upper'}
          onSelect={() => setActiveMode('upper')}
        />
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">当前模式月供</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {activeScenario.monthlyPayment.toFixed(2)}
              <span className="text-sm text-gray-500 ml-1">万</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              占收入 {ratioText(activeScenario.monthlyPayment, incomeBase)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">当前模式首付</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {activeScenario.downPayment.toFixed(0)}
              <span className="text-sm text-gray-500 ml-1">万</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              建议比例 {(activeScenario.downPaymentRatio * 100).toFixed(0)}%（政策最低 {(result.policyMinDownPaymentRatio * 100).toFixed(0)}%）
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-600">
                <HelpLabel
                  label="成交缺口"
                  content="成交缺口 = 成交必需现金需求（首付+必需预留）- 当前可用资金。<=0 表示现在就能成交。"
                />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{gapText(activeScenario.immediateGap)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {activeScenario.immediateGap <= 0
                ? '可立即成交'
                : activeScenario.monthsToCloseImmediateGap === null
                  ? '需提升月结余'
                  : `按当前月结余约需 ${activeScenario.monthsToCloseImmediateGap} 个月补齐`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">
                <HelpLabel
                  label="安全目标缺口"
                  content="安全目标缺口 = 成交必需现金 + 1年还贷缓冲金 - 当前可用资金。它是安全目标，不是成交硬门槛。"
                />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{gapText(activeScenario.safetyGap)}</div>
            <div className="text-xs text-gray-500 mt-1 leading-relaxed break-words">
              准备期预计可补金额 {result.gapCapByHorizon.toFixed(0)} 万（月结余 {result.monthlySurplus.toFixed(2)} 万 × 购房准备时长 {input.purchaseHorizonMonths} 个月）
            </div>
            <div className="text-xs text-gray-500 mt-1 leading-relaxed">
              安全目标达成率 {formatSafetyCoverage(safetyCoverage)}
              {safetyCoverage < 1 ? '（仍需补足安全垫）' : ''}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 贷款方案 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {activeModeText}贷款方案
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-green-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">公积金贷款</div>
              <div className="text-sm text-gray-600">利率 {(result.rates.providentFundRate * 100).toFixed(3)}%</div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="font-bold text-gray-900">{activeScenario.providentFundLoan.toFixed(0)}万</div>
              <div className="text-sm text-gray-600">月供 {activeScenario.providentFundPayment.toFixed(2)}万</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">商业贷款</div>
              <div className="text-sm text-gray-600">利率约 {(result.rates.commercialRate * 100).toFixed(2)}%</div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="font-bold text-gray-900">{activeScenario.commercialLoan.toFixed(0)}万</div>
              <div className="text-sm text-gray-600">月供 {activeScenario.commercialPayment.toFixed(2)}万</div>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="font-medium text-gray-900">总月供</span>
              <span className="text-lg sm:text-xl font-bold text-blue-600">{activeScenario.monthlyPayment.toFixed(2)}万</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">贷款年限：{result.monthlyPaymentDetail.loanYears}年</div>
          </div>
        </CardContent>
      </Card>

      {/* 现金预留分层 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-600" />
            {activeModeText}现金预留分层
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2">
              <span className="font-medium text-gray-900">成交必需预留</span>
              <span className="font-semibold text-gray-900">{activeScenario.mandatoryReserve.toFixed(0)}万</span>
            </div>
            <div className="space-y-1 text-sm leading-relaxed">
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-600">12个月生活费</span>
                <span className="shrink-0">{activeScenario.livingReserve.toFixed(1)}万</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-600">应急金（{input.emergencyReserveMonths}个月，底线15万）</span>
                <span className="shrink-0">{activeScenario.emergencyReserve.toFixed(1)}万</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-600">装修费用（约{input.renovationCostPerSqm.toFixed(0)}元/㎡）</span>
                <span className="shrink-0">{activeScenario.decoration.toFixed(1)}万</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-600">税费中介费</span>
                <span className="shrink-0">{activeScenario.taxAndFee.toFixed(1)}万</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-3 bg-blue-50/40">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-1">
              <span className="font-medium text-gray-900">安全目标预留（可选）</span>
              <span className="font-semibold text-gray-900">{activeScenario.optionalReserve.toFixed(0)}万</span>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">按1年还贷缓冲金测算，不作为成交硬门槛</div>
          </div>
        </CardContent>
      </Card>

      {/* 计算逻辑说明报告 */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            计算逻辑说明报告
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700 leading-relaxed break-words">
          <div>
            1. 月供上限：
            <code className="ml-1">（税后收入+月公积金）×风险比例 - 现有负债月供</code>
            。当前{activeModeText}采用比例 {(activeRatio * 100).toFixed(0)}%。
          </div>
          <div>
            2. 双档求价：在满足月供上限和政策最低首付比例的前提下，用二分搜索找到“可行最大总价”。
          </div>
          <div>
            3. 成交缺口：
            <code className="ml-1">首付 + 成交必需预留 - 可用资金</code>
            。成交必需预留 = 12个月生活费 + 应急金 + 装修 + 税费中介费。
          </div>
          <div>
            4. 安全目标缺口：
            <code className="ml-1">成交缺口口径 + 1年还贷缓冲金</code>
            ，用于安全性评估，不是成交硬限制。稳健档是“成交稳健”，不是“安全垫稳健”。
          </div>
          <div>
            5. 上限模式通过条件：
            <code className="ml-1">成交缺口 ≤ 月结余 × 购房准备时长</code>
            。你当前月结余 {result.monthlySurplus.toFixed(2)} 万，购房准备时长 {input.purchaseHorizonMonths} 个月，预计可补金额 {result.gapCapByHorizon.toFixed(0)} 万。
          </div>
          <div>
            6. 安全目标达成率：
            <code className="ml-1">可用资金 ÷ 安全目标现金需求</code>
            ，当前为 {formatSafetyCoverage(safetyCoverage)}。
          </div>
        </CardContent>
      </Card>

      {/* 压力测试 */}
      <Card className="border-yellow-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            压力测试（基于{activeModeText}）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 mb-3">假设未来利率上涨或收入下降，还款压力变化如下：</div>

          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
              <span className="text-sm">利率上涨1%</span>
              <span className="font-medium">月供 {stressPayment1.toFixed(2)}万</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
              <span className="text-sm">利率上涨2%</span>
              <span className="font-medium">月供 {stressPayment2.toFixed(2)}万</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span className="text-sm">收入下降20%</span>
              <span className="font-medium">可承受月供 {incomeDecrease20Percent.toFixed(2)}万</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onReset}
        variant="outline"
        className="w-full h-11 sm:h-12"
      >
        重新计算
      </Button>
    </div>
  );
}
