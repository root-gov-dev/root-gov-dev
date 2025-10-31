/**
 * Home Page - 展示系統整合與部署、治理語意層設計文檔與示例
 * 說明：
 * - 不引入新路由；在首頁展示兩大區塊
 * - 包含 Mermaid/JSON/TS/YAML 示例，以代碼塊形式呈現（無需外部依賴）
 * - 使用 Tailwind 提升可讀性與對比度
 */

import React from 'react'

/**
 * 代碼塊展示組件
 * 以語法高亮風格容器呈現字符串內容
 */
function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="px-4 py-3 text-sm font-medium bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">
        {title}
      </div>
      <pre className="p-4 overflow-auto text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-900">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/**
 * 系統整合與部署區塊
 * 展示 mermaid 架構圖源碼與 Kubernetes YAML 示例
 */
function SystemIntegrationSection() {
  const mermaid = `graph TB
    UI[自然語言界面] --> Parser[語意解析器]
    Parser --> Intent[意圖識別引擎]
    Intent --> Generator[模組生成器]
    Intent --> Orchestrator[協調引擎]
    Intent --> Evolution[演化引擎]
    
    Generator --> Templates[模板引擎]
    Generator --> Governance[治理引擎]
    Generator --> SBOM[SBOM生成器]
    
    Orchestrator --> Dependency[依賴分析器]
    Orchestrator --> Interface[介面生成器]
    
    Evolution --> Migration[遷移規劃器]
    Evolution --> Validation[驗證引擎]
    
    Templates --> FileSystem[檔案系統]
    Governance --> Config[配置管理]
    SBOM --> Tracking[追蹤系統]
    
    FileSystem --> CI[CI/CD整合]
    Config --> Monitor[監控系統]
    Tracking --> Audit[審計系統]`

  const deployYaml = `# deployment/ai-architect-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ai-architect-config
data:
  # 核心引擎配置
  semantic-parser.yaml: |
    nlp:
      model: "gpt-4-turbo"
      temperature: 0.1
      contextWindow: 32000
    
    intentRecognition:
      confidence: 0.85
      fallbackStrategy: "clarify"
    
  # 模組生成配置  
  module-generator.yaml: |
    templates:
      basePath: "/templates"
      customPath: "/custom-templates"
    
    governance:
      enforceByDefault: true
      complianceProfiles: ["GDPR", "SOX", "HIPAA"]
    
    sbom:
      format: "spdx-json"
      includeDevDependencies: false
      
  # 治理配置
  governance-engine.yaml: |
    globalRules:
      dataPrivacy: "strict"
      auditTrail: "comprehensive"
      performanceMonitoring: "enabled"
    
    compliance:
      autoCheck: true
      reportingFrequency: "daily"
      
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-architect
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-architect
  template:
    metadata:
      labels:
        app: ai-architect
    spec:
      containers:
      - name: ai-architect
        image: ai-architect:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: GOVERNANCE_STRICT_MODE
          value: "true"
        volumeMounts:
        - name: config
          mountPath: /config
        - name: templates
          mountPath: /templates
      volumes:
      - name: config
        configMap:
          name: ai-architect-config
      - name: templates
        persistentVolumeClaim:
          claimName: templates-pvc`

  return (
    <section className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3">
          系統整合與部署 (System Integration & Deployment)
        </h2>
        <p className="text-blue-700 dark:text-blue-300">
          展示完整系統架構圖與 Kubernetes 部署配置範例
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CodeBlock title="完整系統架構圖 (Mermaid)" code={mermaid} />
        <div className="rounded-lg border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="px-4 py-3 text-sm font-medium bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100">
            視覺化架構圖
          </div>
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-neutral-600 dark:text-neutral-400">架構圖視覺化區域</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                此處可整合 Mermaid 或其他圖表庫
              </p>
            </div>
          </div>
        </div>
      </div>
      <CodeBlock title="部署配置範例 (Kubernetes YAML)" code={deployYaml} />
    </section>
  )
}

/**
 * 治理語意層區塊
 * 展示 JSON 輸入、TS 引擎接口與生成器核心接口代碼示例
 */
function GovernanceSemanticLayerSection() {
  const semanticJson = `{
  "intent": "create-module",
  "moduleType": "validator",
  "features": ["SBOM", "Zod", "CI integration", "compliance-check"],
  "governance": {
    "version": "v1.0.0",
    "injectable": true,
    "extendable": true,
    "observable": true,
    "compliance": ["GDPR", "SOX", "PCI-DSS"]
  },
  "constraints": {
    "performance": "< 100ms",
    "memory": "< 50MB",
    "dependencies": ["minimal", "tree-shaking"]
  },
  "output": "typescript",
  "integration": {
    "ci": "github-actions",
    "testing": "jest",
    "documentation": "typedoc"
  }
}`

  const engineTs = `class GovernanceSemanticEngine {
  async parseIntent(naturalLanguage: string): Promise<GovernanceIntent> {
    const intent = await this.nlp.parse(naturalLanguage);
    const semanticMapping = await this.mapToGovernanceSemantics(intent);
    const validated = await this.validateSemanticConsistency(semanticMapping);
    return validated;
  }
  
  async generateFromSemantic(intent: GovernanceIntent): Promise<GeneratedArtifact[]> {
    const artifacts = await Promise.all([
      this.generateTypeDefinitions(intent),
      this.generateValidationLogic(intent),
      this.generateCIPipeline(intent),
      this.generateGovernanceConfig(intent),
      this.generateDocumentation(intent),
      this.generateTests(intent)
    ]);
    return artifacts.flat();
  }
}`

  const generatorTs = `export class IntelligentModuleGenerator {
  private semanticEngine: GovernanceSemanticEngine;
  private templateRegistry: TemplateRegistry;
  private governanceInject: GovernanceInjector;
  
  async generateModule(payload: GovernanceIntent): Promise<GeneratedArtifact[]> {
    const context = await this.analyzeArchitectureContext();
    const generator = this.getModuleGenerator(payload.moduleType);
    const baseModule = await generator.generateBase(payload, context);
    const governedModule = await this.governanceInject.inject(baseModule, payload.governance);
    const artifacts = await this.generateSupportingArtifacts(governedModule, payload);
    return [governedModule, ...artifacts];
  }
}`

  return (
    <section className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-3">
          治理語意層設計 (Governance Semantic Layer)
        </h2>
        <p className="text-green-700 dark:text-green-300">
          下列示例展示治理語意輸入格式、語意理解與轉換流程，以及智能模組生成器的核心實作接口。
        </p>
      </div>
      <CodeBlock title="語意輸入格式 (JSON)" code={semanticJson} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CodeBlock title="語意理解與轉換引擎 (TypeScript)" code={engineTs} />
        <CodeBlock title="智能模組生成器核心 (TypeScript)" code={generatorTs} />
      </div>
    </section>
  )
}

/**
 * 首頁主組件
 * 集中展示系統整合與治理語意層兩個版塊
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              AI Architect — System Overview
            </h1>
          </div>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            本頁整合展示系統架構、部署配置與治理語意層設計。所有示例可直接複用到你的配置或生成器中。
          </p>
        </header>

        <SystemIntegrationSection />
        <GovernanceSemanticLayerSection />

        <footer className="text-center pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400">
            Built with React, TypeScript & Tailwind CSS
          </p>
        </footer>
      </div>
    </main>
  )
}