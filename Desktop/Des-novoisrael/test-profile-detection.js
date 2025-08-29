const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Mensagens de teste para cada perfil
const testMessages = [
  // Pastor
  { message: 'Quero comprar uma biblia', expectedProfile: 'pastor' },
  { message: 'Preciso de 50 bíblias para igreja', expectedProfile: 'pastor' },
  { message: 'Sou pastor e preciso de materiais', expectedProfile: 'pastor' },
  { message: 'Biblia de estudo para ministério', expectedProfile: 'pastor' },
  
  // Jovem
  { message: 'Essa camiseta de fé tá quanto?', expectedProfile: 'jovem' },
  { message: 'Quanto custa essa camiseta?', expectedProfile: 'jovem' },
  { message: 'Legal essa camiseta!', expectedProfile: 'jovem' },
  { message: 'Qual o preço?', expectedProfile: 'jovem' },
  
  // Mãe
  { message: 'Materiais para batismo do meu filho', expectedProfile: 'mae' },
  { message: 'Preciso de kit para batismo da minha filha', expectedProfile: 'mae' },
  { message: 'Quero decorar para batismo', expectedProfile: 'mae' },
  { message: 'Materiais para criança', expectedProfile: 'mae' },
  
  // Fiel (padrão)
  { message: 'Olá', expectedProfile: 'fiel' },
  { message: 'Oi', expectedProfile: 'fiel' },
  { message: 'Bom dia', expectedProfile: 'fiel' },
  { message: 'kkkkkk', expectedProfile: 'fiel' }
];

async function testProfileDetection() {
  console.log('🧪 TESTANDO DETECÇÃO DE PERFIS');
  console.log('================================\n');

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testMessages.length; i++) {
    const test = testMessages[i];
    const customerId = `5511${String(i).padStart(9, '0')}@s.whatsapp.net`;
    
    try {
      console.log(`${i + 1}. Testando: "${test.message}"`);
      
      const response = await axios.post(`${BASE_URL}/test-message-processing`, {
        customerId,
        message: test.message
      });
      
      const detectedProfile = response.data.data.profile.profile;
      const expectedProfile = test.expectedProfile;
      
      if (detectedProfile === expectedProfile) {
        console.log(`   ✅ PASSOU: ${detectedProfile} (esperado: ${expectedProfile})`);
        passed++;
      } else {
        console.log(`   ❌ FALHOU: ${detectedProfile} (esperado: ${expectedProfile})`);
        failed++;
      }
      
      console.log(`   💰 Desconto: ${(response.data.data.profile.discount * 100).toFixed(0)}%\n`);
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}\n`);
      failed++;
    }
  }

  console.log('📊 RESULTADOS:');
  console.log(`✅ Passaram: ${passed}`);
  console.log(`❌ Falharam: ${failed}`);
  console.log(`📈 Taxa de acerto: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('🎯 Sistema de detecção de perfis funcionando perfeitamente!');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique a lógica de detecção.');
  }
}

// Executar testes
testProfileDetection();
