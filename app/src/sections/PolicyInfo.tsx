import { 
  Home, 
  PiggyBank, 
  Building, 
  FileText, 
  Users,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { shanghaiPolicy, supplementaryProvidentFundBonus } from '@/data/shanghaiPolicy';

export function PolicyInfo() {
  return (
    <div className="space-y-6">
      {/* 限购政策 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            限购政策（2026年2月26日起）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">沪籍家庭/单身</Badge>
              </div>
              <p className="text-sm text-gray-700">
                {shanghaiPolicy.purchaseLimit.localFamily}
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-green-100">非沪籍家庭/单身</Badge>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 连续缴纳社保/个税满1年：外环外不限套数，外环内限购1套</li>
                <li>• 连续缴纳社保/个税满3年：外环内限购2套</li>
                <li>• 持《上海市居住证》满5年：全市限购1套（无需提供社保/个税证明）</li>
              </ul>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-purple-100">多子女家庭</Badge>
              </div>
              <p className="text-sm text-gray-700">
                {shanghaiPolicy.purchaseLimit.multiChild}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 公积金贷款 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-green-600" />
            公积金贷款政策（2026年2月）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">项目</th>
                  <th className="text-left py-2 px-2">首套房</th>
                  <th className="text-left py-2 px-2">二套改善</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="py-2 px-2">家庭最高额度（不含/含补充公积金）</td>
                  <td className="py-2 px-2">
                    <strong>{shanghaiPolicy.providentFund.firstHomeMax}万</strong>
                    <span className="text-xs text-gray-500 block">
                      含补充公积金可至{shanghaiPolicy.providentFund.firstHomeMax + supplementaryProvidentFundBonus.familyExtraLimit}万，多子女+绿色建筑最高可上浮至324万
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <strong>{shanghaiPolicy.providentFund.secondHomeMax}万</strong>
                    <span className="text-xs text-gray-500 block">
                      含补充公积金可至{shanghaiPolicy.providentFund.secondHomeMax + supplementaryProvidentFundBonus.familyExtraLimit}万
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2">贷款利率（5年以上）</td>
                  <td className="py-2 px-2"><strong>{(shanghaiPolicy.providentFund.firstHomeRate * 100).toFixed(1)}%</strong></td>
                  <td className="py-2 px-2"><strong>{(shanghaiPolicy.providentFund.secondHomeRate * 100).toFixed(3)}%</strong></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2">最低首付比例</td>
                  <td className="py-2 px-2"><strong>{(shanghaiPolicy.providentFund.downPaymentFirst * 100).toFixed(0)}%</strong></td>
                  <td className="py-2 px-2"><strong>{(shanghaiPolicy.providentFund.downPaymentSecond * 100).toFixed(0)}%</strong>（差异化区域可20%）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="sm:hidden text-xs text-gray-500 -mt-2">左右滑动查看完整表格</p>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>认房不认贷：</strong>只看当前住房套数，不再看历史贷款记录；无房或仅有1套且贷款已结清，仍可按对应政策申请贷款。
            </p>
          </div>
          
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="font-medium mb-2">额度上浮政策：</p>
            <ul className="space-y-1 ml-4">
              <li>• 多子女家庭：上浮20%</li>
              <li>• 绿色建筑/装配式建筑：上浮15%</li>
              <li>• 两者叠加：最高上浮35%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {/* 商业贷款 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="w-5 h-5 text-orange-600" />
            商业贷款政策
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">首套房最低首付</div>
              <div className="text-2xl font-bold text-orange-600">15%</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">二套房最低首付</div>
              <div className="text-2xl font-bold text-orange-600">25%</div>
              <p className="text-xs text-gray-500 mt-1">差异化区域最低可20%</p>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">当前5年期以上LPR（参考）</div>
            <div className="text-xl font-bold text-gray-900">{(shanghaiPolicy.commercialLoan.currentLPR * 100).toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">
              上海商贷定价已不再简单区分首套/二套统一加点，最终利率以银行审批与资质评估为准
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* 税费政策 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            税费政策
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">契税</h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">房屋面积</th>
                    <th className="text-left py-2 px-2">首套房</th>
                    <th className="text-left py-2 px-2">二套房</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b">
                    <td className="py-2 px-2">≤140㎡</td>
                    <td className="py-2 px-2"><strong>1%</strong></td>
                    <td className="py-2 px-2"><strong>1%</strong></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-2">＞140㎡</td>
                    <td className="py-2 px-2"><strong>1.5%</strong></td>
                    <td className="py-2 px-2"><strong>2%</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="sm:hidden text-xs text-gray-500 mt-2">左右滑动查看完整表格</p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 mt-0.5" />
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-medium mb-1">中介费</p>
                <p>一般为房屋总价的<strong>1%-2%</strong>，可根据中介类型和房源热度谈判</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-medium mb-1">房产税（非沪籍）</p>
                <p>首套房暂免，二套及以上按家庭总面积人均60㎡免税，超出部分按0.4%-0.6%征收</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 购房建议 */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            购房建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span><strong>先定贷款年限</strong>：20年和30年月供差异明显，先确定可承受月供再看总价</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span><strong>现金充足可提高首付</strong>：用更多首付换更低月供，抗风险能力更强</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span><strong>优先公积金</strong>：先吃满低利率额度，再考虑商贷</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">4.</span>
              <span><strong>预留流动性</strong>：除首付外，建议预留12个月生活费+1年还贷缓冲</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">5.</span>
              <span><strong>签约前再核实政策</strong>：银行和区级口径可能存在细微差异</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      {/* 数据来源 */}
      <div className="text-center text-xs text-gray-400">
        <p>数据来源：上海市住房和城乡建设管理委员会、上海市公积金管理中心</p>
        <p>更新时间：2026年2月26日</p>
      </div>
    </div>
  );
}
