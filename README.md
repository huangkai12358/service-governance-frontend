# 服务治理管理平台前端

基于 `Vue 3 + TypeScript + Vite + Element Plus` 的服务治理后台。当前项目已经接入真实后端接口，不再是纯 Mock 原型。后端默认地址为 `http://localhost:8081`，开发服务器默认端口为 `5174`。

## 技术栈

- Vue 3
- TypeScript
- Vite 6
- Element Plus
- Vue Router
- Pinia
- ECharts
- Dayjs
- Vitest

## 快速开始

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

访问：

```text
http://localhost:5174
```

构建：

```bash
npm run build
```

预览构建产物：

```bash
npm run preview
```

运行测试：

```bash
npm run test
```

## 后端依赖

前端业务页面依赖后端 `auth-service`。请先启动后端：

```bash
cd ../service-governance-backend
mvn -pl auth-service spring-boot:run
```

默认后端地址：

```text
http://localhost:8081
```

Vite 开发环境已在 `vite.config.ts` 中把 `/api/auth`、`/api/app`、`/api/apis`、`/api/dashboard`、`/api/logs`、`/api/authorization`、`/api/smartdoc` 代理到 `http://localhost:8081`。

如果不走 Vite 代理，也可以设置环境变量：

```bash
VITE_API_BASE_URL=http://localhost:8081 npm run dev
```

## 登录和会话

登录账号由后端 `USER_INFO` 数据决定。

登录成功后，后端返回 `sessionToken`。前端会把它保存到本地，并在后台管理接口请求头中携带：

```text
sessionToken: xxxxxxxxxx
```

受保护页面会在进入前调用 `/api/auth/session/check`。如果后端未启动、数据库不可用、会话过期或 token 无效，前端会清理本地登录态并回到登录页。

## 当前功能

### 首页概览

- 应用总数、API 总数、授权关系总数
- SmartDoc 导入次数、今日调用记录
- 授权服务模式配置
- 最近导入、最近授权变更、最近调用决策

### API 授权拓扑图

- 展示服务之间的授权调用关系
- 支持按服务名、API 名称、请求路径搜索
- 支持查看节点和连线明细

### API 管理

- API 列表、分页、搜索、详情
- 新增、编辑、删除 API
- 按应用编码、应用名称、API 名称、路径、版本号筛选
- API 导出

### APP 管理

- APP 列表、分页、搜索、详情
- 新增、编辑、删除 APP
- 密码配置状态展示
- 查看 APP 关联 API

### SmartDoc 导入

- 上传并分析 SmartDoc 文档
- 展示新增、修改、废弃、无变化 API
- 确认导入后写入版本和 API 数据
- 可对新增 API 跳转做反向授权

### 单应用授权

- 按调用方应用和被调用方应用查看授权关系
- 授权配置弹窗展示当前版本 API 和兼容旧版本 API
- 支持勾选 API、保存授权、查看变更预览
- 支持导出授权数据

### API 反向授权

- 从 API 维度查看和配置授权应用
- 支持单个 API 反向授权
- 支持同一被调用应用下的多个 API 批量授权
- 支持授权应用搜索和回显

### 日志查询

- 权限配置历史记录
- SmartDoc 导入历史记录
- 远程调用历史记录

远程调用历史当前对应后端 `CALL_DECISION_LOG`，记录的是 `/api/authorization/check` 的授权判定结果，包括 `SUCCESS` 和 `FAIL`。`BYPASS` 需要调用方服务侧补报或统一日志系统支持，目前前后端不主动生成。

## 主要页面路由

| 页面 | 路由 |
|---|---|
| 登录 | `/login` |
| 首页概览 | `/dashboard` |
| API 授权拓扑图 | `/dashboard/topology` |
| API 列表 | `/api/list` |
| SmartDoc 导入 | `/smartdoc/import` |
| APP 列表 | `/app/list` |
| 单应用授权 | `/auth/app` |
| API 反向授权 | `/auth/api-reverse` |
| 权限配置历史记录 | `/logs/auth-config` |
| SmartDoc 导入历史记录 | `/logs/smartdoc-import` |
| 远程调用历史记录 | `/logs/remote-call` |

## 目录结构

```text
src/
├── api                 # 后端接口封装
├── components          # 通用组件
├── layout              # 主布局和菜单
├── mock                # 历史 Mock 数据和部分测试辅助数据
├── router              # 路由和登录态守卫
├── store               # Pinia 状态
├── styles              # 全局样式
├── types               # 业务类型
├── utils               # 请求、存储等工具
└── views               # 页面
```

## 请求规范

后台管理接口统一返回：

```ts
{
  code: number;
  message: string;
  data: T;
}
```

前端 `src/utils/request.ts` 会：

- 默认设置 `Content-Type: application/json`
- 自动携带 `sessionToken`
- 对 `40102`、`40103` 清理登录态并跳转登录页
- 对 `FormData` 请求保留浏览器自动生成的 multipart 请求头

## 常见问题

- 登录失败或登录后无法进入系统：确认后端 `8081` 已启动，Oracle 可连接，且 `USER_INFO` 中存在可用用户。
- 刷新页面后回到登录页：确认 `/api/auth/session/check` 返回成功。
- 页面无数据：确认后端数据库已执行初始化和测试数据脚本，并检查浏览器 Network 中对应 `/api/**` 请求。
- 本地跨域问题：开发模式优先使用 Vite 代理；如果设置了 `VITE_API_BASE_URL`，确认后端 CORS 允许当前前端地址。
- 导出失败：确认请求头中有 `sessionToken`，且后端接口返回的是文件流。
