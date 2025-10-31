/**
 * AI 架构师面板组件
 * 提供用户界面用于生成和管理 AI 生成的代码
 */
import React, { useState } from 'react';
import { AIArchitectOrchestrator } from '../ai-architect/orchestrator/generate';
import { GenerationIntent } from '../ai-architect/core/types';

interface GenerationRequest {
  intent: GenerationIntent;
  domain: string;
  requirements: string[];
}

export const AIArchitectPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [generationRequest, setGenerationRequest] = useState<GenerationRequest>({
    intent: 'create-react-hook',
    domain: '',
    requirements: ['']
  });

  const orchestrator = new AIArchitectOrchestrator();

  const handleGenerate = async () => {
    if (!generationRequest.domain.trim()) {
      setError('请输入领域名称');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const context = {
        intent: generationRequest.intent,
        domain: generationRequest.domain,
        requirements: generationRequest.requirements.filter(req => req.trim()),
        constraints: [],
        governance: {
          code_generation: {
            typescript: {
              strict_mode: true,
              no_any_type: true,
              explicit_return_types: true
            },
            react: {
              functional_components_only: true,
              hooks_naming_convention: "use[A-Z].*",
              prop_validation: 'required'
            },
            testing: {
              coverage_threshold: 80,
              unit_tests: 'required',
              integration_tests: 'required'
            },
            documentation: {
              jsdoc_required: true,
              readme_sections: ['installation', 'usage', 'api', 'examples']
            }
          },
          compliance: {
            security: {
              no_hardcoded_secrets: true,
              input_validation: 'required',
              output_sanitization: 'required'
            },
            performance: {
              bundle_size_limit: "500kb",
              render_time_limit: "100ms",
              memory_usage_limit: "50mb"
            }
          }
        }
      };

      const result = await orchestrator.generate(context);
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    setGenerationRequest(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setGenerationRequest(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => 
        i === index ? value : req
      )
    }));
  };

  const removeRequirement = (index: number) => {
    setGenerationRequest(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const applyToProject = () => {
    if (result?.module?.files) {
      // 在实际应用中，这里会将生成的文件写入项目
      console.log('应用生成的文件到项目:', result.module.files);
      alert(`成功生成 ${result.module.files.length} 个文件！`);
    }
  };

  return (
    <div className="ai-architect-panel p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">AI 架构师</h2>
      
      {/* 生成配置 */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            生成意图
          </label>
          <select
            value={generationRequest.intent}
            onChange={(e) => setGenerationRequest(prev => ({
              ...prev,
              intent: e.target.value as GenerationIntent
            }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="create-react-hook">创建 React Hook</option>
            <option value="create-validation-schema">创建验证 Schema</option>
            <option value="create-api-endpoint">创建 API 端点</option>
            <option value="create-component-story">创建组件故事</option>
            <option value="create-test-suite">创建测试套件</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            领域名称
          </label>
          <input
            type="text"
            value={generationRequest.domain}
            onChange={(e) => setGenerationRequest(prev => ({
              ...prev,
              domain: e.target.value
            }))}
            placeholder="例如: UserProfile, Product, Order"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            需求规格
          </label>
          <div className="space-y-2">
            {generationRequest.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="例如: 用户邮箱验证、价格计算"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {generationRequest.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              添加需求
            </button>
          </div>
        </div>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={loading || !generationRequest.domain.trim()}
        className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? '生成中...' : '生成代码'}
      </button>

      {/* 错误显示 */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* 生成结果 */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">生成结果</h3>
            <button
              onClick={applyToProject}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              应用到项目
            </button>
          </div>

          {/* 质量报告 */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-700 mb-2">质量报告</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">质量分数:</span>
                <span className={`ml-2 font-semibold ${
                  result.quality.score >= 80 ? 'text-green-600' : 
                  result.quality.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {result.quality.score}/100
                </span>
              </div>
              <div>
                <span className="text-gray-600">合规状态:</span>
                <span className={`ml-2 font-semibold ${
                  result.quality.governance_compliance ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.quality.governance_compliance ? '合规' : '不合规'}
                </span>
              </div>
            </div>
          </div>

          {/* 生成的文件预览 */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">生成的文件</h4>
            <div className="space-y-2">
              {result.module.files.map((file: any, index: number) => (
                <div key={index} className="p-3 bg-white border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-sm text-blue-600">{file.path}</span>
                    <span className="text-xs text-gray-500">{file.metadata.type}</span>
                  </div>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-32">
                    {file.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* 问题列表 */}
          {result.quality.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">发现的问题</h4>
              <div className="space-y-2">
                {result.quality.issues.map((issue: any, index: number) => (
                  <div key={index} className={`p-3 rounded-md ${
                    issue.severity === 'high' ? 'bg-red-50 border border-red-200' :
                    issue.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-medium ${
                        issue.severity === 'high' ? 'text-red-700' :
                        issue.severity === 'medium' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        {issue.type} - {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{issue.description}</p>
                    <p className="text-sm text-gray-700">{issue.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};