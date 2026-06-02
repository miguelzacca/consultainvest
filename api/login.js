import jwt from 'jsonwebtoken'
import cookie from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (username === 'Admin' && password === 'InvestDream@2026') {
    const token = jwt.sign(
      { username: 'Admin', role: 'admin' },
      process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
      { expiresIn: '7d' },
    )

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      }),
    )

    return res.status(200).json({ success: true })
  }

  return res.status(401).json({ error: 'Credenciais inválidas' })
}
