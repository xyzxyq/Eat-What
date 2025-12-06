# Eat_What 部署指南

## 📍 方案选择

| 方案 | 适用场景 | 数据库 |
|------|----------|--------|
| **云端部署 (推荐)** | 情侣双方随时随地访问 | Supabase PostgreSQL |
| 本地开发 | 开发测试 | Supabase PostgreSQL |

---

## 🚀 云端部署 (Vercel + Supabase)

### 步骤 1：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 注册/登录
2. 点击 **New Project** 创建项目
3. 设置：
   - **Project name**: `eat-what`
   - **Database Password**: 设置一个强密码（记住它！）
   - **Region**: 选择离你最近的地区
4. 等待项目创建完成（约2分钟）

### 步骤 2：获取数据库连接字符串

1. 进入项目 → **Settings** → **Database**
2. 滚动到 **Connection string** 部分
3. 复制两个连接字符串：
   - **Transaction mode** (端口 6543) → 用于 `DATABASE_URL`
   - **Session mode** (端口 5432) → 用于 `DIRECT_URL`

### 步骤 3：配置本地环境变量

复制 `.env.example` 为 `.env`，填入你的连接字符串：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
DATABASE_URL="postgresql://postgres.xxxxx:YourPassword@aws-0-ap-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:YourPassword@aws-0-ap-xxx.pooler.supabase.com:5432/postgres"
JWT_SECRET="一个随机的安全字符串"
```

### 步骤 4：初始化云端数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 将 Schema 推送到 Supabase（首次使用）
npx prisma db push
```

### 步骤 5：本地测试

```bash
npm run dev
```

访问 `http://localhost:3000`，测试登录和发布日记功能。

### 步骤 6：部署到 Vercel

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Configure cloud deployment"
   git push origin main
   ```

2. **导入到 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 **Add New → Project**
   - 选择你的 GitHub 仓库

3. **配置环境变量**
   在 Vercel 项目设置中添加：
   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | 你的 Supabase Transaction 连接字符串 |
   | `DIRECT_URL` | 你的 Supabase Session 连接字符串 |
   | `JWT_SECRET` | 一个随机安全字符串 |

4. **部署**
   点击 **Deploy**，等待构建完成

5. **访问你的应用** 🎉
   Vercel 会分配一个 `xxx.vercel.app` 域名

---

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 启动开发服务器
npm run dev
```

---

## 🔒 安全提醒

> ⚠️ **重要**：
> - 生产环境务必使用强随机 `JWT_SECRET`
> - 不要将 `.env` 文件提交到 Git
> - 定期检查 Supabase 控制台的异常访问

---

## ✅ 功能验证清单

| 功能 | 状态 |
|------|------|
| 新用户创建情侣空间 | ✅ |
| 第二用户加入空间 | ✅ |
| 第三用户拒绝访问 | ✅ |
| 每日发布限制 | ✅ |
| 日记创建与展示 | ✅ |
| 媒体文件上传 | ✅ |
| Hugging Face UI主题 | ✅ |
