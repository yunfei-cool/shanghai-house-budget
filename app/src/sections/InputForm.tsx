import { useState } from 'react';
import { Info, HelpCircle, Home, DollarSign, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserInput } from '@/types';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
}

type NumericField =
  | 'monthlyIncome'
  | 'monthlyProvidentFund'
  | 'providentFundBalance'
  | 'currentSavings'
  | 'existingDebts'
  | 'houseArea'
  | 'loanYears'
  | 'purchaseHorizonMonths'
  | 'renovationCostPerSqm'
  | 'emergencyReserveMonths'
  | 'monthlyExpense';

// 默认值
const defaultValues: UserInput = {
  monthlyIncome: 2.5,           // 税后月收入2.5万（上海平均水平偏上）
  monthlyProvidentFund: 0.5,    // 月公积金0.5万（个人+公司，按7%计算）
  providentFundBalance: 20,     // 可动用公积金余额20万
  currentSavings: 100,          // 现有存款100万
  existingDebts: 0,             // 无其他负债
  isFirstHome: true,            // 首套房
  houseType: 'within',          // 外环内
  houseArea: 90,                // 90平米（刚需两房）
  loanYears: 30,                // 默认30年贷款
  purchaseHorizonMonths: 12,    // 默认12个月后买房
  renovationCostPerSqm: 4000,   // 默认4000元/㎡
  emergencyReserveMonths: 6,    // 应急金=6个月生活费（底线15万）
  isMultiChild: false,          // 非多子女家庭
  isGreenBuilding: false,       // 非绿色建筑
  hasSupplementaryProvidentFund: false, // 默认无补充公积金
  monthlyExpense: 1.0,          // 月生活支出1万
  riskPreference: 'moderate'    // 风险偏好适中
};

export function InputForm({ onSubmit }: InputFormProps) {
  const [formData, setFormData] = useState<UserInput>(defaultValues);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const toInputNumberValue = (value: number) => (Number.isFinite(value) ? value : '');

  const parseNumberOrNaN = (raw: string, integer: boolean = false): number => {
    if (raw.trim() === '') {
      return Number.NaN;
    }

    const parsed = integer ? parseInt(raw, 10) : parseFloat(raw);
    return Number.isNaN(parsed) ? Number.NaN : parsed;
  };

  const updateNumericField = (
    field: NumericField,
    rawValue: string,
    integer: boolean = false
  ) => {
    const parsed = parseNumberOrNaN(rawValue, integer);
    updateField(field, parsed as UserInput[NumericField]);
  };

  const normalizeNumericField = (
    field: NumericField,
    fallback: number,
    min?: number,
    max?: number,
    integer: boolean = false
  ) => {
    const current = formData[field];
    let next = Number.isFinite(current) ? current : fallback;

    if (typeof min === 'number') {
      next = Math.max(next, min);
    }
    if (typeof max === 'number') {
      next = Math.min(next, max);
    }
    if (integer) {
      next = Math.round(next);
    }

    updateField(field, next as UserInput[NumericField]);
  };

  const riskCardClass = (selected: boolean) => {
    const base = 'border rounded-lg p-3 cursor-pointer transition-colors min-h-[72px] flex flex-col justify-center';
    return selected
      ? `${base} border-blue-500 bg-blue-50`
      : `${base} hover:border-blue-500`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedData: UserInput = {
      ...formData,
      monthlyIncome: Math.max(Number.isFinite(formData.monthlyIncome) ? formData.monthlyIncome : 0, 0),
      monthlyProvidentFund: Math.max(Number.isFinite(formData.monthlyProvidentFund) ? formData.monthlyProvidentFund : 0, 0),
      providentFundBalance: Math.max(Number.isFinite(formData.providentFundBalance) ? formData.providentFundBalance : 0, 0),
      currentSavings: Math.max(Number.isFinite(formData.currentSavings) ? formData.currentSavings : 0, 0),
      existingDebts: Math.max(Number.isFinite(formData.existingDebts) ? formData.existingDebts : 0, 0),
      houseArea: Math.max(Number.isFinite(formData.houseArea) ? formData.houseArea : 90, 1),
      loanYears: Math.round(clamp(Number.isFinite(formData.loanYears) ? formData.loanYears : 30, 5, 30)),
      purchaseHorizonMonths: Math.round(clamp(
        Number.isFinite(formData.purchaseHorizonMonths) ? formData.purchaseHorizonMonths : 12,
        0,
        120
      )),
      renovationCostPerSqm: Math.round(clamp(
        Number.isFinite(formData.renovationCostPerSqm) ? formData.renovationCostPerSqm : 4000,
        1000,
        20000
      )),
      emergencyReserveMonths: Math.max(
        Number.isFinite(formData.emergencyReserveMonths) ? formData.emergencyReserveMonths : 6,
        0
      ),
      monthlyExpense: Math.max(Number.isFinite(formData.monthlyExpense) ? formData.monthlyExpense : 0, 0)
    };

    setFormData(sanitizedData);
    onSubmit(sanitizedData);
  };
  
  const updateField = <K extends keyof UserInput>(field: K, value: UserInput[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 收入信息 */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">收入与资产</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="monthlyIncome">税后月收入（万元）</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>你的税后月收入，包含基本工资、奖金等</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="monthlyIncome"
              type="number"
              step="0.1"
              value={toInputNumberValue(formData.monthlyIncome)}
              onChange={(e) => updateNumericField('monthlyIncome', e.target.value)}
              onBlur={() => normalizeNumericField('monthlyIncome', 0, 0)}
              className="h-12"
            />
            <p className="text-xs text-gray-500">默认值2.5万：上海白领平均收入水平</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="monthlyProvidentFund">月公积金缴存（万元）</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>个人+公司每月缴存的公积金总额</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="monthlyProvidentFund"
              type="number"
              step="0.01"
              value={toInputNumberValue(formData.monthlyProvidentFund)}
              onChange={(e) => updateNumericField('monthlyProvidentFund', e.target.value)}
              onBlur={() => normalizeNumericField('monthlyProvidentFund', 0, 0)}
              className="h-12"
            />
            <p className="text-xs text-gray-500">默认值0.5万：按工资7%计算，个人+公司共14%</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="providentFundBalance">可动用公积金余额（万元）</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>买房时可提取用于支付购房相关支出的公积金余额</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="providentFundBalance"
              type="number"
              step="1"
              value={toInputNumberValue(formData.providentFundBalance)}
              onChange={(e) => updateNumericField('providentFundBalance', e.target.value)}
              onBlur={() => normalizeNumericField('providentFundBalance', 0, 0)}
              className="h-12"
            />
            <p className="text-xs text-gray-500">会与现金存款一起用于评估可负担总价和资金缺口</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="currentSavings">现有存款（万元）</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>可用于购房的现金存款</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="currentSavings"
              type="number"
              step="1"
              value={toInputNumberValue(formData.currentSavings)}
              onChange={(e) => updateNumericField('currentSavings', e.target.value)}
              onBlur={() => normalizeNumericField('currentSavings', 0, 0)}
              className="h-12"
            />
            <p className="text-xs text-gray-500">默认值100万：工作几年后的合理储蓄水平</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="existingDebts">现有负债月供（每月，万元）</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>填写每个月要还的负债金额，不是负债总本金</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="existingDebts"
              type="number"
              step="0.1"
              value={toInputNumberValue(formData.existingDebts)}
              onChange={(e) => updateNumericField('existingDebts', e.target.value)}
              onBlur={() => normalizeNumericField('existingDebts', 0, 0)}
              className="h-12"
            />
            <p className="text-xs text-gray-500">默认值0：假设无其他负债</p>
          </div>
        </div>
      </div>
      
      {/* 购房信息 */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-green-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">购房信息</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Checkbox
              id="isFirstHome"
              checked={formData.isFirstHome}
              onCheckedChange={(checked) => updateField('isFirstHome', checked as boolean)}
            />
            <Label htmlFor="isFirstHome" className="cursor-pointer">
              首套房（享受更低首付比例和利率）
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label>购房区域</Label>
            <RadioGroup
              value={formData.houseType}
              onValueChange={(value) => updateField('houseType', value as 'within' | 'outside')}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <RadioGroupItem value="within" id="within" />
                <Label htmlFor="within" className="cursor-pointer">外环内</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <RadioGroupItem value="outside" id="outside" />
                <Label htmlFor="outside" className="cursor-pointer">外环外</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-gray-500">外环外首付比例可能更低，但需考虑通勤成本</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="houseArea">房屋面积（平方米）</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>面积影响契税：≤140㎡税率更低</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="houseArea"
                type="number"
                value={toInputNumberValue(formData.houseArea)}
                onChange={(e) => updateNumericField('houseArea', e.target.value)}
                onBlur={() => normalizeNumericField('houseArea', 90, 1)}
                className="h-12"
              />
              <p className="text-xs text-gray-500">默认值90㎡：刚需两房的合理面积</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanYears">计划贷款年限（年）</Label>
              <Input
                id="loanYears"
                type="number"
                min={5}
                max={30}
                step="1"
                value={toInputNumberValue(formData.loanYears)}
                onChange={(e) => updateNumericField('loanYears', e.target.value, true)}
                onBlur={() => normalizeNumericField('loanYears', 30, 5, 30, true)}
                className="h-12"
              />
              <p className="text-xs text-gray-500">常见选择：20年或30年。年限越短，总利息更少但月供更高</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseHorizonMonths">购房准备时长（月）</Label>
              <Input
                id="purchaseHorizonMonths"
                type="number"
                min={0}
                max={120}
                step="1"
                value={toInputNumberValue(formData.purchaseHorizonMonths)}
                onChange={(e) => updateNumericField('purchaseHorizonMonths', e.target.value, true)}
                onBlur={() => normalizeNumericField('purchaseHorizonMonths', 12, 0, 120, true)}
                className="h-12"
              />
              <p className="text-xs text-gray-500">用于估算当预算高于当前可用资金时，你愿意用多久补齐差额；不影响“稳健模式可立即成交”的判断（默认12个月）</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="renovationCostPerSqm">装修标准（元/㎡）</Label>
              <Input
                id="renovationCostPerSqm"
                type="number"
                min={1000}
                max={20000}
                step="100"
                value={toInputNumberValue(formData.renovationCostPerSqm)}
                onChange={(e) => updateNumericField('renovationCostPerSqm', e.target.value, true)}
                onBlur={() => normalizeNumericField('renovationCostPerSqm', 4000, 1000, 20000, true)}
                className="h-12"
              />
              <p className="text-xs text-gray-500">默认4000元/㎡，可按你装修预期调整</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isMultiChild"
                checked={formData.isMultiChild}
                onCheckedChange={(checked) => updateField('isMultiChild', checked as boolean)}
              />
              <Label htmlFor="isMultiChild" className="cursor-pointer text-sm">
                多子女家庭（公积金额度上浮20%）
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isGreenBuilding"
                checked={formData.isGreenBuilding}
                onCheckedChange={(checked) => updateField('isGreenBuilding', checked as boolean)}
              />
              <Label htmlFor="isGreenBuilding" className="cursor-pointer text-sm">
                绿色建筑（公积金额度上浮15%）
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="hasSupplementaryProvidentFund"
                checked={formData.hasSupplementaryProvidentFund}
                onCheckedChange={(checked) => updateField('hasSupplementaryProvidentFund', checked as boolean)}
              />
              <Label htmlFor="hasSupplementaryProvidentFund" className="cursor-pointer text-sm">
                已缴纳补充公积金（可提高公积金贷款额度）
              </Label>
            </div>
          </div>
        </div>
      </div>
      
      {/* 支出与风险 */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-orange-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">支出与风险承受</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyExpense">月生活支出（万元）</Label>
            <Input
              id="monthlyExpense"
              type="number"
              step="0.1"
              value={toInputNumberValue(formData.monthlyExpense)}
              onChange={(e) => updateNumericField('monthlyExpense', e.target.value)}
              onBlur={() => normalizeNumericField('monthlyExpense', 0, 0)}
              className="h-12"
            />
            <p className="text-xs text-gray-500">默认值1万：包含餐饮、交通、娱乐等日常开销</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyReserveMonths">应急金（月支出倍数）</Label>
            <Input
              id="emergencyReserveMonths"
              type="number"
              min={0}
              step="0.5"
              value={toInputNumberValue(formData.emergencyReserveMonths)}
              onChange={(e) => updateNumericField('emergencyReserveMonths', e.target.value)}
              onBlur={() => normalizeNumericField('emergencyReserveMonths', 6, 0)}
              className="h-12"
            />
            <p className="text-xs text-gray-500">应急金=月生活支出×倍数，且不低于15万（默认6倍）</p>
          </div>
          
          <div className="space-y-2">
            <Label>风险偏好</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                aria-pressed={formData.riskPreference === 'conservative'}
                className={riskCardClass(formData.riskPreference === 'conservative')}
                onClick={() => updateField('riskPreference', 'conservative')}
              >
                <div className="font-medium text-sm text-center">保守型</div>
                <div className="text-xs text-gray-500 mt-1 text-center">月供≤30%</div>
              </button>
              <button
                type="button"
                aria-pressed={formData.riskPreference === 'moderate'}
                className={riskCardClass(formData.riskPreference === 'moderate')}
                onClick={() => updateField('riskPreference', 'moderate')}
              >
                <div className="font-medium text-sm text-center">稳健型</div>
                <div className="text-xs text-gray-500 mt-1 text-center">月供≤40%</div>
              </button>
              <button
                type="button"
                aria-pressed={formData.riskPreference === 'aggressive'}
                className={riskCardClass(formData.riskPreference === 'aggressive')}
                onClick={() => updateField('riskPreference', 'aggressive')}
              >
                <div className="font-medium text-sm text-center">进取型</div>
                <div className="text-xs text-gray-500 mt-1 text-center">月供≤50%</div>
              </button>
            </div>
            <p className="text-xs text-gray-500">建议：经济环境下行，选择保守或稳健型更稳妥</p>
          </div>
        </div>
      </div>
      
      {/* 提交按钮 */}
      <Button
        type="submit"
        className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
      >
        开始分析
      </Button>
    </form>
  );
}
