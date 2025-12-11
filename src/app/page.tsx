import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import LoginForm from '@/components/LoginForm'

export default async function HomePage() {
  // 检查是否已登录
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (token) {
    const payload = await verifyToken(token)
    if (payload) {
      // 已登录，重定向到 timeline
      redirect('/timeline')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--hf-bg)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--hf-border)] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl"><img src="/eat_what_logo.png" alt="Eat What" className="w-10 h-10 rounded-lg" /></span>
            <div>
              <h1 className="text-xl font-bold text-[var(--hf-text)] logo-font">
                Eat_What
              </h1>
              <p className="text-xs text-[var(--hf-text-muted)]">
                情侣私密日记 v0.1.0
              </p>
            </div>
          </div>
          <div className="hf-badge">
            <span>💕</span>
            <span className="mono text-xs">couples-only</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Welcome Card */}
          <div className="hf-card mb-6 text-center">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-2xl font-bold text-[var(--hf-text)] mb-2">
              欢迎回家
            </h2>
            <p className="text-[var(--hf-text-muted)]">
              每天一条，记录我们的专属时光
            </p>
          </div>

          {/* Login Card */}
          <div className="hf-card">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--hf-border)]">
              <span className="text-xl">🔐</span>
              <h3 className="font-semibold text-[var(--hf-text)] mono">
                Access Space
              </h3>
            </div>
            <LoginForm />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--hf-border)] py-4 text-center">
        <p className="text-xs text-[var(--hf-text-muted)] mono">
          © {new Date().getFullYear()} Eat_What. Made with 💛 for couples.
        </p>
        <p className="text-xs text-[var(--hf-text-muted)] mt-1">
          <a
            href="https://github.com/xyzxyq/Eat-What"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--hf-yellow)] transition"
          >
            GitHub
          </a>
          {' • MIT License • v0.1.0'}
        </p>
      </footer>
    </div>
  )
}
