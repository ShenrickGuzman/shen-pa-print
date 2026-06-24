export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 25000)

      const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      })
      clearTimeout(id)

      if (!resp.ok) {
        const text = await resp.text()
        if (attempt < 2) continue
        return res.status(resp.status).send(text)
      }

      return res.status(200).end()
    } catch {
      if (attempt < 2) continue
      return res.status(504).send('EmailJS not reachable after 3 attempts')
    }
  }
}
