import { useState, useRef } from 'react'

export default function Order() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileNames, setFileNames] = useState('')
  const [copies, setCopies] = useState(1)
  const formRef = useRef()
  const fileRef = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(formRef.current)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/order`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error('Failed')
      setSent(true)
    } catch {
      alert('May error sa pag send. Try mo ulit boss!')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="max-w-lg mx-auto px-4 py-24 sm:py-32 text-center">
        <div className="bg-slate-800/50 rounded-2xl p-8 sm:p-10 shadow-lg border border-white/5 mx-2">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-2xl font-extrabold text-white mb-2">Order Submitted!</h2>
          <p className="text-gray-400">
            Thank you! Your order total is <span className="text-sky-400 font-bold">₱{Number(copies) * 3}.00</span>
          </p>
          <p className="text-gray-500 text-sm mt-3">
            The order receipt will be sent to your email shortly. Please double check it. Thank you!
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-3 sm:px-4 py-12 sm:py-16">
      <div className="text-center mb-8 sm:mb-10 px-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Place an Order</h1>
        <p className="text-gray-400 text-base sm:text-lg">Tell us what you need and we'll send a quote</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl shadow-lg border border-white/5 p-5 sm:p-8 space-y-4 sm:space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
          <input name="name" required className="w-full border border-white/10 rounded-xl px-4 py-3 sm:py-2.5 text-sm bg-slate-900/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
          <input name="email" type="email" required className="w-full border border-white/10 rounded-xl px-4 py-3 sm:py-2.5 text-sm bg-slate-900/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Service Needed</label>
          <select name="service" required className="w-full border border-white/10 rounded-xl px-4 py-3 sm:py-2.5 text-sm bg-slate-900/50 text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition">
            <option>Normal Print</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Bond Paper size</label>
          <select name="size" required className="w-full border border-white/10 rounded-xl px-4 py-3 sm:py-2.5 text-sm bg-slate-900/50 text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition">
            <option value="">Select size...</option>
            <option>A4</option>
            <option>Short Bond Paper</option>
            <option>Long Bond Paper</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">How many copies?</label>
          <input name="copies" type="number" min="1" required value={copies} onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))} className="w-full border border-white/10 rounded-xl px-4 py-3 sm:py-2.5 text-sm bg-slate-900/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" />
        </div>

        {copies > 0 && (
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">Estimated Cost</p>
            <p className="text-2xl font-extrabold text-sky-400">₱{Number(copies) * 3}.00</p>
            <p className="text-xs text-gray-500">₱3 per copy</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Upload File</label>
          <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-white/10 rounded-xl px-4 py-6 bg-slate-900/50 cursor-pointer hover:border-sky-500/50 transition">
            <span className="text-3xl mb-2">📄</span>
            <span className="text-sm text-gray-400">{fileNames || 'Tap to select files'}</span>
            <input
              ref={fileRef}
              name="files"
              type="file"
              multiple
              required
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files)
                setFileNames(files.map((f) => f.name).join(', '))
              }}
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Details / Specifications</label>
          <textarea name="details" rows={4} required className="w-full border border-white/10 rounded-xl px-4 py-3 sm:py-2.5 text-sm bg-slate-900/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition" placeholder="If may gusto ka pa edit boss or kung kailan mo kailangan to pa note nalang here" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold py-4 sm:py-3.5 rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/50 active:scale-[0.97] transition-all text-base disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Submit Order'}
        </button>
      </form>
    </main>
  )
}
