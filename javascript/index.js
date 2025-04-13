const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Substitua pela sua chave da API
const ACCESS_KEY = process.env.API_KEY_EXCHANGE || 'c2136d68a654b18829cf89fb7191dca3';
const API_URL = 'http://api.currencylayer.com/live';

let historicoCotacoes = [];

app.use(express.json());

// GET /cotacao → busca cotação atual da API
app.get('/cotacao', async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        access_key: ACCESS_KEY,
        currencies: 'BRL',
        source: 'EUR',  // ou 'USD' se a API não suportar EUR
        format: 1
      }
    });

    const data = response.data;

    if (data.success && data.quotes) {
      const cotacao = data.quotes['EURBRL'] || data.quotes['USDBRL'];
      res.json({
        cotacao,
        data: new Date().toISOString().split('T')[0]
      });
    } else {
      res.status(500).json({ erro: 'Erro na API externa', resposta: data });
    }
  } catch (error) {
    res.status(500).json({ erro: 'Falha na requisição', detalhe: error.message });
  }
});

// POST /cotacao → registra cotação manual
app.post('/cotacao', (req, res) => {
  const { cotacao } = req.body;

  if (!cotacao) {
    return res.status(400).json({ erro: 'Campo "cotacao" é obrigatório' });
  }

  const registro = {
    cotacao,
    data: new Date().toISOString()
  };

  historicoCotacoes.push(registro);
  res.status(201).json({ mensagem: 'Cotação registrada com sucesso', registro });
});

// GET /historico → retorna as cotações manuais
app.get('/historico', (req, res) => {
  res.json(historicoCotacoes);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
