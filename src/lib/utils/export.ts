import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// Função auxiliar para validar argumentos do rect
function validateRectArgs(x: number, y: number, width: number, height: number): boolean {
  if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
    console.warn('Valores inválidos detectados:', { x, y, width, height });
    return false;
  }
  if (x < 0 || y < 0 || width <= 0 || height <= 0) {
    console.warn('Valores negativos ou zero detectados:', { x, y, width, height });
    return false;
  }
  return true;
}

// Tipos para os dados dos relatórios
interface SalesData {
  month: string;
  value: number;
}

interface PipelineData {
  name: string;
  value: number;
  color: [number, number, number];
}

interface TeamMember {
  name: string;
  sales: number;
  clients: number;
  conversion: number;
  color: [number, number, number];
}

interface GrowthProjection {
  month: string;
  revenue: number;
  clients: number;
  growth: number;
}

interface CashFlowData {
  category: string;
  amount: number;
  type: 'in' | 'out';
}

// Função para carregar logo como Base64
function loadLogoAsBase64(logoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Erro ao criar contexto do canvas'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      } catch (error) {
        reject(new Error('Erro ao converter imagem para Base64'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Erro ao carregar logo'));
    };
    
    img.src = logoUrl;
  });
}

// Função específica para Relatório Executivo - Versão Funcional
export function exportExecutiveReportPDF(elementId: string, filename: string, data: any) {
  // Carregar logo primeiro, depois gerar PDF
  loadLogoAsBase64('/LOGO_HORI_WHITE.png')
    .then(logoBase64 => {
      generateExecutivePDFWithLogo(logoBase64, filename, data);
    })
    .catch(error => {
      console.warn('Erro ao carregar logo, gerando PDF sem logo:', error);
      generateExecutivePDFWithLogo(null, filename, data);
    });
}

function generateExecutivePDFWithLogo(logoBase64: string | null, filename: string, data: any) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica', 'normal');
    
    // Fundo escuro do sistema (slate-900)
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Cabeçalho com gradiente azul do sistema
    pdf.setFillColor(30, 58, 138);
    pdf.rect(0, 0, 210, 50, 'F');
    
    // Borda inferior do cabeçalho
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(2);
    pdf.line(0, 50, 210, 50);
    
    // Logo da empresa
    if (logoBase64) {
      try {
        pdf.addImage(logoBase64, 'PNG', 20, 10, 50, 15);
      } catch (error) {
        console.warn('Erro ao adicionar logo:', error);
      }
    }
    
    // Título principal
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório Executivo', 80, 25);
    
    // Subtítulo
    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Análise de Performance e Estratégias', 80, 35);
    
    // Data de geração
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${dateStr} às ${timeStr}`, 20, 45);
    
    // Métricas principais com tema escuro
    const metrics = [
      { title: 'Receita Total', value: 'R$ 125.000', change: '+12%', color: [16, 185, 129] },
      { title: 'Novos Clientes', value: '45', change: '+8%', color: [59, 130, 246] },
      { title: 'Taxa de Conversão', value: '23%', change: '+3%', color: [139, 92, 246] },
      { title: 'Ticket Médio', value: 'R$ 2.780', change: '+5%', color: [245, 158, 11] }
    ];
    
    metrics.forEach((metric, index) => {
      const x = 20 + (index * 45);
      const y = 70;
      
      // Card com cor do sistema
      pdf.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
      pdf.rect(x, y, 40, 25, 'F');
      
      // Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.title, x + 2, y + 6);
      
      // Valor
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.value, x + 2, y + 14);
      
      // Mudança
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(203, 213, 225);
      pdf.text(metric.change, x + 2, y + 20);
    });
    
    // Título da seção de evolução
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Evolução de Vendas', 20, 120);
    
    // Subtítulo
    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Últimos 6 meses', 20, 130);
    
    // Área do gráfico com tema escuro
    const chartX = 20;
    const chartY = 140;
    const chartW = 170;
    const chartH = 70;
    
    // Fundo escuro do gráfico
    pdf.setFillColor(30, 41, 59); // slate-800
    pdf.rect(chartX, chartY, chartW, chartH, 'F');
    
    // Borda do gráfico
    pdf.setDrawColor(59, 130, 246); // Azul do sistema
    pdf.setLineWidth(1);
    pdf.rect(chartX, chartY, chartW, chartH);
    
    // Dados do gráfico
    const values = [45000, 52000, 48000, 61000, 55000, 67000];
    const months = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const maxVal = Math.max(...values);
    
    // Desenhar barras com cores do sistema
    const barW = (chartW - 20) / values.length;
    for (let i = 0; i < values.length; i++) {
      const barH = (values[i] / maxVal) * (chartH - 25);
      const x = chartX + 10 + (i * barW);
      const y = chartY + chartH - barH - 10;
      
      // Cores do sistema baseadas no valor
      if (values[i] >= 60000) {
        pdf.setFillColor(16, 185, 129); // Verde para valores altos
      } else if (values[i] >= 50000) {
        pdf.setFillColor(59, 130, 246); // Azul para valores médios
      } else {
        pdf.setFillColor(245, 158, 11); // Laranja para valores baixos
      }
      
      pdf.rect(x, y, barW - 5, barH, 'F');
      
      // Borda da barra
      pdf.setDrawColor(71, 85, 105);
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, barW - 5, barH);
      
      // Label do mês
      pdf.setTextColor(255, 255, 255); // Branco
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(months[i], x + (barW - 5)/2 - 2, chartY + chartH - 5);
      
      // Valor acima da barra
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${(values[i]/1000).toFixed(0)}k`, x + (barW - 5)/2 - 3, y - 5);
    }
    
    // Título do eixo Y
    pdf.setTextColor(203, 213, 225); // Cinza claro
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Valores (R$ mil)', 5, chartY + chartH/2);
    
    // Título do eixo X
    pdf.text('Meses', chartX + chartW/2 - 10, chartY + chartH + 15);
    
    // Segunda Página - Análise Estratégica
    pdf.addPage();
    
    // Fundo escuro da segunda página
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Cabeçalho da segunda página
    pdf.setFillColor(30, 58, 138);
    pdf.rect(0, 0, 210, 50, 'F');
    
    // Borda inferior do cabeçalho
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(2);
    pdf.line(0, 50, 210, 50);
    
    // Logo na segunda página
    if (logoBase64) {
      try {
        pdf.addImage(logoBase64, 'PNG', 20, 10, 50, 15);
      } catch (error) {
        console.warn('Erro ao adicionar logo na segunda página:', error);
      }
    }
    
    // Título da segunda página
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Análise Estratégica', 80, 25);
    
    // Subtítulo
    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Estratégias e Projeções para o Próximo Trimestre', 80, 35);
    
    // Seção: Estratégias de Crescimento
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Estratégias de Crescimento', 20, 60);
    
    // Cards de estratégias
    const strategies = [
      { title: 'Curto Prazo', desc: 'Otimização de processos e aumento da base de clientes', color: [16, 185, 129] },
      { title: 'Médio Prazo', desc: 'Expansão para novos mercados e produtos', color: [59, 130, 246] },
      { title: 'Longo Prazo', desc: 'Consolidação de mercado e inovação', color: [139, 92, 246] }
    ];
    
    strategies.forEach((strategy, index) => {
      const x = 20 + (index * 60);
      const y = 75;
      
      // Card
      pdf.setFillColor(strategy.color[0], strategy.color[1], strategy.color[2]);
      pdf.rect(x, y, 55, 30, 'F');
      
      // Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(strategy.title, x + 5, y + 8);
      
      // Descrição
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(strategy.desc, x + 5, y + 15);
    });
    
    // Seção: Pipeline de Vendas
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pipeline de Vendas', 20, 130);
    
    // Fundo da seção
    pdf.setFillColor(30, 41, 59);
    pdf.rect(20, 140, 170, 40, 'F');
    
    // Borda
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(1);
    pdf.rect(20, 140, 170, 40);
    
    // Legenda do pipeline
    const pipelineData = [
      { name: 'Leads Qualificados', value: 120, color: [16, 185, 129] },
      { name: 'Propostas Enviadas', value: 45, color: [59, 130, 246] },
      { name: 'Negociações', value: 28, color: [245, 158, 11] },
      { name: 'Fechamentos', value: 12, color: [239, 68, 68] }
    ];
    
    pipelineData.forEach((item, index) => {
      const x = 25 + (index * 40);
      const y = 150;
      
      // Quadrado colorido
      pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
      pdf.rect(x, y, 8, 8, 'F');
      
      // Nome
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.name, x + 12, y + 5);
      
      // Valor
      pdf.setFontSize(10);
      pdf.text(item.value.toString(), x + 12, y + 12);
    });
    
    // Seção: Projeções Financeiras
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Projeções Financeiras', 20, 200);
    
    // Cards de projeções
    const projections = [
      { title: 'Receita Projetada', value: 'R$ 180.000', desc: 'Próximo trimestre' },
      { title: 'Crescimento Esperado', value: '+25%', desc: 'Comparado ao atual' }
    ];
    
    projections.forEach((projection, index) => {
      const x = 20 + (index * 95);
      const y = 220;
      
      // Card
      pdf.setFillColor(30, 41, 59);
      pdf.rect(x, y, 90, 25, 'F');
      
      // Borda
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(1);
      pdf.rect(x, y, 90, 25);
      
      // Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(projection.title, x + 5, y + 8);
      
      // Valor
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(projection.value, x + 5, y + 18);
      
      // Descrição
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(203, 213, 225);
      pdf.text(projection.desc, x + 5, y + 22);
    });
    
    // Rodapé
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 280, 210, 17, 'F');
    
    // Borda superior do rodapé
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(1);
    pdf.line(0, 280, 210, 280);
    
    // Informações do rodapé
    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Relatório gerado em ${dateStr} às ${timeStr}`, 20, 290);
    pdf.text('Sistema de Gestão - Versão 1.0', 150, 290);
    
    // Salvar o PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar o PDF. Verifique o console para mais detalhes.');
  }
}

// Funções de exportação para outros formatos (mantidas do arquivo original)
export function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento com ID "${elementId}" não encontrado`);
    return;
  }

  html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  }).catch(error => {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar o PDF. Verifique o console para mais detalhes.');
  });
}

export function exportToExcel(data: any[], filename: string) {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    alert('Erro ao exportar para Excel. Verifique o console para mais detalhes.');
  }
}

export function exportToCSV(data: any[], filename: string) {
  try {
    if (data.length === 0) {
      alert('Nenhum dado para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    alert('Erro ao exportar para CSV. Verifique o console para mais detalhes.');
  }
}
