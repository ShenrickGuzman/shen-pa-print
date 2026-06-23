import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-sky-900 text-white min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-sky-400 blur-3xl" />
        </div>
        <div className="relative w-full max-w-4xl mx-auto px-5 sm:px-4 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 text-white">
            Shen pa Print
          </h1>
          <p className="text-base sm:text-xl text-blue-200/80 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Pa print ka boss? Click mo lang yung place order sa baba
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link
              to="/order"
              className="w-full sm:w-auto text-center bg-white text-slate-900 font-semibold px-8 py-4 sm:py-3.5 rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/50 active:scale-[0.97] transition-all text-base"
            >
              Place an Order
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
