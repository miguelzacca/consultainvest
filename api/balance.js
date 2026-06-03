import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Authenticate user
  const token = req.cookies?.auth_token
  if (!token) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'new_fallback_secret_for_dev_only')
  } catch (err) {
    return res.status(401).json({ error: 'Sessão inválida' })
  }

  try {
    const apiResponse = await fetch('https://api.apifull.com.br/api/get-balance', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.APIFULL_TOKEN || ''}`,
      },
    })

    const data = await apiResponse.json()

    if (data.status !== 'sucesso') {
      return res.status(400).json({ error: 'Erro ao buscar saldo', details: data })
    }

    return res.status(200).json({
      success: true,
      balance: data.dados?.Saldo || 0,
      data: data
    })
  } catch (error) {
    console.error('API Request Error:', error)
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}
