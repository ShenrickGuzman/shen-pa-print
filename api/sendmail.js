import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { ownerEmail, customerEmail, subject, html, customerSubject, customerHtml } = req.body

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  })

  try {
    await transporter.sendMail({
      from: `"Shen pa Print" <${process.env.GMAIL_USER}>`,
      to: ownerEmail,
      subject,
      html,
    })
    if (customerEmail) {
      await transporter.sendMail({
        from: `"Shen pa Print" <${process.env.GMAIL_USER}>`,
        to: customerEmail,
        subject: customerSubject,
        html: customerHtml,
      })
    }
    res.status(200).end()
  } catch (err) {
    res.status(500).send(err.message)
  }
}
