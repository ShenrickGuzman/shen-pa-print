import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import Mailjet from 'node-mailjet'

const app = express()
app.use(cors())
app.use(express.json())

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads')
const upload = multer({ dest: 'uploads/' })

const mailjet = Mailjet.apiConnect(
  process.env.MJ_API_KEY,
  process.env.MJ_SECRET_KEY,
)

const FROM_EMAIL = process.env.FROM_EMAIL || 'shenrickguzman07@gmail.com'

function buildHtml({ name, email, service, size, copies, total, details, attachments }) {
  return `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#0ea5e9;margin-bottom:16px">Shen pa Print — Order Receipt</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Service</td><td style="padding:8px;border:1px solid #ddd">${service || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Paper Size</td><td style="padding:8px;border:1px solid #ddd">${size || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Copies</td><td style="padding:8px;border:1px solid #ddd">${copies}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Total Price</td><td style="padding:8px;border:1px solid #ddd;font-size:18px;font-weight:bold;color:#0ea5e9">₱${total}.00</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Details</td><td style="padding:8px;border:1px solid #ddd">${details || '—'}</td></tr>
      </table>
      ${attachments?.length ? `<p style="color:#666">Attachments: ${attachments.length} file(s)</p>` : ''}
    </div>
  `
}

app.post('/api/order', upload.array('files'), async (req, res) => {
  try {
    const { name, email, service, size, copies, details } = req.body
    const total = Number(copies) * 3

    let attrs = []
    if (req.files?.length) {
      attrs = req.files.map((f) => ({
        ContentType: 'application/octet-stream',
        Filename: f.originalname,
        Base64Content: fs.readFileSync(f.path).toString('base64'),
      }))
    }

    const data = {
      Messages: [{
        From: { Email: FROM_EMAIL, Name: 'Shen pa Print' },
        To: [{ Email: FROM_EMAIL }],
        Subject: `New Order from ${name} — ₱${total}.00`,
        HTMLPart: buildHtml({ name, email, service, size, copies, total, details, attachments: req.files }),
        Attachments: attrs,
      }],
    }

    await mailjet.post('send', { version: 'v3.1' }).request(data)

    if (email) {
      const receiptData = {
        Messages: [{
          From: { Email: FROM_EMAIL, Name: 'Shen pa Print' },
          To: [{ Email: email }],
          Subject: `Your Shen pa Print Order Receipt — ₱${total}.00`,
          HTMLPart: buildHtml({ name, email, service, size, copies, total, details, attachments: req.files }) +
            '<hr style="border:none;border-top:1px solid #eee;margin:24px 0"><p style="color:#666;font-size:13px">Thank you for your order!</p>',
        }],
      }
      await mailjet.post('send', { version: 'v3.1' }).request(receiptData)
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send order' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
