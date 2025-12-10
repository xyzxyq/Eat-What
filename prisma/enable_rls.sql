-- ============================================
-- Supabase RLS (Row Level Security) 启用脚本
-- ============================================
-- 此脚本为所有表启用 RLS，但不创建任何策略
-- 效果：阻止通过 PostgREST API 直接访问数据库
-- Prisma 通过直接数据库连接仍然可以正常工作
-- ============================================

-- 启用 RLS
ALTER TABLE "CoupleSpace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailVerification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Moment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wish" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WishVote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WishComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Anniversary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SecretWish" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WishRevealRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyInteraction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MissYou" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 验证 RLS 状态（可选）
-- ============================================
-- 运行以下查询确认 RLS 已启用：
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
