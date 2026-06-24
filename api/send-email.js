export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  })

  if (!resp.ok) {
    const text = await resp.text()
    return res.status(resp.status).send(text)
  }

  res.status(200).end()
}
