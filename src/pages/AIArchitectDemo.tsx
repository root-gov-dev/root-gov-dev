/**
 * AI 架构师演示页面
 * 展示 AI 代码生成能力的完整演示
 */
import React from 'react';
import { AIArchitectPanel } from '../components/AIArchitectPanel';

export const AIArchitectDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 架构师平台
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            基于意图的智能代码生成，具备完整的治理和品质保证
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-2xl mb-2">🚀</div>
              <h3 className="font-semibold text-gray-800 mb-2">意图驱动</h3>
              <p className="text-gray-600 text-sm">
                基于高级意图描述自动生成完整代码架构
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-600 text-2xl mb-2">🛡️</div>
              <h3 className="font-semibold text-gray-800 mb-2">治理保障</h3>
              <p className="text-gray-600 text-sm">
                内置安全、性能和合规性检查，确保代码质量
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800 mb-2">可观测性</h3>
              <p className="text-gray-600 text-sm">
                实时监控生成质量和架构演化趋势
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              代码生成工作台
            </h2>
            <p className="text-gray-600 mt-1">
              选择生成意图，描述你的需求，让 AI 架构师为你生成高质量的代码
            </p>
          </div>
          
          <div className="p-6">
            <AIArchitectPanel />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            支持的生成类型
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="text-blue-500 text-lg font-semibold mb-2">React Hook</div>
              <p className="text-gray-600 text-sm">
                生成类型安全的 React Hook，包含状态管理和业务逻辑
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
              <div className="text-green-500 text-lg font-semibold mb-2">验证 Schema</div>
              <p className="text-gray-600 text-sm">
                基于 Zod 的类型安全验证器，确保数据完整性
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-500 transition-colors">
              <div className="text-purple-500 text-lg font-semibold mb-2">API 端点</div>
              <p className="text-gray-600 text-sm">
                生成完整的 API 路由、控制器和中间件代码
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors">
              <div className="text-orange-500 text-lg font-semibold mb-2">测试套件</div>
              <p className="text-gray-600 text-sm">
                自动生成单元测试、集成测试和 E2E 测试
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">治理与品质保证</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">🔒 安全合规</h4>
              <ul className="text-blue-100 text-sm space-y-1">
                <li>• 自动安全漏洞检测</li>
                <li>• 输入输出验证</li>
                <li>• 敏感信息保护</li>
                <li>• 合规性检查</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⚡ 性能优化</h4>
              <ul className="text-blue-100 text-sm space-y-1">
                <li>• 代码包大小限制</li>
                <li>• 渲染性能监控</li>
                <li>• 内存使用优化</li>
                <li>• 网络请求优化</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎯 代码质量</h4>
              <ul className="text-blue-100 text-sm space-y-1">
                <li>• TypeScript 严格模式</li>
                <li>• 自动化测试覆盖</li>
                <li>• 文档完整性检查</li>
                <li>• 最佳实践遵循</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📈 可观测性</h4>
              <ul className="text-blue-100 text-sm space-y-1">
                <li>• 实时质量评分</li>
                <li>• 生成历史追踪</li>
                <li>• 性能指标监控</li>
                <li>• 架构演化分析</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIArchitectDemo;