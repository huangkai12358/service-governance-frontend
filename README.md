# 服务治理前端（service-governance-frontend）

> 服务治理项目前端界面，基于 **Vue 3 + Vite + TypeScript** 构建，使用 **Element Plus** 作为 UI 组件库，**Pinia** 进行状态管理，**Vue Router** 负责路由。

## 功能概览

- Vue 3 Composition API
- 基于 Vite 的本地开发 / 构建 / 预览
- Element Plus（含图标）
- Pinia 状态管理
- Vue Router 路由
- ECharts 图表能力
- Day.js 时间处理

## 技术栈

- Vue: ^3.5.13
- Vite: ^6.0.5
- TypeScript: ^5.7.2
- Element Plus: ^2.8.8
- Pinia: ^2.3.0
- Vue Router: ^4.5.0
- ECharts: ^6.0.0

## 项目结构

```text
.
├── src/
│   ├── components/   # 通用组件
│   ├── views/        # 页面
│   ├── router/       # 路由配置
│   ├── stores/       # Pinia 状态仓库
│   ├── styles/       # 全局样式
│   ├── main.ts       # 入口（创建应用、挂载插件等）
│   └── ...
├── public/
├── index.html
├── package.json
└── vite.config.*
```

## 开发环境要求

- Node.js：建议 **18+ / 20+**
- npm：与 Node 版本匹配

## 开始使用

### 1) 安装依赖

```bash
npm install
```

### 2) 本地开发

```bash
npm run dev
```

### 3) 构建生产包

```bash
npm run build
```

### 4) 本地预览生产包

```bash
npm run preview
```

## 约定与说明

- 状态管理位于 `src/stores`
- 路由配置位于 `src/router`
- 可复用组件位于 `src/components`
- 页面组件位于 `src/views`

## License

如无特别说明，默认保留所有权利（All rights reserved）。
