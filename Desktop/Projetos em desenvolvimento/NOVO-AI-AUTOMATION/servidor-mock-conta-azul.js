const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 5050;

// Middleware para JSON
app.use(express.json());

console.log('🚀 SERVIDOR MOCK CONTA AZUL INICIADO');
console.log('====================================');
console.log('');

// Dados mock para simular a API da Conta Azul
const mockData = {
  customers: [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      document: '123.456.789-00',
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      }
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(11) 88888-8888',
      document: '987.654.321-00',
      address: {
        street: 'Av. Paulista, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100'
      }
    }
  ],
  products: [
    {
      id: '1',
      name: 'Produto A',
      price: 100.00,
      description: 'Descrição do Produto A',
      category: 'Categoria 1'
    },
    {
      id: '2',
      name: 'Produto B',
      price: 200.00,
      description: 'Descrição do Produto B',
      category: 'Categoria 2'
    }
  ],
  orders: [
    {
      id: '1',
      customerId: '1',
      products: [
        { productId: '1', quantity: 2, price: 100.00 },
        { productId: '2', quantity: 1, price: 200.00 }
      ],
      total: 400.00,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ]
};

// Endpoint de status
app.get('/status', (req, res) => {
  res.json({
    server: 'running',
    mode: 'mock',
    message: 'Servidor mock funcionando perfeitamente',
    endpoints: [
      'GET /status - Status do servidor',
      'GET /api/customers - Listar clientes',
      'GET /api/products - Listar produtos',
      'GET /api/orders - Listar pedidos',
      'POST /api/customers - Criar cliente',
      'POST /api/orders - Criar pedido'
    ]
  });
});

// Listar clientes
app.get('/api/customers', (req, res) => {
  console.log('📞 GET /api/customers - Listando clientes');
  res.json({
    success: true,
    data: mockData.customers,
    total: mockData.customers.length
  });
});

// Listar produtos
app.get('/api/products', (req, res) => {
  console.log('📦 GET /api/products - Listando produtos');
  res.json({
    success: true,
    data: mockData.products,
    total: mockData.products.length
  });
});

// Listar pedidos
app.get('/api/orders', (req, res) => {
  console.log('📋 GET /api/orders - Listando pedidos');
  res.json({
    success: true,
    data: mockData.orders,
    total: mockData.orders.length
  });
});

// Criar cliente
app.post('/api/customers', (req, res) => {
  console.log('➕ POST /api/customers - Criando cliente');
  const newCustomer = {
    id: (mockData.customers.length + 1).toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  mockData.customers.push(newCustomer);
  
  res.json({
    success: true,
    data: newCustomer,
    message: 'Cliente criado com sucesso'
  });
});

// Criar pedido
app.post('/api/orders', (req, res) => {
  console.log('➕ POST /api/orders - Criando pedido');
  const newOrder = {
    id: (mockData.orders.length + 1).toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  mockData.orders.push(newOrder);
  
  res.json({
    success: true,
    data: newOrder,
    message: 'Pedido criado com sucesso'
  });
});

// Endpoint de teste
app.get('/test', (req, res) => {
  res.json({
    message: 'Servidor mock funcionando!',
    timestamp: new Date().toISOString(),
    data: {
      customers: mockData.customers.length,
      products: mockData.products.length,
      orders: mockData.orders.length
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Mock Conta Azul rodando em http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponíveis:`);
  console.log(`   - Status: http://localhost:${PORT}/status`);
  console.log(`   - Test: http://localhost:${PORT}/test`);
  console.log(`   - Customers: http://localhost:${PORT}/api/customers`);
  console.log(`   - Products: http://localhost:${PORT}/api/products`);
  console.log(`   - Orders: http://localhost:${PORT}/api/orders`);
  console.log('');
  console.log('✅ Sistema pronto para uso!');
  console.log('🎯 O Mega Vendedor AI pode conectar agora.');
});
