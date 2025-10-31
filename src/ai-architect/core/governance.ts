/**
 * Governance Core Module
 * Purpose: Provide type-safe governance validation utilities and a governed React state hook.
 * - GovernedState: generic state container with Zod schema enforcement.
 * - GovernedValidator: Zod-based structural/compliance/performance validator.
 * - QualityChecker: simplified quality/governance checker for generated modules.
 * - GovernedSchema: governance-enhanced wrapper around zod schema for metadata injection.
 * - useGovernedState: React hook wrapping GovernedState with runtime validation on set.
 */

import { z } from 'zod'
import { useRef, useState } from 'react'
import { QualityReport, GovernanceIssue } from './types'

/**
 * Governed state container with strict Zod validation on write.
 */
export class GovernedState<T> {
  /** Current state snapshot */
  private state: T
  /** Zod schema for validation */
  private schema: z.ZodSchema<T>

  /**
   * Construct a governed state with schema validation.
   */
  constructor(schema: z.ZodSchema<T>, initialState: T) {
    this.schema = schema
    this.state = this.validate(initialState)
  }

  /**
   * Validate data via Zod before accepting.
   */
  private validate(data: T): T {
    const result = this.schema.safeParse(data)
    if (!result.success) {
      throw new Error(`治理验证失败: ${result.error.message}`)
    }
    return result.data
  }

  /**
   * Set state with validation.
   */
  setState(newState: T): void {
    this.state = this.validate(newState)
  }

  /**
   * Read current state snapshot.
   */
  getState(): T {
    return this.state
  }
}

/**
 * Zod-based governance validator combining structure, compliance and perf constraints.
 */
export class GovernedValidator {
  private schema: z.ZodSchema<any>
  private compliance: {
    gdpr: boolean
    sox: boolean
    audit: boolean
  }
  private performance: {
    cacheable: boolean
    timeout: number
  }

  /**
   * Construct a validator with schema and governance settings.
   */
  constructor(config: {
    schema: z.ZodSchema<any>
    compliance: { gdpr: boolean; sox: boolean; audit: boolean }
    performance: { cacheable: boolean; timeout: number }
  }) {
    this.schema = config.schema
    this.compliance = config.compliance
    this.performance = config.performance
  }

  /**
   * Execute validation and return structured result.
   */
  validate(data: any): { valid: boolean; errors?: string[] } {
    const result = this.schema.safeParse(data)
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
      }
    }
    // Note: this.compliance / this.performance can be enforced here if required.
    return { valid: true }
  }
}

/**
 * Quality and governance checker (simplified placeholder).
 * Aggregates basic TS/React/tests/docs/security/perf checks.
 */
export class QualityChecker {
  /**
   * Validate generated module and calculate a composite quality score.
   */
  async validateGenerated(module: any): Promise<QualityReport> {
    const checks = await Promise.all([
      this.checkTypeScript(module.files),
      this.checkReactBestPractices(module.files),
      this.checkTestCoverage(module.tests),
      this.checkDocumentation(module.docs),
      this.checkSecurity(module.files),
      this.checkPerformance(module.files),
    ])

    const issues: GovernanceIssue[] = checks.flatMap((check) => check.issues)
    const score = this.calculateQualityScore(checks)

    return {
      score,
      issues,
      recommendations: this.generateRecommendations(checks),
      governance_compliance: this.checkGovernanceCompliance(module),
    }
  }

  /**
   * Basic TypeScript quality checks.
   */
  private async checkTypeScript(files: any[]): Promise<{ issues: GovernanceIssue[] }> {
    const issues: GovernanceIssue[] = []
    files?.forEach((file) => {
      if (file.path?.endsWith('.ts') || file.path?.endsWith('.tsx')) {
        if (/\bany\b/.test(file.content)) {
          issues.push({
            type: 'quality',
            severity: 'medium',
            description: '发现使用 any 类型',
            recommendation: '使用具体的类型注解代替 any',
          })
        }
      }
    })
    return { issues }
  }

  /**
   * React best practices (simple heuristics).
   */
  private async checkReactBestPractices(files: any[]): Promise<{ issues: GovernanceIssue[] }> {
    const issues: GovernanceIssue[] = []
    files?.forEach((file) => {
      if (file.path?.endsWith('.tsx') || file.path?.endsWith('.jsx')) {
        const isClassComponent =
          /class\s+\w+\s+extends\s+React\.Component/.test(file.content) ||
          /class\s+\w+\s+extends\s+Component/.test(file.content)
        if (isClassComponent) {
          issues.push({
            type: 'quality',
            severity: 'medium',
            description: '使用类组件而不是函数组件',
            recommendation: '转换为函数组件并使用 Hooks',
          })
        }
      }
    })
    return { issues }
  }

  /**
   * Test coverage (placeholder).
   */
  private async checkTestCoverage(_tests: any): Promise<{ issues: GovernanceIssue[] }> {
    return { issues: [] }
  }

  /**
   * Documentation completeness.
   */
  private async checkDocumentation(docs: any): Promise<{ issues: GovernanceIssue[] }> {
    const issues: GovernanceIssue[] = []
    if (!docs || !docs.description) {
      issues.push({
        type: 'quality',
        severity: 'low',
        description: '缺少文档描述',
        recommendation: '添加模块描述和用法说明',
      })
    }
    return { issues }
  }

  /**
   * Security checks (simple patterns).
   */
  private async checkSecurity(files: any[]): Promise<{ issues: GovernanceIssue[] }> {
    const issues: GovernanceIssue[] = []
    files?.forEach((file) => {
      const hasSensitiveWords =
        /password|secret|api_key/i.test(file.content ?? '') ||
        /hardcode|hard-coded/.test(file.content ?? '')
      if (hasSensitiveWords) {
        issues.push({
          type: 'security',
          severity: 'high',
          description: '可能存在硬编码的敏感信息',
          recommendation: '使用环境变量或安全的配置管理',
        })
      }
    })
    return { issues }
  }

  /**
   * Performance checks (placeholder).
   */
  private async checkPerformance(_files: any[]): Promise<{ issues: GovernanceIssue[] }> {
    return { issues: [] }
  }

  /**
   * Compute composite quality score with basic severity weights.
   */
  private calculateQualityScore(checks: any[]): number {
    const severityWeights = { high: 3, medium: 2, low: 1 } as const
    const weightedScore = checks.reduce((score, check) => {
      return (
        score -
        check.issues.reduce(
          (sum: number, issue: GovernanceIssue) => sum + severityWeights[issue.severity],
          0,
        )
      )
    }, 100)
    return Math.max(0, weightedScore)
  }

  /**
   * Aggregate recommendations from all checks.
   */
  private generateRecommendations(checks: any[]): string[] {
    const recommendations: string[] = []
    checks.forEach((check) => {
      check.issues.forEach((issue: GovernanceIssue) => {
        recommendations.push(issue.recommendation)
      })
    })
    return [...new Set(recommendations)]
  }

  /**
   * Governance compliance marker presence.
   */
  private checkGovernanceCompliance(module: any): boolean {
    return Boolean(module?.governance && module.governance.validated)
  }
}

/**
 * GovernedSchema
 * Wraps a zod schema and injects governance helpers (e.g., normalize error shape, attach meta).
 */
export class GovernedSchema<T extends z.ZodTypeAny = z.ZodTypeAny> {
  /** Raw zod schema */
  private readonly schema: T
  /** Governance policy metadata (compliance, audit, perf hints) */
  private readonly governance: Record<string, any>

  /**
   * Construct a governance-enhanced schema wrapper.
   */
  constructor(config: { schema: T; governance?: Record<string, any> }) {
    this.schema = config.schema
    this.governance = config.governance ?? {}
  }

  /**
   * Parse with exception on invalid input.
   */
  parse(data: unknown) {
    const parsed = this.schema.parse(data)
    return this.attachMeta(parsed)
  }

  /**
   * Safe parse, returning success flag and normalized errors.
   */
  safeParse(
    data: unknown,
  ):
    | { success: true; data: any }
    | {
        success: false
        errors: string[]
      } {
    const result = this.schema.safeParse(data)
    if (result.success) {
      return { success: true, data: this.attachMeta(result.data) }
    }
    return {
      success: false,
      errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    }
  }

  /**
   * Attach governance metadata to parsed payload.
   */
  private attachMeta(payload: any) {
    return {
      ...payload,
      _governance: {
        ...(payload?._governance ?? {}),
        ...this.governance,
        validated: true,
        timestamp: new Date().toISOString(),
      },
    }
  }
}

/**
 * React hook wrapping GovernedState; validates before updating.
 */
export const useGovernedState = <T,>(
  schema: z.ZodSchema<T>,
  initialState: T,
) => {
  // Hold a single GovernedState instance across renders.
  const instanceRef = useRef<GovernedState<T> | null>(null)
  if (!instanceRef.current) {
    instanceRef.current = new GovernedState<T>(schema, initialState)
  }

  const [state, setState] = useState<T>(instanceRef.current.getState())

  /**
   * Set governed state with schema validation.
   */
  const setGovernedState = (newState: T) => {
    try {
      instanceRef.current!.setState(newState)
      setState(newState)
    } catch (error) {
      // Keep console in Chinese to align with existing messages.
      console.error('状态设置失败:', error)
    }
  }

  return [state, setGovernedState] as const
}
