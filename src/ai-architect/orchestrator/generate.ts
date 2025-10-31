/**
 * AI 架构师协调器
 * 根据意图协调不同的 AI 模块进行代码生成
 */
import { GenerationContext, GeneratedModule } from '../core/types';
import { ReactHookGenerator } from '../modules/gov-ai-writer/generators/react-hook';
import { SchemaValidatorGenerator } from '../modules/gov-ai-validator/generators/schema-validator';
import { QualityChecker } from '../core/governance';

export class AIArchitectOrchestrator {
  private qualityChecker = new QualityChecker();

  async generate(context: GenerationContext): Promise<{
    module: GeneratedModule;
    quality: any;
    metadata: any;
  }> {
    const generator = this.selectGenerator(context.intent);
    
    if (!generator) {
      throw new Error(`没有找到适用于意图 '${context.intent}' 的生成器`);
    }

    // 执行生成
    const module = await generator.generate(context);
    
    // 质量检查
    const quality = await this.qualityChecker.validateGenerated(module);
    
    // 生成元数据
    const metadata = this.generateMetadata(context, module, quality);

    return {
      module,
      quality,
      metadata
    };
  }

  private selectGenerator(intent: string) {
    switch (intent) {
      case 'create-react-hook':
        return new ReactHookGenerator();
      case 'create-validation-schema':
        return new SchemaValidatorGenerator();
      // 其他生成器可以在这里添加
      default:
        return null;
    }
  }

  private generateMetadata(context: GenerationContext, module: GeneratedModule, quality: any) {
    return {
      generation_id: this.generateId(),
      intent: context.intent,
      domain: context.domain,
      timestamp: new Date().toISOString(),
      files_generated: module.files.length,
      quality_score: quality.score,
      compliance_status: quality.governance_compliance ? 'compliant' : 'non-compliant',
      dependencies: module.metadata.dependencies,
      constraints_applied: context.constraints.length
    };
  }

  private generateId(): string {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 批量生成能力
  async generateBatch(contexts: GenerationContext[]): Promise<any[]> {
    const results = await Promise.all(
      contexts.map(context => this.generate(context))
    );

    // 生成批量报告
    const batchReport = this.generateBatchReport(results);
    
    return [
      ...results,
      { type: 'batch_report', report: batchReport }
    ];
  }

  private generateBatchReport(results: any[]) {
    const totalFiles = results.reduce((sum, result) => 
      sum + result.module.files.length, 0
    );
    
    const avgQuality = results.reduce((sum, result) => 
      sum + result.quality.score, 0
    ) / results.length;

    const complianceRate = results.filter(result => 
      result.quality.governance_compliance
    ).length / results.length;

    return {
      total_generations: results.length,
      total_files_generated: totalFiles,
      average_quality_score: Math.round(avgQuality * 100) / 100,
      compliance_rate: Math.round(complianceRate * 100),
      generation_time: new Date().toISOString(),
      summary_by_intent: this.summarizeByIntent(results)
    };
  }

  private summarizeByIntent(results: any[]) {
    const summary: Record<string, any> = {};
    
    results.forEach(result => {
      const intent = result.metadata.intent;
      if (!summary[intent]) {
        summary[intent] = {
          count: 0,
          total_files: 0,
          quality_scores: []
        };
      }
      
      summary[intent].count++;
      summary[intent].total_files += result.module.files.length;
      summary[intent].quality_scores.push(result.quality.score);
    });

    // 计算平均质量分数
    Object.keys(summary).forEach(intent => {
      const scores = summary[intent].quality_scores;
      summary[intent].average_quality = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
      delete summary[intent].quality_scores;
    });

    return summary;
  }
}