# 服务治理管理平台

基于 `Vue 3 + TypeScript + Vite + Element Plus` 的前端原型项目，用于演示服务治理场景下的 API 资产管理、SmartDoc 文档导入、应用授权配置、版本记录与调用日志查询。

当前项目为纯前端原型，数据全部来自本地 `mock`，不依赖真实后端，可直接运行用于业务评审、产品演示和后台原型验证。

## 项目特点

- Vue 3 组合式 API + TypeScript
- Vite 构建，启动速度快
- Element Plus 企业后台风格组件
- Vue Router 路由管理
- Pinia 登录态管理
- 本地 Mock 数据模拟真实接口返回格式
- 内置 ECharts 拓扑图，用于展示 API 授权关系
- 页面按真实后台项目方式拆分，便于后续接后端

## 技术栈

- `vue@3`
- `typescript`
- `vite`
- `element-plus`
- `pinia`
- `vue-router`
- `echarts`
- `dayjs`

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

### 3. 构建生产包

```bash
npm run build
```

### 4. 本地预览构建结果

```bash
npm run preview
```

## 演示账号

- 用户名：`admin`
- 密码：`admin123`

登录后会进入首页概览；未登录访问业务页面会自动跳转到登录页。

## 当前功能范围

### 1. 登录模块

- Basic Auth 风格演示登录
- Pinia + 本地存储维护登录态
- 路由守卫控制未登录跳转

### 2. 首页概览

- 应用总数
- API 总数
- API 分组总数
- 授权关系总数
- SmartDoc 导入次数
- 今日调用记录
- 最近导入
- 最近授权变更
- 最近调用决策

### 3. API 授权拓扑图

- 独立页面展示服务间 API 授权关系
- 支持搜索服务名、API 名称、请求路径
- 点击节点查看应用作为调用方 / 被调用方的关系明细
- 点击连线查看该授权关系下的 API 列表

### 4. API 管理

- API 列表查询、分页、详情、编辑、逻辑删除
- 支持按应用编码、应用名称、API 名称、请求路径、版本号筛选
- 新增 API / 编辑 API
- 查看 API 所属分组、描述、请求路径等信息

### 5. SmartDoc 导入

- 模拟上传 SmartDoc 文档
- 按 `path` 对比差异
- 差异类型：
  - 新增 API
  - 修改 API
  - 废弃 API
  - 无变化
- 支持填写 `app_code`、版本号、说明
- 确认导入后弹出结果提示
- 对新增 API 提供“去授权”入口，跳转到 API 反向授权页面

### 6. 历史版本管理

- 按应用编码、应用名称、版本号查询历史版本
- 查看版本详情
- 查看某版本包含的 API 列表

说明：当前版本**不支持回滚**。如需回退，按产品策略应重新导入目标 SmartDoc 文档并生成新版本。

### 7. APP 管理

- APP 列表查询、分页、详情、编辑、删除
- 查看 APP 说明、当前版本号、关联 API 等信息

### 8. API 分组管理

- API 分组列表查询、分页
- 新增 / 编辑 / 删除 API 分组
- 修改分组说明
- 修改组内包含的 API
- 提供变更预览

### 9. 权限管理

#### 单个应用授权

- 按调用方应用 / 被调用方应用查看已有授权关系
- 修改授权时支持：
  - 左侧 API 列表勾选
  - 右侧按 API 分组展开选择
  - 左右勾选状态同步
  - 变更预览

#### API 反向授权

- 从 API 角度反向配置授权目标应用
- 支持单个 API 授权
- 支持同一被调用应用下的多个 API 批量授权
- 支持跨页选择保留
- 可查看某个 API 当前已授权的应用

### 10. 日志查询

- 权限配置历史记录
- SmartDoc 导入历史记录
- 远程调用历史记录

所有日志页均支持筛选、分页、状态区分和 Mock 数据查询。

## Mock 数据说明

项目所有业务数据均位于 `src/mock`，统一模拟后端返回结构：

```ts
{
  code: 0,
  message: 'success',
  data: ...
}
```

当前 Mock 特点：

- 应用约 `100` 个
- 每个应用约 `100` 个 API
- API 总量约 `10000`
- 支持筛选、分页、详情、授权、日志等场景
- SmartDoc 导入差异数据为结构化 Mock
- 日志、授权关系、版本记录均为可直接驱动页面的模拟数据

这套数据规模适合验证后台页面在较大数据量下的 UI / UX 表现。

## 目录结构

```text
src
├── components              # 通用组件
│   ├── DiffCard.vue
│   ├── PageSearch.vue
│   └── StatusTag.vue
├── layout                  # 主布局与菜单
│   ├── MainLayout.vue
│   └── menu.ts
├── mock                    # 本地 Mock 数据与接口模拟
│   ├── api.ts
│   ├── app.ts
│   ├── auth.ts
│   ├── base.ts
│   ├── dashboard.ts
│   ├── group.ts
│   ├── history.ts
│   ├── logs.ts
│   ├── smartdoc.ts
│   └── version.ts
├── router                  # 路由配置
│   └── index.ts
├── store                   # Pinia 状态管理
│   └── auth.ts
├── styles                  # 全局样式
│   └── global.css
├── types                   # 类型定义
│   ├── business.ts
│   └── common.ts
├── utils                   # 工具方法
│   ├── mock.ts
│   └── storage.ts
├── views                   # 页面
│   ├── api
│   ├── app
│   ├── auth
│   ├── dashboard
│   ├── groups
│   ├── login
│   ├── logs
│   ├── smartdoc
│   └── version
├── App.vue
└── main.ts
```

## 主要页面路由

| 菜单 | 路由 |
|---|---|
| 首页概览 | `/dashboard` |
| API 授权拓扑图 | `/dashboard/topology` |
| API 列表 | `/api/list` |
| SmartDoc 导入 | `/api/smartdoc` |
| 历史版本管理 | `/api/version-history` |
| APP 列表 | `/app/list` |
| API 分组 | `/groups/api` |
| 单个应用授权 | `/auth/app` |
| API 反向授权 | `/auth/api-reverse` |
| 权限配置历史记录 | `/logs/auth-config` |
| SmartDoc 导入历史记录 | `/logs/smartdoc-import` |
| 远程调用历史记录 | `/logs/remote-call` |

## 适用场景

- 产品原型评审
- 客户演示
- 服务治理后台方案预演
- UI / UX 验证
- 后端接口定义前的前端先行开发

