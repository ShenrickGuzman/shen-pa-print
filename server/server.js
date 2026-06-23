import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import https from 'https'

const app = express()
app.use(cors())
app.use(express.json())

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads')
const upload = multer({ dest: 'uploads/' })

function sendEmail({ to, subject, html }) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.MJ_API_KEY
    const secretKey = process.env.MJ_SECRET_KEY
    const from = process.env.FROM_EMAIL || 'shenrickguzman07@gmail.com'

    const data = JSON.stringify({
      Messages: [{
        From: { Email: from, Name: 'Shen pa Print' },
        To: [{ Email: to }],
        Subject: subject,
        HTMLPart: html,
      }],
    })

    const req = https.request({
      hostname: 'api.mailjet.com',
      path: '/v3.1/send',
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${apiKey}:${secretKey}`).toString('base64'),
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve()
        } else {
          reject(new Error(`Mailjet error ${res.statusCode}: ${body}`))
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

app.use('/uploads', express.static('uploads'))

app.post('/api/order', upload.array('files'), async (req, res) => {
  try {
    const { name, email, service, size, copies, details } = req.body
    const total = Number(copies) * 3
    const baseUrl = `${req.protocol}://${req.get('host')}`

    let fileLinks = ''
    if (req.files?.length) {
      fileLinks = '<p style="color:#666"><strong>Files uploaded:</strong></p><ul>'
      for (const f of req.files) {
        const ext = path.extname(f.originalname)
        const newPath = `${f.path}${ext}`
        fs.renameSync(f.path, newPath)
        fileLinks += `<li><a href="${baseUrl}/uploads/${f.filename}${ext}">${f.originalname}</a></li>`
      }
      fileLinks += '</ul>'
    }

    const emailHtml = `
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
        ${fileLinks}
      </div>
    `

    await sendEmail({
      to: process.env.FROM_EMAIL || 'shenrickguzman07@gmail.com',
      subject: `New Order from ${name} — ₱${total}.00`,
      html: emailHtml,
    })

    if (email) {
      await sendEmail({
        to: email,
        subject: `Your Shen pa Print Order Receipt — ₱${total}.00`,
        html: emailHtml + '<hr style="border:none;border-top:1px solid #eee;margin:24px 0"><p style="color:#666;font-size:13px">Thank you for your order!</p>',
      })
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
