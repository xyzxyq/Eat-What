import LoginForm from '@/components/LoginForm'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--hf-bg)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--hf-border)] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍽️</span>
            <div>
              <h1 className="text-xl font-bold text-[var(--hf-text)] mono">
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

          {/* Features */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="p-3">
              <div className="text-2xl mb-2">📅</div>
              <p className="text-xs text-[var(--hf-text-muted)]">每日一记</p>
            </div>
            <div className="p-3">
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-xs text-[var(--hf-text-muted)]">私密空间</p>
            </div>
            <div className="p-3">
              <div className="text-2xl mb-2">📸</div>
              <p className="text-xs text-[var(--hf-text-muted)]">图片视频</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--hf-border)] py-4 text-center">
        <p className="text-xs text-[var(--hf-text-muted)] mono">
          Made with 💛 for couples • Hugging Face Style
        </p>
      </footer>
    </div>
  )
}
