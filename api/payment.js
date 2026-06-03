import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

  const { value } = req.body

  if (!value || isNaN(value) || value <= 0) {
    return res.status(400).json({ error: 'Valor inválido para o Pix' })
  }

  try {
    const apiResponse = await fetch('https://api.apifull.com.br/api/get-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.APIFULL_TOKEN || ''}`,
      },
      body: JSON.stringify({
        value: Math.round(Number(value) * 100), // Converte para centavos
        type: 1 // Pix
      }),
    })

    const textResponse = await apiResponse.text()
    let data
    try {
      data = JSON.parse(textResponse)
    } catch (err) {
      console.error('API Payment Error - Failed to parse JSON:', textResponse)
      return res.status(500).json({ error: 'Erro ao processar resposta da API', details: textResponse })
    }

    if (data.status !== 'sucesso') {
      console.error('API Payment Error - Status not success:', data)
      return res.status(400).json({ error: 'Erro ao gerar Pix', details: data })
    }

    return res.status(200).json({
      success: true,
      pixData: data.dados?.pix || null,
      data: data
    })
  } catch (error) {
    console.error('API Payment Error - Request exception:', error)
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}
