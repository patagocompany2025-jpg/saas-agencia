// Simulador da API do Conta Azul para testes
const express = require('express');
const app = express();

app.use(express.json());

// Dados simulados do Conta Azul
const clientesSimulados = [
  { id: 1, nome: "João Silva", email: "joao@email.com", telefone: "11999999999" },
  { id: 2, nome: "Maria Santos", email: "maria@email.com", telefone: "11888888888" },
  { id: 3, nome: "Pedro Costa", email: "pedro@email.com", telefone: "11777777777" }
];

const produtosSimulados = [
  { id: 1, nome: "Produto A", preco: 100.00, estoque: 50 },
  { id: 2, nome: "Produto B", preco: 200.00, estoque: 30 },
  { id: 3, nome: "Produto C", preco: 150.00, estoque: 25 }
];

// Rotas simuladas
app.get('/api/customers', (req, res) => {
  console.log('📞 API: Listando clientes');
  res.json(clientesSimulados);
});

app.get('/api/products', (req, res) => {
  console.log('📦 API: Listando produtos');
  res.json(produtosSimulados);
});

app.get('/api/company', (req, res) => {
  console.log('🏢 API: Dados da empresa');
  res.json({
    nome: "Loja Novo Israel",
    cnpj: "12.345.678/0001-90",
    endereco: "Rua das Flores, 123"
  });
});

app.post('/api/sales', (req, res) => {
  console.log('💰 API: Criando venda', req.body);
  res.json({
    id: Math.random().toString(36).substr(2, 9),
    status: "created",
    total: req.body.total || 0
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    service: "Conta Azul Simulator",
    timestamp: new Date().toISOString()
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🎭 Simulador Conta Azul rodando na porta ${PORT}`);
  console.log(`📡 Endpoints disponíveis:`);
  console.log(`   GET  http://localhost:${PORT}/api/customers`);
  console.log(`   GET  http://localhost:${PORT}/api/products`);
  console.log(`   GET  http://localhost:${PORT}/api/company`);
  console.log(`   POST http://localhost:${PORT}/api/sales`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log('');
  console.log('🎯 Agora o Mega Vendedor pode se conectar!');
});
