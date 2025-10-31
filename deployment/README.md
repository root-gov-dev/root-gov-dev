# AI 架构师系统部署指南

## 系统架构概述

AI 架构师系统是一个基于 Claude Code 级别架构理解的智能代码生成平台，提供完整的治理化模块生成、演化管理和多模块协调能力。

### 核心组件

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端界面      │    │   API 网关       │    │   核心引擎      │
│   (React)       │◄──►│   (Nginx)        │◄──►│   (Node.js)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   监控系统      │    │   缓存层          │    │   数据库        │
│ (Prometheus)    │◄──►│   (Redis)        │◄──►│   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 快速开始

### 前置要求

- Docker 20.10+ 和 Docker Compose
- Node.js 18+ (开发环境)
- 至少 4GB 可用内存
- 10GB 可用磁盘空间

### 开发环境部署

1. **克隆项目**
   ```bash
   git clone https://github.com/your-org/ai-architect.git
   cd ai-architect
   ```

2. **环境配置**
   ```bash
   # 复制环境配置文件
   cp .env.example .env
   
   # 编辑配置 (可选)
   vi .env
   ```

3. **启动服务**
   ```bash
   # 使用 Docker Compose
   docker-compose up -d
   
   # 或者开发模式
   docker-compose -f docker-compose.dev.yml up
   ```

4. **验证部署**
   ```bash
   # 检查服务状态
   docker-compose ps
   
   # 测试 API
   curl http://localhost:8080/health
   ```

### 生产环境部署

#### Kubernetes 部署

1. **创建命名空间**
   ```bash
   kubectl create namespace ai-architect
   ```

2. **应用配置**
   ```bash
   # 部署基础配置
   kubectl apply -f deployment/ai-architect-config.yaml -n ai-architect
   
   # 部署应用
   kubectl apply -f deployment/ai-architect-deployment.yaml -n ai-architect
   ```

3. **验证部署**
   ```bash
   # 检查 Pod 状态
   kubectl get pods -n ai-architect
   
   # 检查服务
   kubectl get services -n ai-architect
   
   # 查看日志
   kubectl logs -l app=ai-architect -n ai-architect
   ```

#### Helm 部署

1. **添加 Helm 仓库**
   ```bash
   helm repo add ai-architect https://charts.ai-architect.com
   helm repo update
   ```

2. **安装 Chart**
   ```bash
   helm install ai-architect ai-architect/ai-architect \
     --namespace ai-architect \
     --create-namespace \
     --values deployment/values-production.yaml
   ```

## 配置说明

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `NODE_ENV` | `production` | 运行环境 |
| `GOVERNANCE_STRICT_MODE` | `true` | 治理严格模式 |
| `SEMANTIC_PARSER_ENABLED` | `true` | 语义解析器启用 |
| `DATABASE_URL` | - | 数据库连接字符串 |
| `REDIS_URL` | - | Redis 连接字符串 |
| `LOG_LEVEL` | `info` | 日志级别 |

### 配置文件

系统使用多层配置：

1. **环境变量** - 最高优先级
2. **ConfigMap** - Kubernetes 配置
3. **配置文件** - 应用默认配置
4. **模板配置** - 模块生成模板

## 监控和运维

### 健康检查端点

- `GET /health` - 健康状态
- `GET /ready` - 就绪状态  
- `GET /live` - 存活状态
- `GET /metrics` - Prometheus 指标

### 监控仪表板

访问 Grafana: http://localhost:3000
- 默认用户名: `admin`
- 默认密码: `admin`

预配置仪表板:
- 系统性能监控
- 代码生成质量
- 治理合规状态
- API 使用统计

### 日志管理

系统日志通过 Loki 收集，可在 Grafana 中查看：

```bash
# 查看最近日志
docker-compose logs ai-architect

# 跟踪日志
docker-compose logs -f ai-architect

# 在 Kubernetes 中查看
kubectl logs -l app=ai-architect -n ai-architect --tail=100
```

## 安全配置

### TLS/SSL 配置

1. **生成证书**
   ```bash
   # 开发环境自签名证书
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout deployment/ssl/ai-architect.key \
     -out deployment/ssl/ai-architect.crt
   ```

2. **配置 Nginx**
   ```nginx
   ssl_certificate /etc/nginx/ssl/ai-architect.crt;
   ssl_certificate_key /etc/nginx/ssl/ai-architect.key;
   ```

### 网络策略

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ai-architect-network-policy
spec:
  podSelector:
    matchLabels:
      app: ai-architect
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 9090
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: monitoring
```

## 备份和恢复

### 数据库备份

```bash
# 手动备份
docker-compose exec postgres pg_dump -U ai_architect ai_architect > backup.sql

# 定时备份 (Cron)
0 2 * * * docker-compose exec postgres pg_dump -U ai_architect ai_architect > /backups/ai_architect_$(date +%Y%m%d).sql
```

### 配置备份

```bash
# 备份 ConfigMap
kubectl get configmap ai-architect-config -n ai-architect -o yaml > config-backup.yaml

# 备份模板
tar -czf templates-backup.tar.gz ./templates
```

## 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查依赖服务
   docker-compose ps
   
   # 查看详细日志
   docker-compose logs ai-architect
   ```

2. **数据库连接失败**
   ```bash
   # 测试数据库连接
   docker-compose exec postgres psql -U ai_architect -d ai_architect
   ```

3. **内存不足**
   ```bash
   # 调整 Docker 内存限制
   docker-compose down
   export COMPOSE_MEMORY_LIMIT=4096M
   docker-compose up -d
   ```

### 性能优化

1. **调整资源限制**
   ```yaml
   # 在 docker-compose.override.yml 中
   services:
     ai-architect:
       deploy:
         resources:
           limits:
             memory: 2G
             cpus: '2.0'
   ```

2. **启用缓存**
   ```bash
   # 重启 Redis 并启用持久化
   docker-compose restart redis
   ```

## 扩展和定制

### 添加新模块类型

1. 在 `src/ai-architect/config/module-semantics.yaml` 中定义新模块
2. 实现对应的生成器类
3. 更新模板配置
4. 重新构建和部署

### 自定义治理规则

编辑 `deployment/ai-architect-config.yaml` 中的治理配置部分：

```yaml
governance:
  customRules:
    - name: "company-security-policy"
      description: "公司特定安全策略"
      rules:
        - "no-external-dependencies"
        - "code-review-required"
```

## 支持与联系

- 📧 邮箱: support@ai-architect.com
- 📚 文档: https://docs.ai-architect.com
- 🐛 问题: https://github.com/your-org/ai-architect/issues
- 💬 社区: https://discord.gg/ai-architect

## 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE) 文件。