import jwt from 'jsonwebtoken';
import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Authenticate user
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only');
  } catch (err) {
    return res.status(401).json({ error: 'Sessão inválida' });
  }

  const { document, type } = req.body;

  if (!document || !type) {
    return res.status(400).json({ error: 'Documento e tipo são obrigatórios' });
  }

  if (type !== 'scpc-boavista' && type !== 'serasa-premium') {
    return res.status(400).json({ error: 'Tipo de consulta inválido' });
  }

  const apiUrl = type === 'scpc-boavista' 
    ? 'https://api.apifull.com.br/api/scpc-boavista'
    : 'https://api.apifull.com.br/api/serasa-premium';

  try {
    // 2. Fetch data from APIFull
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIFULL_TOKEN || ''}`
      },
      body: JSON.stringify({
        document: document.replace(/\D/g, ''), // clean document
        link: type,
        pdf: true
      })
    });

    const data = await apiResponse.json();

    if (data.status !== 'sucesso') {
      return res.status(400).json({ error: 'Erro na consulta na API', details: data });
    }

    const pdfUrl = data.aux?.data;

    // 3. Log to Turso SQLite
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      try {
        const client = createClient({
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN,
        });

        await client.execute(`
          CREATE TABLE IF NOT EXISTS query_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document TEXT,
            query_type TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            pdf_url TEXT
          )
        `);

        await client.execute({
          sql: 'INSERT INTO query_history (document, query_type, pdf_url) VALUES (?, ?, ?)',
          args: [document, type, pdfUrl || '']
        });
      } catch (dbError) {
        console.error('Turso DB Error:', dbError);
        // Continue even if logging fails, as long as API succeeds
      }
    } else {
      console.warn('Turso credentials not configured. Skipping DB log.');
    }

    return res.status(200).json({
      success: true,
      pdfUrl: pdfUrl,
      data: data
    });

  } catch (error) {
    console.error('API Request Error:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
