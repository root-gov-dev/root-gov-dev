/**
 * Advanced Validator Module Generator
 * Purpose: Generate validator modules (zod schema, validation logic) with optional SBOM and compliance checkers.
 */

import { z } from 'zod'
import type { ModuleGenerator } from '../core/intelligent-generator'
import { SBOMValidator } from '../core/sbom'
import { GovernanceRulesEngine } from '../governance/rules-engine'

/** Minimal source file representation */
interface SourceFile {
  path: string
  content: string
  metadata?: Record&lt;string, any&gt;
}

/** Minimal architecture context shape */
interface ArchitectureContext {
  /** Discover existing schemas or domain hints */
  findExistingSchemas?: () =&gt; Array&lt;{ name: string; fields: string[] }&gt;
}

/** Minimal module shape used in generator */
interface Module {
  name: string
  type: 'validator'
  files: SourceFile[]
  dependencies?: string[]
  governance?: Record&lt;string, any&gt;
}

/** Governance intent (subset) for this generator */
interface GovernanceIntent {
  intent: string
  moduleType: 'validator'
  domain: string
  features: string[]
  governance: {
    version: string
    injectable: boolean
    extendable: boolean
    observable: boolean
    compliance?: string[]
  }
  constraints: {
    performance?: string
    memory?: string
    dependencies?: string[]
  }
}

const capitalize = (s: string) =&gt; (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

/**
 * Generator: produce a full validator module with
 * - zod schema (GovernedSchema wrapper)
 * - validation logic
 * - SBOM validator (optional via features)
 * - compliance checker (optional via features)
 */
export class AdvancedValidatorModuleGenerator implements ModuleGenerator {
  /** Generate the base module and companion files. */
  async generateBase(intent: GovernanceIntent, context: ArchitectureContext = {} as any): Promise&lt;Module&gt; {
    const files: (SourceFile | null)[] = [
      await this.generateSchemaDefinition(intent, context),
      await this.generateValidationLogic(intent),
      await this.generateSBOMValidator(intent),
      await this.generateComplianceChecker(intent),
    ]

    const engine = new GovernanceRulesEngine()
    await engine.loadRules('validator')

    const base: Module = {
      name: `${capitalize(intent.domain)}Validator`,
      type: 'validator',
      files: files.filter(Boolean) as SourceFile[],
      dependencies: this.resolveDependencies(intent.features, intent.constraints),
      governance: { version: intent.governance?.version },
    }

    // Apply governance (merge rules + compliance stub)
    const governed = await engine.applyGovernance(base, {
      version: intent.governance?.version,
      compliance: intent.governance?.compliance ?? [],
      constraints: {
        performance: intent.constraints?.performance,
        memory: intent.constraints?.memory,
      },
    })

    return governed
  }

  /** Create governance-enhanced zod schema definition file. */
  private async generateSchemaDefinition(intent: GovernanceIntent, context: ArchitectureContext): Promise&lt;SourceFile&gt; {
    const domain = capitalize(intent.domain)
    const fields = this.inferSchemaFields(intent, context)

    const content = `
/**
 * ${domain} Schema Definition (auto-generated)
 * Includes a governance-enhanced wrapper (GovernedSchema).
 */
import { z } from 'zod'
import { GovernedSchema } from '../core/governance'

/** Raw zod schema inferred from intent + context */
export const ${domain}Schema = z.object({
  ${fields.map((f) =&gt; `${f.name}: ${f.rule}`).join(',\n  ')}
}).transform((data) =&gt; ({
  ...data,
  _governance: {
    validated: true,
    timestamp: new Date().toISOString(),
    version: '${intent.governance.version}'
  }
}))

/** Governance-enhanced schema (wrap zod with governance helpers) */
export const Governed${domain}Schema = new GovernedSchema({
  schema: ${domain}Schema,
  governance: {
    compliance: [${(intent.governance.compliance ?? []).map((c) =&gt; `'${c}'`).join(', ')}],
    audit: true,
    performance: {
      timeout: ${this.parsePerformanceConstraint(intent.constraints.performance)},
      cacheable: true
    }
  }
})
`.trim()

    return {
      path: `validators/${intent.domain}/schema.ts`,
      content,
      metadata: {
        generated: true,
        generator: 'advanced-validator',
        dependencies: ['zod'],
      },
    }
  }

  /** Create a simple validation logic wrapper around the schema. */
  private async generateValidationLogic(intent: GovernanceIntent): Promise&lt;SourceFile&gt; {
    const domain = capitalize(intent.domain)

    const content = `
/**
 * ${domain} Validation API (auto-generated)
 * Wraps the Governed schema and exposes a typed validate function.
 */
import { z } from 'zod'
import { ${domain}Schema } from './schema'

export type ${domain} = z.infer&lt;typeof ${domain}Schema&gt;

export const validate${domain} = (data: unknown) =&gt; {
  const result = ${domain}Schema.safeParse(data)
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map(e =&gt; \`\${e.path.join('.')}: \${e.message}\`)
    }
  }
  return { valid: true }
}
`.trim()

    return {
      path: `validators/${intent.domain}/validator.ts`,
      content,
      metadata: {
        generated: true,
        generator: 'advanced-validator',
      },
    }
  }

  /** Create an optional SBOM validator file if "SBOM" feature is requested. */
  private async generateSBOMValidator(intent: GovernanceIntent): Promise&lt;SourceFile | null&gt; {
    if (!intent.features?.map((f) =&gt; f.toLowerCase()).includes('sbom')) return null
    const domain = capitalize(intent.domain)

    const content = `
/**
 * ${domain} SBOM Validator (auto-generated)
 * Uses a base SBOMValidator with placeholder vulnerability/license checks.
 */
import type { SBOM } from '../core/sbom'
import { SBOMValidator } from '../core/sbom'

export interface SBOMValidationResult {
  valid: boolean
  issues: string[]
  metadata?: Record&lt;string, any&gt;
}

export class ${domain}SBOMValidator extends SBOMValidator {
  async validateSBOM(sbom: SBOM): Promise&lt;SBOMValidationResult&gt; {
    const dependencies = await this.extractDependencies(sbom)
    const vulnerabilities = await this.scanVulnerabilities(dependencies)
    const license = await this.checkLicenseCompliance(dependencies)

    return {
      valid: vulnerabilities.length === 0 &amp;&amp; license.valid,
      issues: [...vulnerabilities, ...license.issues],
      metadata: {
        scannedAt: new Date().toISOString(),
        totalDependencies: dependencies.length,
        governance: this['governance'] ?? {},
      }
    }
  }
}
`.trim()

    return {
      path: `validators/${intent.domain}/sbom.ts`,
      content,
      metadata: {
        generated: true,
        generator: 'advanced-validator',
        dependencies: ['zod'],
      },
    }
  }

  /** Create a simple compliance checker if requested by features. */
  private async generateComplianceChecker(intent: GovernanceIntent): Promise&lt;SourceFile | null&gt; {
    const wantsCompliance = intent.features?.map((f) =&gt; f.toLowerCase()).includes('compliance-check')
    if (!wantsCompliance) return null
    const domain = capitalize(intent.domain)

    const content = `
/**
 * ${domain} Compliance Checker (auto-generated)
 * Placeholder compliance report: pass-through for declared standards.
 */
export interface ComplianceCheck {
  target: string
  passed: boolean
  recommendation: string
}

export interface ComplianceReport {
  compliant: boolean
  results: ComplianceCheck[]
  recommendations: string[]
}

export const check${domain}Compliance = async (requirements: string[] = []): Promise&lt;ComplianceReport&gt; =&gt; {
  const results: ComplianceCheck[] = requirements.map((r) =&gt; ({
    target: r,
    passed: true,
    recommendation: \`Keep \${r} controls enforced.\`,
  }))

  return {
    compliant: results.every((r) =&gt; r.passed),
    results,
    recommendations: results.filter((r) =&gt; !r.passed).map((r) =&gt; r.recommendation),
  }
}
`.trim()

    return {
      path: `validators/${intent.domain}/compliance.ts`,
      content,
      metadata: {
        generated: true,
        generator: 'advanced-validator',
      },
    }
  }

  /** Very simple schema field inference: produce 3 common fields. */
  private inferSchemaFields(_intent: GovernanceIntent, context: ArchitectureContext): Array&lt;{ name: string; rule: string }&gt; {
    const existing = context.findExistingSchemas?.() ?? []
    if (existing.length &gt; 0) {
      // If existing hints are available, map to string/number/email for demo purposes
      return existing[0].fields.slice(0, 3).map((f, i) =&gt; ({
        name: f,
        rule: i === 2 ? "z.string().email('Invalid email')" : 'z.string().min(1)',
      }))
    }
    // Default fallback fields
    return [
      { name: 'id', rule: "z.string().min(1, 'id is required')" },
      { name: 'name', rule: "z.string().min(1, 'name is required')" },
      { name: 'email', rule: "z.string().email('Invalid email')" },
    ]
  }

  /** Convert perf string constraint like "&lt; 100ms" into number ms. */
  private parsePerformanceConstraint(perf?: string): number {
    if (!perf) return 5000
    const digits = parseInt(perf.replace(/[^0-9]/g, ''), 10)
    return Number.isFinite(digits) ? digits : 5000
  }

  /** Resolve dependencies based on features + constraints. */
  private resolveDependencies(features: string[] = [], constraints?: GovernanceIntent['constraints']): string[] {
    const deps = new Set&lt;string&gt;(['zod'])
    if (features.map((f) =&gt; f.toLowerCase()).includes('sbom')) deps.add('zod') // placeholder; real sbom lib would be added
    if (constraints?.dependencies?.includes('tree-shaking')) {
      // keep minimal set; do nothing here, but hook exists
    }
    return Array.from(deps)
  }
}
