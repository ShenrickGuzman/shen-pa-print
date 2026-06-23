import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import nodemailer from 'nodemailer'
import fs from 'fs'

const app = express()
app.use(cors())
app.use(express.json())

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads')
const upload = multer({ dest: 'uploads/' })

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
  console.error('Missing GMAIL_USER or GMAIL_APP_PASS environment variables')
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
  connectionTimeout: 10000,
})

app.post('/api/order', upload.array('files'), async (req, res) => {
  try {
    const { name, email, service, size, copies, details } = req.body
    const total = Number(copies) * 3

    let attachments = []
    if (req.files?.length) {
      attachments = req.files.map((f) => ({
        filename: f.originalname,
        path: f.path,
      }))
    }

    const orderHtml = `
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
        ${attachments.length ? `<p style="color:#666"><strong>Attachments:</strong> ${attachments.length} file(s)</p>` : ''}
      </div>
    `

    const receiptHtml = orderHtml + `
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="color:#666;font-size:13px">
        Thank you for your order!
        If you have any questions, contact the owner.
      </p>
    `

    await transporter.sendMail({
      from: `"Shen pa Print" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Order from ${name} — ₱${total}.00`,
      html: orderHtml,
      attachments,
    })

    await transporter.sendMail({
      from: `"Shen pa Print" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your Shen pa Print Order Receipt — ₱${total}.00`,
      html: receiptHtml,
    })

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
