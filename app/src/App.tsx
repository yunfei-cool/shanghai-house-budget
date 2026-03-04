import { useState } from 'react';
import { Building2, Calculator, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputForm } from '@/sections/InputForm';
import { ResultView } from '@/sections/ResultView';
import { PolicyInfo } from '@/sections/PolicyInfo';
import { useHouseCalculator } from '@/hooks/useHouseCalculator';
import type { UserInput, AnalysisStep } from '@/types';
import './App.css';

// 默认值
const defaultInput: UserInput = {
  monthlyIncome: 2.5,
  monthlyProvidentFund: 0.5,
  providentFundBalance: 20,
  currentSavings: 100,
  existingDebts: 0,
  isFirstHome: true,
  houseType: 'within',
  houseArea: 90,
  loanYears: 30,
  purchaseHorizonMonths: 12,
  renovationCostPerSqm: 4000,
  emergencyReserveMonths: 6,
  isMultiChild: false,
  isGreenBuilding: false,
  hasSupplementaryProvidentFund: false,
  monthlyExpense: 1.0,
  riskPreference: 'moderate'
};

function App() {
  const [step, setStep] = useState<AnalysisStep>('input');
  const [inputData, setInputData] = useState<UserInput>(defaultInput);
  
  const result = useHouseCalculator(inputData);
  
  const handleSubmit = (data: UserInput) => {
    setInputData(data);
    setStep('calculating');
    
    // 模拟计算动画
    setTimeout(() => {
      setStep('result');
    }, 800);
  };
  
  const handleReset = () => {
    setStep('input');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">上海购房预算分析器</h1>
                <p className="text-xs text-gray-500">基于2026年2月最新政策口径</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              预算计算器
            </TabsTrigger>
            <TabsTrigger value="policy" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              政策说明
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="mt-0">
            {step === 'input' && <InputForm onSubmit={handleSubmit} />}
            
            {step === 'calculating' && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-600">正在分析您的购房能力...</p>
              </div>
            )}
            
            {step === 'result' && (
              <ResultView 
                result={result} 
                input={inputData}
                onReset={handleReset}
              />
            )}
          </TabsContent>
          
          <TabsContent value="policy" className="mt-0">
            <PolicyInfo />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>数据基于2026年2月26日起上海政策口径，仅供参考</p>
        <p className="mt-1">实际贷款额度以银行审批为准</p>
      </footer>
    </div>
  );
}

export default App;
