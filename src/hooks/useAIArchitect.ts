/**
 * AI 架构师 React Hook
 * 提供 AI 代码生成的 React 集成
 */
import { useState, useCallback } from 'react';
import { AIArchitectOrchestrator } from '../ai-architect/orchestrator/generate';
import { GenerationContext, GenerationIntent } from '../ai-architect/core/types';

interface UseAIArchitectReturn {
  generate: (context: Partial<GenerationContext>) => Promise<void>;
  loading: boolean;
  result: any;
  error: string | null;
  reset: () => void;
}

export const useAIArchitect = (): UseAIArchitectReturn => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const orchestrator = new AIArchitectOrchestrator();

  const generate = useCallback(async (context: Partial<GenerationContext>) => {
    if (!context.intent || !context.domain) {
      setError('生成意图和领域名称是必需的');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullContext: GenerationContext = {
        intent: context.intent as GenerationIntent,
        domain: context.domain,
        requirements: context.requirements || [],
        constraints: context.constraints || [],
        governance: context.governance || {
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

      const generationResult = await orchestrator.generate(fullContext);
      setResult(generationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    generate,
    loading,
    result,
    error,
    reset
  };
};

// 预定义的生成配置
export const predefinedIntents = {
  reactHook: {
    intent: 'create-react-hook' as GenerationIntent,
    description: '生成类型安全的 React Hook',
    defaultRequirements: ['状态管理', '数据验证', '业务逻辑']
  },
  validationSchema: {
    intent: 'create-validation-schema' as GenerationIntent,
    description: '生成 Zod 验证 Schema',
    defaultRequirements: ['数据类型验证', '格式检查', '自定义规则']
  },
  apiEndpoint: {
    intent: 'create-api-endpoint' as GenerationIntent,
    description: '生成 API 端点代码',
    defaultRequirements: ['路由定义', '请求处理', '错误处理']
  }
};

// 批量生成 Hook
export const useAIBatchArchitect = () => {
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [batchError, setBatchError] = useState<string | null>(null);
  
  const orchestrator = new AIArchitectOrchestrator();

  const generateBatch = useCallback(async (contexts: GenerationContext[]) => {
    if (contexts.length === 0) {
      setBatchError('请提供生成上下文');
      return;
    }

    setBatchLoading(true);
    setBatchError(null);

    try {
      const results = await orchestrator.generateBatch(contexts);
      setBatchResults(results);
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : '批量生成失败');
    } finally {
      setBatchLoading(false);
    }
  }, []);

  const resetBatch = useCallback(() => {
    setBatchResults([]);
    setBatchError(null);
    setBatchLoading(false);
  }, []);

  return {
    generateBatch,
    batchLoading,
    batchResults,
    batchError,
    resetBatch
  };
};