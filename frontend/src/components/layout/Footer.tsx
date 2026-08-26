import { Link } from 'react-router-dom'
import { Brain, GitFork, ExternalLink, Mail, Shield, Zap } from 'lucide-react'
// Note: Some icons may need fallbacks depending on lucide-react version

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-dark-100">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">AI Debate Partner</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              The future of AI-powered critical thinking training. Think sharper, argue better, reason deeper.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: GitFork, href: 'https://github.com', label: 'GitHub' },
                { icon: ExternalLink, href: 'https://twitter.com', label: 'Twitter' },
                { icon: ExternalLink, href: 'https://linkedin.com', label: 'LinkedIn' },
                { icon: Mail, href: 'mailto:hello@aidebatepartner.com', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'Demo', 'Changelog', 'Roadmap'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Learn</h4>
            <ul className="space-y-3">
              {['Fallacy Library', 'Debate Guides', 'Critical Thinking', 'Logic Basics', 'Blog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'AI Ethics', 'Cookie Policy', 'GDPR'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2024 AI Debate Partner. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Shield className="w-3 h-3 text-success" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Zap className="w-3 h-3 text-warning" />
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
