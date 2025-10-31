#!/usr/bin/env python3
"""
决策增强引擎 - 通过历史学习和实时分析提升合规修复的决策能力
关键功能：故障模式识别、优先级计算、预测性阻塞检测
"""

import json
import yaml
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional

class DecisionEngine:
    def __init__(self, history_path: str = "compliance-history.json"):
        self.history_path = Path(history_path)
        self.history = self._load_history()
        self.patterns = self._extract_failure_patterns()
        
    def _load_history(self) -> Dict[str, Any]:
        """加载历史合规执行记录"""
        if self.history_path.exists():
            with open(self.history_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "ci_failures": [],
            "remediation_success": [],
            "failure_patterns": {},
            "execution_times": {}
        }
    
    def _extract_failure_patterns(self) -> Dict[str, Any]:
        """从历史数据中提取故障模式"""
        patterns = {}
        
        for failure in self.history.get("ci_failures", []):
            error_type = failure.get("error_type", "")
            file_path = failure.get("file_path", "")
            timestamp = failure.get("timestamp", "")
            
            # 提取常见模式：双扩展名、命名违规、依赖冲突等
            if ".txt" in file_path and file_path.endswith(".txt"):
                patterns["double_extension"] = patterns.get("double_extension", 0) + 1
            if "naming" in error_type.lower():
                patterns["naming_violation"] = patterns.get("naming_violation", 0) + 1
            if "dependency" in error_type.lower():
                patterns["dependency_issue"] = patterns.get("dependency_issue", 0) + 1
                
        return patterns
    
    def calculate_priority(self, issue: Dict[str, Any]) -> int:
        """计算问题修复优先级（0-100分）"""
        base_score = 0
        
        # 基于影响面评分
        impact_factors = {
            "blocking_ci": 40,
            "security_risk": 35,
            "multiple_files": 25,
            "frequent_occurrence": 20
        }
        
        for factor, weight in impact_factors.items():
            if issue.get(factor, False):
                base_score += weight
        
        # 基于历史频率调整
        issue_type = issue.get("type", "")
        historical_freq = self.patterns.get(issue_type, 0)
        if historical_freq > 3:
            base_score += 15
        elif historical_freq > 1:
            base_score += 5
            
        return min(100, base_score)
    
    def predict_blockers(self, changed_files: List[str]) -> List[Dict[str, Any]]:
        """预测可能引发流水线阻塞的问题"""
        predicted_issues = []
        
        for file_path in changed_files:
            issues = []
            
            # 检测双扩展名风险
            if re.search(r'\.\w+\.txt$', file_path):
                issues.append({
                    "type": "double_extension",
                    "file_path": file_path,
                    "predicted_impact": "high",
                    "confidence": 0.95,
                    "suggested_fix": f"重命名文件，移除 .txt 后缀: {file_path} → {file_path.replace('.txt', '')}"
                })
            
            # 检测命名合规风险
            if any(keyword in file_path.lower() for keyword in ["test", "temp", "backup"]):
                issues.append({
                    "type": "naming_convention",
                    "file_path": file_path, 
                    "predicted_impact": "medium",
                    "confidence": 0.7,
                    "suggested_fix": f"遵循命名规范，避免使用临时性词汇: {file_path}"
                })
                
            predicted_issues.extend(issues)
            
        # 按预测影响排序
        return sorted(predicted_issues, 
                     key=lambda x: {"high": 2, "medium": 1, "low": 0}[x["predicted_impact"]], 
                     reverse=True)
    
    def recommend_remediation_strategy(self, issues: List[Dict[str, Any]]) -> Dict[str, Any]:
        """推荐修复策略"""
        high_priority = [issue for issue in issues if self.calculate_priority(issue) >= 70]
        medium_priority = [issue for issue in issues if 40 <= self.calculate_priority(issue) < 70]
        low_priority = [issue for issue in issues if self.calculate_priority(issue) < 40]
        
        strategy = {
            "immediate_actions": high_priority,
            "batch_fixes": medium_priority,
            "deferred_improvements": low_priority,
            "estimated_time": len(high_priority) * 10 + len(medium_priority) * 5 + len(low_priority) * 2,
            "parallelizable": len(high_priority) > 2
        }
        
        return strategy
    
    def record_outcome(self, issue: Dict[str, Any], success: bool, time_taken: int):
        """记录修复结果用于学习"""
        record = {
            "issue_type": issue.get("type"),
            "file_path": issue.get("file_path"),
            "success": success,
            "time_taken": time_taken,
            "timestamp": datetime.now().isoformat()
        }
        
        if success:
            self.history["remediation_success"].append(record)
        else:
            self.history["ci_failures"].append(record)
            
        self._save_history()
    
    def _save_history(self):
        """保存历史数据"""
        self.history["last_updated"] = datetime.now().isoformat()
        with open(self.history_path, 'w', encoding='utf-8') as f:
            json.dump(self.history, f, indent=2, ensure_ascii=False)

# 使用示例
if __name__ == "__main__":
    engine = DecisionEngine()
    
    # 模拟预测
    test_files = ["scripts/normalize_and_hash.py.txt", "manifests/test-deployment.yaml"]
    predicted = engine.predict_blockers(test_files)
    
    print("预测的阻塞问题:")
    for issue in predicted:
        print(f"- {issue['file_path']}: {issue['suggested_fix']} (置信度: {issue['confidence']})")
    
    # 模拟优先级计算
    sample_issue = {
        "type": "double_extension", 
        "file_path": "test.txt.yaml",
        "blocking_ci": True,
        "security_risk": False,
        "multiple_files": True
    }
    priority = engine.calculate_priority(sample_issue)
    print(f"问题优先级分数: {priority}/100")
