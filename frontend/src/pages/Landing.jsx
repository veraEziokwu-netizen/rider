import { Link } from 'react-router-dom'
import { Package, MapPin, Clock, Shield, ArrowRight, Bike, CheckCircle2, Zap } from 'lucide-react'

const features = [
  { icon: Zap,        title: 'Instant matching',  desc: 'Get matched with a nearby dispatch rider within minutes of your request.' },
  { icon: MapPin,     title: 'Live tracking',      desc: 'Watch your rider in real time on the map from pickup to your doorstep.' },
  { icon: Clock,      title: 'Fast delivery',      desc: 'Same-day delivery guaranteed. We know Enugu like the back of our hand.' },
  { icon: Shield,     title: 'Reliable & secure',  desc: 'Verified riders, secure tracking, and full delivery confirmation.' },
]

const steps = [
  { n: '01', title: 'Create a request', desc: 'Enter pickup and drop-off details on the app in under 60 seconds.' },
  { n: '02', title: 'Rider is assigned',  desc: 'A verified dispatch rider accepts your request and heads to pickup.' },
  { n: '03', title: 'Track in real time', desc: 'Follow your rider live on the map until delivery is confirmed.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-brand-offwhite font-sans">

      {/* Nav */}
      <header className="sticky top-0 z-20 bg-brand-offwhite/95 backdrop-blur-md border-b border-brand-gray-200">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-red rounded-xl flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-brand-black text-xl tracking-tight">DispatchNG</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-brand-gray-600 hover:text-brand-black transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex items-center gap-2">
              Get started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-red-light text-brand-red text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
              <Bike size={12} /> Enugu's dispatch platform
            </div>
            <h1 className="font-display font-bold text-brand-black text-4xl md:text-5xl leading-tight mb-5">
              Deliver anything,<br />
              <span className="text-brand-red">anywhere in Enugu</span>
            </h1>
            <p className="text-brand-gray-600 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              Connect with verified dispatch riders instantly. Track your package in real time from pickup to delivery — no more waiting and wondering.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-7 py-4 rounded-xl">
                Send a package <ArrowRight size={18} />
              </Link>
              <Link to="/register?role=rider" className="btn-secondary inline-flex items-center justify-center gap-2 text-base px-7 py-4 rounded-xl">
                Become a rider
              </Link>
            </div>
            <div className="flex items-center gap-5 mt-8">
              {[['500+', 'Deliveries'], ['50+', 'Riders'], ['4.8★', 'Rating']].map(([val, lbl]) => (
                <div key={lbl}>
                  <p className="font-display font-bold text-brand-black text-xl">{val}</p>
                  <p className="text-brand-gray-500 text-xs">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero illustration */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              {/* Phone mockup */}
              <div className="bg-brand-black rounded-[2.5rem] p-3 shadow-2xl mx-auto w-64">
                <div className="bg-brand-gray-900 rounded-[2rem] overflow-hidden h-[480px] relative">
                  {/* Map bg */}
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 to-brand-black opacity-90" />
                  <div className="absolute inset-0 flex flex-col">
                    {/* Status bar */}
                    <div className="flex justify-between px-5 pt-4 pb-2">
                      <span className="text-white/60 text-[10px]">9:41</span>
                      <span className="text-white/60 text-[10px]">●●●</span>
                    </div>
                    {/* Card overlay */}
                    <div className="mx-3 mt-auto mb-4 bg-white rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Bike size={14} className="text-green-700" />
                        </div>
                        <div>
                          <p className="text-brand-black text-xs font-bold">Chukwuemeka R.</p>
                          <p className="text-green-600 text-[10px] font-semibold">● En route · 4 min away</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] text-brand-gray-600">
                          <div className="w-2 h-2 rounded-full bg-brand-red" />
                          Ogui Road, Enugu
                        </div>
                        <div className="w-px h-3 ml-1 bg-brand-gray-200" />
                        <div className="flex items-center gap-2 text-[10px] text-brand-gray-600">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Independence Layout
                        </div>
                      </div>
                      <div className="mt-3 bg-brand-red rounded-xl py-2 text-center">
                        <span className="text-white text-[11px] font-bold">Track live</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -right-4 top-12 bg-white rounded-2xl shadow-card px-3 py-2 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="text-xs font-semibold text-brand-black">Delivered!</span>
              </div>
              <div className="absolute -left-6 bottom-20 bg-white rounded-2xl shadow-card px-3 py-2">
                <p className="text-[10px] text-brand-gray-500">Tracking</p>
                <p className="text-xs font-bold text-brand-black font-mono">DNG-7F3KX9</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-brand-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-brand-black text-3xl mb-3">Everything you need</h2>
            <p className="text-brand-gray-600">Simple, fast, and reliable dispatch logistics for Enugu.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-brand-gray-100 hover:border-brand-red/30 hover:shadow-soft transition-all duration-200">
                <div className="w-11 h-11 bg-brand-red-light rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand-red" />
                </div>
                <h3 className="font-display font-semibold text-brand-black text-base mb-2">{title}</h3>
                <p className="text-brand-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-brand-black text-3xl mb-3">How it works</h2>
          <p className="text-brand-gray-600">Three simple steps to get your package delivered.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="text-center">
              <div className="w-14 h-14 bg-brand-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="font-display font-bold text-white text-sm">{n}</span>
              </div>
              <h3 className="font-display font-semibold text-brand-black text-base mb-2">{title}</h3>
              <p className="text-brand-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-black py-16 mx-5 mb-10 rounded-3xl max-w-6xl md:mx-auto">
        <div className="text-center px-5">
          <h2 className="font-display font-bold text-white text-3xl mb-3">Ready to dispatch?</h2>
          <p className="text-brand-gray-400 mb-8">Join hundreds of customers and riders on DispatchNG today.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-brand-red text-white font-display font-semibold rounded-xl px-7 py-4 hover:bg-brand-red-dark transition-colors">
              Create account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-display font-semibold rounded-xl px-7 py-4 hover:bg-white/20 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-red rounded-lg flex items-center justify-center">
            <Package size={12} className="text-white" />
          </div>
          <span className="font-display font-bold text-brand-black text-sm">DispatchNG</span>
        </div>
        <p className="text-brand-gray-400 text-xs">© 2024 DispatchNG · Caritas University Final Year Project</p>
      </footer>
    </div>
  )
}
