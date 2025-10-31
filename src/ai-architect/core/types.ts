/**
 * AI架构师核心类型定义
 * 定义生成意图、上下文、约束、治理规则与语义治理接口
 */

export interface GenerationContext {
  intent: GenerationIntent;
  domain: string;
  requirements: string[];
  constraints: Constraint[];
  governance: GovernanceRules;
  metadata?: Record&lt;string, any&gt;;
}

export type GenerationIntent =
  | 'create-react-hook'
  | 'create-api-endpoint'
  | 'create-validation-schema'
  | 'create-ci-pipeline'
  | 'create-component-story'
  | 'create-test-suite'
  | 'create-documentation'
  | 'create-performance-benchmark';

export interface Constraint {
  type: 'security' | 'performance' | 'compliance' | 'quality';
  rule: string;
  severity: 'error' | 'warning';
}

export interface GovernanceRules {
  code_generation: {
    typescript: {
      strict_mode: boolean;
      no_any_type: boolean;
      explicit_return_types: boolean;
    };
    react: {
      functional_components_only: boolean;
      hooks_naming_convention: string;
      prop_validation: 'required' | 'optional';
    };
    testing: {
      coverage_threshold: number;
      unit_tests: 'required' | 'optional';
      integration_tests: 'required' | 'optional';
    };
    documentation: {
      jsdoc_required: boolean;
      readme_sections: string[];
    };
  };
  compliance: {
    security: {
      no_hardcoded_secrets: boolean;
      input_validation: 'required' | 'optional';
      output_sanitization: 'required' | 'optional';
    };
    performance: {
      bundle_size_limit: string;
      render_time_limit: string;
      memory_usage_limit: string;
    };
  };
}

export interface GeneratedModule {
  files: GeneratedFile[];
  documentation: Documentation;
  governance: ModuleGovernance;
  metadata: {
    version: string;
    author: string;
    dependencies: string[];
    generated_at: string;
  };
}

export interface GeneratedFile {
  path: string;
  content: string;
  metadata: {
    type: string;
    dependencies: string[];
    governance: {
      validated: boolean;
      observable: boolean;
      testable: boolean;
    };
  };
}

export interface Documentation {
  description: string;
  usage: string;
  api: ApiDocumentation[];
  examples: string[];
}

export interface ApiDocumentation {
  name: string;
  description: string;
  parameters: ParameterDocumentation[];
  returns: string;
  examples: string[];
}

export interface ParameterDocumentation {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface ModuleGovernance {
  validated: boolean;
  compliance: {
    security: boolean;
    performance: boolean;
    accessibility: boolean;
  };
  quality_score: number;
  issues: GovernanceIssue[];
}

export interface GovernanceIssue {
  type: 'security' | 'performance' | 'quality' | 'compliance';
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface QualityReport {
  score: number;
  issues: GovernanceIssue[];
  recommendations: string[];
  governance_compliance: boolean;
}

/**
 * 语义治理：模块类型与意图
 */
export type ModuleType =
  | 'validator'
  | 'writer'
  | 'visual'
  | 'ci'
  | 'test'
  | 'docs'
  | 'api'
  | 'state'
  | 'generic';

/**
 * 语义治理意图（与用户提供的语义输入格式对齐）
 */
export interface GovernanceIntent {
  intent: 'create-module' | string;
  moduleType: ModuleType;
  features: string[];
  governance: {
    version: string;
    injectable: boolean;
    extendable: boolean;
    observable: boolean;
    compliance: string[];
  };
  constraints: {
    performance?: string; // e.g. "&lt; 100ms"
    memory?: string; // e.g. "&lt; 50MB"
    dependencies?: string[];
  };
  output?: 'typescript' | 'javascript' | string;
  integration?: {
    ci?: string;
    testing?: string;
    documentation?: string;
  };
  domain?: string;
}
