import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

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

interface Competency {
  name: string;
  value: number;
}

// Configuração global para gráficos modernos
const CHART_CONFIG = {
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  colors: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    green: '#22c55e',
    orange: '#f97316',
    pink: '#ec4899'
  },
  chartOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          size: 12,
          weight: 'bold'
        },
        bodyFont: {
          family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          size: 11
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0)'
        },
        ticks: {
          font: {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0)'
        },
        ticks: {
          font: {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            size: 11
          }
        }
      }
    }
  }
};

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('Nenhum dado para exportar');
    return;
  }

  // Obter as chaves do primeiro objeto para criar o cabeçalho
  const headers = Object.keys(data[0]);
  
  // Criar o cabeçalho CSV
  const csvHeaders = headers.join(',');
  
  // Converter os dados para CSV
  const csvData = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escapar aspas duplas e envolver em aspas se contém vírgula
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  }).join('\n');
  
  // Combinar cabeçalho e dados
  const csvContent = `${csvHeaders}\n${csvData}`;
  
  // Criar e baixar o arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportToExcel(data: any[], filename: string) {
  if (data.length === 0) {
    alert('Nenhum dado para exportar');
    return;
  }

  // Criar uma nova planilha
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  
  // Gerar o arquivo Excel
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado:', elementId);
    alert('Elemento não encontrado para exportação. Verifique se o relatório está carregado.');
    return;
  }

  console.log('Iniciando exportação PDF para elemento:', elementId);

  // Mostrar indicador de carregamento
  const loadingElement = document.createElement('div');
  loadingElement.innerHTML = 'Gerando PDF...';
  loadingElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 9999;
  `;
  document.body.appendChild(loadingElement);

  // Aguardar um pouco para garantir que todos os elementos estejam renderizados
  setTimeout(() => {
    html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#1f2937',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0
    }).then(canvas => {
      console.log('Canvas gerado com sucesso');
      
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
      
      // Remover indicador de carregamento
      if (document.body.contains(loadingElement)) {
        document.body.removeChild(loadingElement);
      }
      
      pdf.save(`${filename}.pdf`);
      console.log('PDF salvo com sucesso');
    }).catch(error => {
      console.error('Erro ao gerar PDF:', error);
      if (document.body.contains(loadingElement)) {
        document.body.removeChild(loadingElement);
      }
      alert('Erro ao gerar PDF. Tente novamente.');
    });
  }, 500);
}

export function exportReportData(data: any, format: 'pdf' | 'excel' | 'csv', filename: string) {
  switch (format) {
    case 'csv':
      if (Array.isArray(data)) {
  exportToCSV(data, filename);
      } else {
        // Converter objeto para array se necessário
        const arrayData = Object.entries(data).map(([key, value]) => ({
          Métrica: key,
          Valor: value
        }));
        exportToCSV(arrayData, filename);
      }
      break;
    case 'excel':
      if (Array.isArray(data)) {
        exportToExcel(data, filename);
      } else {
        // Converter objeto para array se necessário
        const arrayData = Object.entries(data).map(([key, value]) => ({
          Métrica: key,
          Valor: value
        }));
        exportToExcel(arrayData, filename);
      }
      break;
    case 'pdf':
      // Para PDF, precisamos de um elemento HTML
      alert('Para exportar PDF, use a função exportToPDF com um ID de elemento');
      break;
    default:
      alert('Formato não suportado');
  }
}

// Função alternativa para exportação PDF mais simples
export function exportToPDFSimple(elementId: string, filename: string) {
  console.log('Iniciando exportação PDF para:', elementId);
  
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado:', elementId);
    alert('Elemento não encontrado para exportação.');
    return;
  }

  console.log('Elemento encontrado:', element);

  // Mostrar indicador de carregamento
  const loadingElement = document.createElement('div');
  loadingElement.innerHTML = 'Gerando PDF...';
  loadingElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 9999;
  `;
  document.body.appendChild(loadingElement);

  // Aguardar um pouco para garantir que todos os elementos estejam renderizados
  setTimeout(() => {
    console.log('Iniciando html2canvas...');
    
    try {
      html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        ignoreElements: (element) => {
          // Ignorar elementos que podem causar problemas com cores
          return element.classList.contains('ignore-pdf') || 
                 element.tagName === 'SCRIPT' || 
                 element.tagName === 'STYLE';
        },
        onclone: (clonedDoc) => {
          // Remover estilos problemáticos no clone
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: #000000 !important;
              background-color: #ffffff !important;
              border-color: #000000 !important;
            }
            .bg-gradient-to-br,
            .bg-gradient-to-r,
            .bg-gradient-to-l,
            .bg-gradient-to-t,
            .bg-gradient-to-b {
              background: #f0f0f0 !important;
            }
            .text-white,
            .text-gray-300,
            .text-gray-400 {
              color: #000000 !important;
            }
            .border-white\\/10,
            .border-white\\/20 {
              border-color: #cccccc !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      }).then(canvas => {
        console.log('Canvas gerado com sucesso:', canvas);
        
        const imgData = canvas.toDataURL('image/png');
        console.log('Imagem convertida para base64');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        console.log('PDF criado');
        
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
        
        // Remover indicador de carregamento
        if (document.body.contains(loadingElement)) {
          document.body.removeChild(loadingElement);
        }
        
        console.log('Salvando PDF...');
        pdf.save(`${filename}.pdf`);
        console.log('PDF salvo com sucesso');
      }).catch(error => {
        console.error('Erro ao gerar PDF:', error);
        if (document.body.contains(loadingElement)) {
          document.body.removeChild(loadingElement);
        }
        alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      if (document.body.contains(loadingElement)) {
        document.body.removeChild(loadingElement);
      }
      alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, 1000);
}

// Função de fallback para exportação PDF usando window.print
export function exportToPDFFallback(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado:', elementId);
    alert('Elemento não encontrado para exportação.');
    return;
  }

  // Criar uma nova janela com o conteúdo do relatório
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Não foi possível abrir uma nova janela. Verifique se o popup está bloqueado.');
    return;
  }

  // Copiar estilos da página atual
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          ${styles}
          body { margin: 0; padding: 20px; background: white; }
          .print-only { display: block !important; }
        </style>
      </head>
      <body>
        ${element.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
}

// Função mais simples para exportação PDF usando apenas jsPDF
export function exportToPDFBasic(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado:', elementId);
    alert('Elemento não encontrado para exportação.');
    return;
  }

  try {
    // Criar um PDF básico com texto
    const pdf = new jsPDF();
    
    // Adicionar título
    pdf.setFontSize(20);
    pdf.text('Relatório Executivo', 20, 30);
    
    // Adicionar data
    pdf.setFontSize(12);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 50);
    
    // Adicionar conteúdo básico
    pdf.setFontSize(10);
    pdf.text('Este é um relatório básico exportado do sistema.', 20, 70);
    pdf.text('Para uma versão completa, use a funcionalidade de impressão do navegador.', 20, 80);
    
    // Salvar o PDF
    pdf.save(`${filename}.pdf`);
    console.log('PDF básico gerado com sucesso');
  } catch (error) {
    console.error('Erro ao gerar PDF básico:', error);
    alert('Erro ao gerar PDF básico: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Função alternativa que usa uma abordagem diferente para contornar problemas de cor
export function exportToPDFAlternative(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado:', elementId);
    alert('Elemento não encontrado para exportação.');
    return;
  }

  // Mostrar indicador de carregamento
  const loadingElement = document.createElement('div');
  loadingElement.innerHTML = 'Gerando PDF...';
  loadingElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 9999;
  `;
  document.body.appendChild(loadingElement);

  setTimeout(() => {
    try {
      // Criar um clone do elemento com estilos simplificados
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Aplicar estilos simplificados ao clone
      clone.style.cssText = `
        background: white !important;
        color: black !important;
        border: 1px solid #ccc !important;
        padding: 20px !important;
        font-family: Arial, sans-serif !important;
        font-size: 12px !important;
        line-height: 1.4 !important;
      `;
      
      // Remover todos os estilos problemáticos
      const allElements = clone.querySelectorAll('*');
      allElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.cssText = `
          background: white !important;
          color: black !important;
          border: 1px solid #ccc !important;
          font-family: Arial, sans-serif !important;
          font-size: 12px !important;
        `;
      });
      
      // Adicionar o clone temporariamente ao DOM
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      document.body.appendChild(clone);
      
      html2canvas(clone, {
        scale: 1,
        backgroundColor: '#ffffff',
        logging: false,
        width: clone.scrollWidth,
        height: clone.scrollHeight
      }).then(canvas => {
        // Remover o clone
        document.body.removeChild(clone);
        
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
        
        // Remover indicador de carregamento
        if (document.body.contains(loadingElement)) {
          document.body.removeChild(loadingElement);
        }
        
        pdf.save(`${filename}.pdf`);
        console.log('PDF alternativo gerado com sucesso');
      }).catch(error => {
        // Remover o clone em caso de erro
        if (document.body.contains(clone)) {
          document.body.removeChild(clone);
        }
        if (document.body.contains(loadingElement)) {
          document.body.removeChild(loadingElement);
        }
        console.error('Erro ao gerar PDF alternativo:', error);
        alert('Erro ao gerar PDF alternativo: ' + (error instanceof Error ? error.message : String(error)));
      });
    } catch (error) {
      if (document.body.contains(loadingElement)) {
        document.body.removeChild(loadingElement);
      }
      console.error('Erro ao gerar PDF alternativo:', error);
      alert('Erro ao gerar PDF alternativo: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, 1000);
}

// Nova função para exportação PDF que resolve problemas de cores
export function exportToPDFFixed(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado:', elementId);
    alert('Elemento não encontrado para exportação.');
    return;
  }

  // Mostrar indicador de carregamento
  const loadingElement = document.createElement('div');
  loadingElement.innerHTML = 'Gerando PDF...';
  loadingElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 9999;
  `;
  document.body.appendChild(loadingElement);

  setTimeout(() => {
    try {
      // Criar um clone do elemento
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Aplicar estilos de reset para evitar problemas de cores
      const style = document.createElement('style');
      style.textContent = `
        .pdf-export * {
          background: white !important;
          color: black !important;
          border: 1px solid #ccc !important;
          font-family: Arial, sans-serif !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
        }
        .pdf-export .bg-gradient-to-br,
        .pdf-export .bg-gradient-to-r,
        .pdf-export .bg-gradient-to-l,
        .pdf-export .bg-gradient-to-t,
        .pdf-export .bg-gradient-to-b {
          background: #f0f0f0 !important;
        }
        .pdf-export .text-white,
        .pdf-export .text-gray-300,
        .pdf-export .text-gray-400 {
          color: black !important;
        }
        .pdf-export .border-white\\/10,
        .pdf-export .border-white\\/20 {
          border-color: #ccc !important;
        }
      `;
      
      // Adicionar classe ao clone
      clone.classList.add('pdf-export');
      
      // Adicionar o clone temporariamente ao DOM
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px';
      clone.style.background = 'white';
      clone.style.color = 'black';
      
      document.head.appendChild(style);
      document.body.appendChild(clone);
      
      html2canvas(clone, {
        scale: 1,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: 800,
        height: clone.scrollHeight,
        ignoreElements: (element) => {
          // Ignorar elementos que podem causar problemas
          return element.classList.contains('ignore-pdf') || 
                 element.tagName === 'SCRIPT' || 
                 element.tagName === 'STYLE' ||
                 element.classList.contains('lucide-react');
        }
      }).then(canvas => {
        // Remover o clone e estilo
        document.body.removeChild(clone);
        document.head.removeChild(style);
        
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
        
        // Remover indicador de carregamento
        if (document.body.contains(loadingElement)) {
          document.body.removeChild(loadingElement);
        }
        
        pdf.save(`${filename}.pdf`);
        console.log('PDF corrigido gerado com sucesso');
      }).catch(error => {
        // Remover o clone e estilo em caso de erro
        if (document.body.contains(clone)) {
          document.body.removeChild(clone);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
        if (document.body.contains(loadingElement)) {
          document.body.removeChild(loadingElement);
        }
        console.error('Erro ao gerar PDF corrigido:', error);
        alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
      });
    } catch (error) {
      if (document.body.contains(loadingElement)) {
        document.body.removeChild(loadingElement);
      }
      console.error('Erro ao gerar PDF corrigido:', error);
      alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, 1000);
}

// Função de exportação PDF que resolve especificamente o problema de cores "lab"
export function exportToPDFLabSafe(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado:', elementId);
    alert('Elemento não encontrado para exportação.');
    return;
  }

  // Mostrar indicador de carregamento
  const loadingElement = document.createElement('div');
  loadingElement.innerHTML = 'Gerando PDF...';
  loadingElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 9999;
  `;
  document.body.appendChild(loadingElement);

  setTimeout(() => {
    try {
      // Criar um clone do elemento
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Remover todos os estilos problemáticos do clone
      const removeProblematicStyles = (el: HTMLElement) => {
        // Remover atributos de estilo inline
        el.removeAttribute('style');
        
        // Remover classes que podem causar problemas
        el.classList.remove('bg-gradient-to-br', 'bg-gradient-to-r', 'bg-gradient-to-l', 'bg-gradient-to-t', 'bg-gradient-to-b');
        el.classList.remove('text-white', 'text-gray-300', 'text-gray-400');
        el.classList.remove('border-white/10', 'border-white/20');
        
        // Aplicar estilos seguros
        el.style.cssText = `
          background: white !important;
          color: black !important;
          border: 1px solid #ccc !important;
          font-family: Arial, sans-serif !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
          margin: 2px !important;
          padding: 4px !important;
        `;
        
        // Processar filhos recursivamente
        Array.from(el.children).forEach(child => {
          removeProblematicStyles(child as HTMLElement);
        });
      };
      
      removeProblematicStyles(clone);
      
      // Adicionar o clone temporariamente ao DOM
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px';
      clone.style.background = 'white';
      clone.style.color = 'black';
      
      document.body.appendChild(clone);
      
      html2canvas(clone, {
        scale: 1,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: false,
        allowTaint: false,
        width: 800,
        height: clone.scrollHeight,
        ignoreElements: (element) => {
          // Ignorar elementos que podem causar problemas
          return element.classList.contains('ignore-pdf') || 
                 element.tagName === 'SCRIPT' || 
                 element.tagName === 'STYLE' ||
                 element.classList.contains('lucide-react') ||
                 element.tagName === 'SVG';
        }
      }).then(canvas => {
        // Remover o clone
        document.body.removeChild(clone);
        
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
        
        // Remover indicador de carregamento
        if (document.body.contains(loadingElement)) {
          document.body.removeChild(loadingElement);
        }
        
        pdf.save(`${filename}.pdf`);
        console.log('PDF seguro para cores lab gerado com sucesso');
      }).catch(error => {
        // Remover o clone em caso de erro
        if (document.body.contains(clone)) {
          document.body.removeChild(clone);
        }
        if (document.body.contains(loadingElement)) {
          document.body.removeChild(loadingElement);
        }
        console.error('Erro ao gerar PDF seguro:', error);
        alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
      });
    } catch (error) {
      if (document.body.contains(loadingElement)) {
        document.body.removeChild(loadingElement);
      }
      console.error('Erro ao gerar PDF seguro:', error);
      alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, 1000);
}

// Função de exportação PDF que cria um HTML limpo sem estilos problemáticos
export function exportToPDFClean(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado:', elementId);
    alert('Elemento não encontrado para exportação.');
    return;
  }

  // Mostrar indicador de carregamento
  const loadingElement = document.createElement('div');
  loadingElement.innerHTML = 'Gerando PDF...';
  loadingElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 9999;
  `;
  document.body.appendChild(loadingElement);

  setTimeout(() => {
    try {
      // Extrair dados do elemento original
      const title = element.querySelector('h2')?.textContent || 'Relatório Executivo';
      const metrics = element.querySelectorAll('.text-3xl');
      const revenue = metrics[0]?.textContent || 'R$ 0';
      const clients = metrics[1]?.textContent || '0';
      const conversion = metrics[2]?.textContent || '0%';
      const margin = metrics[3]?.textContent || '0%';
      
      // Criar um HTML limpo com apenas o conteúdo textual
      const cleanHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: black;
              background: white;
              margin: 20px;
              padding: 0;
            }
            h1, h2, h3, h4, h5, h6 {
              color: black;
              margin: 10px 0;
            }
            .card {
              border: 1px solid #ccc;
              margin: 10px 0;
              padding: 10px;
              background: white;
            }
            .metric {
              display: inline-block;
              margin: 5px;
              padding: 10px;
              border: 1px solid #ccc;
              background: #f9f9f9;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            th {
              background: #f0f0f0;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
          
          <div class="card">
            <h2>Métricas Principais</h2>
            <div class="metric">
              <strong>Receita Total:</strong> ${revenue}
            </div>
            <div class="metric">
              <strong>Clientes Ativos:</strong> ${clients}
            </div>
            <div class="metric">
              <strong>Taxa de Conversão:</strong> ${conversion}
            </div>
            <div class="metric">
              <strong>Margem de Lucro:</strong> ${margin}
            </div>
          </div>
          
          <div class="card">
            <h2>Análise de Performance</h2>
            <p>Este relatório contém as principais métricas e indicadores de Performance da empresa.</p>
            <p>Os dados apresentados são baseados nas informações coletadas do sistema.</p>
          </div>
          
          <div class="card">
            <h2>Recomendações</h2>
            <ul>
              <li>Continuar foco na conversão de leads</li>
              <li>Otimizar processos operacionais</li>
              <li>Investir em marketing digital</li>
              <li>Melhorar atendimento ao cliente</li>
            </ul>
          </div>
        </body>
        </html>
      `;
      
      // Criar uma nova janela com o HTML limpo
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Não foi possível abrir uma nova janela. Verifique se o popup está bloqueado.');
        if (document.body.contains(loadingElement)) {
          document.body.removeChild(loadingElement);
        }
        return;
      }
      
      printWindow.document.write(cleanHTML);
      printWindow.document.close();
      
      // Aguardar o carregamento e gerar PDF
      printWindow.onload = function() {
        setTimeout(() => {
          try {
            // Usar html2canvas na nova janela
            html2canvas(printWindow.document.body, {
              scale: 1,
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: false,
              allowTaint: false
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
              
              // Fechar a janela e remover indicador
              printWindow.close();
              if (document.body.contains(loadingElement)) {
                document.body.removeChild(loadingElement);
              }
              
              pdf.save(`${filename}.pdf`);
              console.log('PDF limpo gerado com sucesso');
            }).catch(error => {
              printWindow.close();
              if (document.body.contains(loadingElement)) {
                document.body.removeChild(loadingElement);
              }
              console.error('Erro ao gerar PDF limpo:', error);
              alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
            });
          } catch (error) {
            printWindow.close();
            if (document.body.contains(loadingElement)) {
              document.body.removeChild(loadingElement);
            }
            console.error('Erro ao gerar PDF limpo:', error);
            alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
          }
        }, 1000);
      };
      
    } catch (error) {
      if (document.body.contains(loadingElement)) {
        document.body.removeChild(loadingElement);
      }
      console.error('Erro ao gerar PDF limpo:', error);
      alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, 500);
}

// Função de exportação PDF que usa apenas jsPDF sem html2canvas
export function exportToPDFTextOnly(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Elemento não encontrado:', elementId);
    alert('Elemento não encontrado para exportação.');
    return;
  }

  try {
    // Extrair dados do elemento
    const title = element.querySelector('h2')?.textContent || 'Relatório Executivo';
    const metrics = element.querySelectorAll('.text-3xl');
    const revenue = metrics[0]?.textContent || 'R$ 0';
    const clients = metrics[1]?.textContent || '0';
    const conversion = metrics[2]?.textContent || '0%';
    const margin = metrics[3]?.textContent || '0%';
    
    // Criar PDF usando apenas jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Configurar fonte
    pdf.setFont('helvetica');
    
    // Título
    pdf.setFontSize(20);
    pdf.text(title, 20, 30);
    
    // Data
    pdf.setFontSize(12);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
    
    // Métricas
    pdf.setFontSize(16);
    pdf.text('Métricas Principais', 20, 65);
    
    pdf.setFontSize(12);
    pdf.text(`Receita Total: ${revenue}`, 20, 80);
    pdf.text(`Clientes Ativos: ${clients}`, 20, 90);
    pdf.text(`Taxa de Conversão: ${conversion}`, 20, 100);
    pdf.text(`Margem de Lucro: ${margin}`, 20, 110);
    
    // Análise
    pdf.setFontSize(16);
    pdf.text('Análise de Performance', 20, 130);
    
    pdf.setFontSize(12);
    const analysisText = [
      'Este relatório contém as principais métricas e indicadores de Performance da empresa.',
      'Os dados apresentados são baseados nas informações coletadas do sistema.',
      '',
      'Recomendações:',
      '• Continuar foco na conversão de leads',
      '• Otimizar processos operacionais',
      '• Investir em marketing digital',
      '• Melhorar atendimento ao cliente'
    ];
    
    let yPosition = 145;
    analysisText.forEach(line => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 10;
    });
    
    // Salvar PDF
    pdf.save(`${filename}.pdf`);
    console.log('PDF texto gerado com sucesso');
    
  } catch (error) {
    console.error('Erro ao gerar PDF texto:', error);
    alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Função específica para Relatório Executivo com gráficos modernos
export function exportExecutiveReportPDF(elementId: string, filename: string, data: any) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica');
    
    // Cabeçalho com design moderno
    pdf.setFillColor(30, 58, 138); // #1e3a8a
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('📊 Relatório Executivo', 20, 25);
    
    pdf.setFontSize(12);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Resetar cor para texto normal
    pdf.setTextColor(0, 0, 0);
    
    // Métricas Principais com cards visuais
    pdf.setFontSize(16);
    pdf.text('Métricas Principais', 20, 60);
    
    // Card 1 - Receita
    pdf.setFillColor(59, 130, 246); // #3b82f6
    pdf.rect(20, 70, 80, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('💰 Receita Total', 25, 80);
    pdf.setFontSize(14);
    pdf.text(`R$ ${data.metrics.totalRevenue.toLocaleString('pt-BR')}`, 25, 88);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129); // #10b981
    pdf.text('↗ +12.5% vs mês anterior', 25, 92);
    
    // Card 2 - Clientes
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(16, 185, 129); // #10b981
    pdf.rect(110, 70, 80, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('👥 Clientes Ativos', 115, 80);
    pdf.setFontSize(14);
    pdf.text(`${data.metrics.activeClients}`, 115, 88);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('↗ +8.2% vs mês anterior', 115, 92);
    
    // Card 3 - Conversão
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(139, 92, 246); // #8b5cf6
    pdf.rect(20, 105, 80, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('🎯 Taxa de Conversão', 25, 115);
    pdf.setFontSize(14);
    pdf.text(`${data.metrics.conversionRate.toFixed(1)}%`, 25, 123);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('↗ +2.1% vs mês anterior', 25, 127);
    
    // Card 4 - Margem
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(245, 158, 11); // #f59e0b
    pdf.rect(110, 105, 80, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('📈 Margem de Lucro', 115, 115);
    pdf.setFontSize(14);
    pdf.text(`${data.metrics.profitMargin.toFixed(1)}%`, 115, 123);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('↗ +1.8% vs mês anterior', 115, 127);
    
    // Resetar cor
    pdf.setTextColor(0, 0, 0);
    
    // Gráfico de Evolução de Vendas (simulado)
    pdf.setFontSize(16);
    pdf.text('📈 Evolução de Vendas (Últimos 6 meses)', 20, 150);
    
    // Criar gráfico simples com barras
    const salesData = data.salesData || [
      { month: 'Jul', value: 45000 },
      { month: 'Ago', value: 52000 },
      { month: 'Set', value: 48000 },
      { month: 'Out', value: 61000 },
      { month: 'Nov', value: 55000 },
      { month: 'Dez', value: 67000 }
    ];
    
    const maxValue = salesData.length > 0 ? Math.max(...salesData.map((d: SalesData) => d.value)) : 1;
    const chartWidth = 150;
    const chartHeight = 40;
    const startX = 20;
    const startY = 160;
    
    // Desenhar eixos
    pdf.line(startX, startY, startX + chartWidth, startY); // Eixo X
    pdf.line(startX, startY, startX, startY - chartHeight); // Eixo Y
    
    // Desenhar barras
    const barWidth = chartWidth / salesData.length;
    salesData.forEach((item: SalesData, index: number) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = startX + (index * barWidth) + 2;
      const y = startY - barHeight;
      
      // Cor da barra baseada no valor
      const intensity = item.value / maxValue;
      if (intensity > 0.8) {
        pdf.setFillColor(16, 185, 129); // Verde para valores altos
      } else if (intensity > 0.6) {
        pdf.setFillColor(59, 130, 246); // Azul para valores médios
      } else {
        pdf.setFillColor(245, 158, 11); // Laranja para valores baixos
      }
      
      pdf.rect(x, y, barWidth - 4, barHeight, 'F');
      
      // Label do mês
      pdf.setFontSize(8);
      pdf.text(item.month, x + barWidth/2 - 2, startY + 5);
    });
    
    // Análise de Crescimento Estratégico
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('⚡ Análise de Crescimento Estratégico', 20, 30);
    
    // Curto Prazo
    pdf.setFillColor(16, 185, 129);
    pdf.rect(20, 40, 50, 30, 'F');
    pdf.setFontSize(12);
    pdf.text('🚀 Curto Prazo', 25, 50);
    pdf.setFontSize(10);
    pdf.text('Próximos 3 meses', 25, 55);
    pdf.setFontSize(9);
    pdf.text('• Aumentar conversão em 15%', 25, 60);
    pdf.text('• Reduzir custos operacionais', 25, 65);
    pdf.text('• Melhorar atendimento', 25, 70);
    
    // Médio Prazo
    pdf.setFillColor(59, 130, 246);
    pdf.rect(80, 40, 50, 30, 'F');
    pdf.setFontSize(12);
    pdf.text('🎯 Médio Prazo', 85, 50);
    pdf.setFontSize(10);
    pdf.text('6-12 meses', 85, 55);
    pdf.setFontSize(9);
    pdf.text('• Expansão de mercado', 85, 60);
    pdf.text('• Novos produtos/serviços', 85, 65);
    pdf.text('• Parcerias estratégicas', 85, 70);
    
    // Longo Prazo
    pdf.setFillColor(139, 92, 246);
    pdf.rect(140, 40, 50, 30, 'F');
    pdf.setFontSize(12);
    pdf.text('👑 Longo Prazo', 145, 50);
    pdf.setFontSize(10);
    pdf.text('1-3 anos', 145, 55);
    pdf.setFontSize(9);
    pdf.text('• Liderança de mercado', 145, 60);
    pdf.text('• Franquias/licenciamento', 145, 65);
    pdf.text('• Internacionalização', 145, 70);
    
    // Gráfico de Pipeline (simulado)
    pdf.setFontSize(16);
    pdf.text('🎯 Pipeline de Vendas', 20, 90);
    
    const pipelineData = [
      { name: 'Prospecção', value: 12, color: [245, 158, 11] },
      { name: 'Qualificação', value: 8, color: [59, 130, 246] },
      { name: 'Consultoria', value: 15, color: [139, 92, 246] },
      { name: 'Proposta', value: 6, color: [16, 185, 129] },
      { name: 'Negociação', value: 4, color: [239, 68, 68] },
      { name: 'Fechado', value: 18, color: [34, 197, 94] }
    ];
    
    const totalValue = pipelineData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const centerX = 100;
    const centerY = 130;
    const radius = 30;
    
    pipelineData.forEach((item, index) => {
      const sliceAngle = (item.value / totalValue) * 360;
      
      // Desenhar fatia do gráfico de pizza
      pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
      pdf.circle(centerX, centerY, radius, 'F');
      
      // Label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle * Math.PI / 180) * (radius + 10);
      const labelY = centerY + Math.sin(labelAngle * Math.PI / 180) * (radius + 10);
      
      pdf.setFontSize(8);
      pdf.text(`${item.name}: ${item.value}`, labelX, labelY);
      
      currentAngle += sliceAngle;
    });
    
    // Rodapé
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Relatório gerado automaticamente em ' + new Date().toLocaleDateString('pt-BR'), 20, 280);
    pdf.text('Sistema de Relatórios Estratégicos v2.0 • Gráficos de alta qualidade', 20, 285);
    
    pdf.save(`${filename}.pdf`);
    console.log('Relatório Executivo PDF com gráficos modernos gerado com sucesso');
    
  } catch (error) {
    console.error('Erro ao gerar Relatório Executivo PDF:', error);
    alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Função específica para DIE (Demonstrativo de Informações Econômicas) com gráficos modernos
export function exportDIEReportPDF(elementId: string, filename: string, data: any) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica');
    
    // Cabeçalho com design moderno
    pdf.setFillColor(16, 185, 129); // #10b981
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('💰 DIE - Demonstrativo de Informações Econômicas', 20, 25);
    
    pdf.setFontSize(12);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Resetar cor
    pdf.setTextColor(0, 0, 0);
    
    // Resumo Financeiro com cards visuais
    pdf.setFontSize(16);
    pdf.text('📊 Resumo Financeiro', 20, 60);
    
    // Card Receita Bruta
    pdf.setFillColor(16, 185, 129);
    pdf.rect(20, 70, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('💵 Receita Bruta', 25, 80);
    pdf.setFontSize(14);
    pdf.text(`R$ ${data.metrics.totalRevenue.toLocaleString('pt-BR')}`, 25, 88);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('↗ +15.2% vs período anterior', 25, 92);
    
    // Card Despesas
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(239, 68, 68);
    pdf.rect(115, 70, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('💸 Despesas Totais', 120, 80);
    pdf.setFontSize(14);
    pdf.text(`R$ ${data.metrics.totalExpenses.toLocaleString('pt-BR')}`, 120, 88);
    pdf.setFontSize(8);
    pdf.setTextColor(239, 68, 68);
    pdf.text('↗ +8.7% vs período anterior', 120, 92);
    
    // Card Lucro Líquido
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(34, 197, 94);
    pdf.rect(20, 105, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('💎 Lucro Líquido', 25, 115);
    pdf.setFontSize(14);
    pdf.text(`R$ ${data.metrics.netProfit.toLocaleString('pt-BR')}`, 25, 123);
    pdf.setFontSize(8);
    pdf.setTextColor(34, 197, 94);
    pdf.text('↗ +22.1% vs período anterior', 25, 127);
    
    // Card Margem
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(139, 92, 246);
    pdf.rect(115, 105, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('📈 Margem de Lucro', 120, 115);
    pdf.setFontSize(14);
    pdf.text(`${data.metrics.profitMargin.toFixed(1)}%`, 120, 123);
    pdf.setFontSize(8);
    pdf.setTextColor(34, 197, 94);
    pdf.text('↗ +3.2% vs período anterior', 120, 127);
    
    // Gráfico de Projeções Financeiras
    pdf.setFontSize(16);
    pdf.text('📈 Projeções Financeiras (12 meses)', 20, 150);
    
    const projectionsData = data.projectionData || [
      { month: 'Jan', revenue: 45000, expenses: 30000, profit: 15000 },
      { month: 'Fev', revenue: 52000, expenses: 32000, profit: 20000 },
      { month: 'Mar', revenue: 48000, expenses: 31000, profit: 17000 },
      { month: 'Abr', revenue: 61000, expenses: 35000, profit: 26000 },
      { month: 'Mai', revenue: 55000, expenses: 33000, profit: 22000 },
      { month: 'Jun', revenue: 67000, expenses: 38000, profit: 29000 }
    ];
    
    const maxValue = Math.max(...projectionsData.map(d => Math.max(d.revenue, d.expenses, d.profit)));
    const chartWidth = 150;
    const chartHeight = 50;
    const startX = 20;
    const startY = 170;
    
    // Desenhar eixos
    pdf.line(startX, startY, startX + chartWidth, startY); // Eixo X
    pdf.line(startX, startY, startX, startY - chartHeight); // Eixo Y
    
    // Desenhar barras empilhadas
    const barWidth = chartWidth / projectionsData.length;
    projectionsData.forEach((item, index) => {
      const x = startX + (index * barWidth) + 2;
      
      // Barra de Receita
      const revenueHeight = (item.revenue / maxValue) * chartHeight;
      pdf.setFillColor(16, 185, 129); // Verde para Receita
      pdf.rect(x, startY - revenueHeight, barWidth - 4, revenueHeight, 'F');
      
      // Barra de despesas
      const expensesHeight = (item.expenses / maxValue) * chartHeight;
      pdf.setFillColor(239, 68, 68); // Vermelho para despesas
      pdf.rect(x, startY - expensesHeight, barWidth - 4, expensesHeight, 'F');
      
      // Barra de Lucro
      const profitHeight = (item.profit / maxValue) * chartHeight;
      pdf.setFillColor(34, 197, 94); // Verde claro para Lucro
      pdf.rect(x, startY - profitHeight, barWidth - 4, profitHeight, 'F');
      
      // Label do mês
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.month, x + barWidth/2 - 2, startY + 5);
    });
    
    // Nova página para análise Detalhada
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('📊 Análise Detalhada por Mês', 20, 30);
    
    // Tabela de projeções
    pdf.setFontSize(10);
    pdf.text('Mês', 20, 50);
    pdf.text('Receita', 50, 50);
    pdf.text('Despesas', 90, 50);
    pdf.text('Lucro', 130, 50);
    pdf.text('Margem %', 160, 50);
    
    // Linha separadora
    pdf.line(20, 55, 190, 55);
    
    let yPosition = 65;
    projectionsData.forEach((item, index) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const margin = ((item.profit / item.revenue) * 100).toFixed(1);
      
      pdf.text(item.month, 20, yPosition);
      pdf.text(`R$ ${item.revenue.toLocaleString('pt-BR')}`, 50, yPosition);
      pdf.text(`R$ ${item.expenses.toLocaleString('pt-BR')}`, 90, yPosition);
      pdf.text(`R$ ${item.profit.toLocaleString('pt-BR')}`, 130, yPosition);
      pdf.text(`${margin}%`, 160, yPosition);
      
      yPosition += 8;
    });
    
    // Gráfico de evolução da Margem
    pdf.setFontSize(16);
    pdf.text('📈 Evolução da Margem de Lucro', 20, 200);
    
    const marginEvolution = projectionsData.map(item => ({
      month: item.month,
      margin: ((item.profit / item.revenue) * 100)
    }));
    
    const maxMargin = Math.max(...marginEvolution.map(d => d.margin));
    const marginChartWidth = 150;
    const marginChartHeight = 40;
    const marginStartX = 20;
    const marginStartY = 220;
    
    // Desenhar eixos
    pdf.line(marginStartX, marginStartY, marginStartX + marginChartWidth, marginStartY);
    pdf.line(marginStartX, marginStartY, marginStartX, marginStartY - marginChartHeight);
    
    // Desenhar linha da Margem
    const marginBarWidth = marginChartWidth / marginEvolution.length;
    marginEvolution.forEach((item, index) => {
      const x = marginStartX + (index * marginBarWidth) + 2;
      const height = (item.margin / maxMargin) * marginChartHeight;
      
      pdf.setFillColor(139, 92, 246); // Roxo para Margem
      pdf.rect(x, marginStartY - height, marginBarWidth - 4, height, 'F');
      
      // Label do mês
      pdf.setFontSize(8);
      pdf.text(item.month, x + marginBarWidth/2 - 2, marginStartY + 5);
    });
    
    // Rodapé
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text('DIE gerado automaticamente em ' + new Date().toLocaleDateString('pt-BR'), 20, 280);
    pdf.text('Sistema de Relatórios Estratégicos v2.0 • Análise econômica avançada', 20, 285);
    
    pdf.save(`${filename}.pdf`);
    console.log('DIE PDF com gráficos modernos gerado com sucesso');
    
  } catch (error) {
    console.error('Erro ao gerar DIE PDF:', error);
    alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Função específica para Relatório de Vendas com gráficos modernos
export function exportSalesReportPDF(elementId: string, filename: string, data: any) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica');
    
    // Cabeçalho com design moderno
    pdf.setFillColor(59, 130, 246); // #3b82f6
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('Relatorio de Vendas', 20, 25);
    
    pdf.setFontSize(12);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Resetar cor
    pdf.setTextColor(0, 0, 0);
    
    // Métricas de Vendas com cards visuais
    pdf.setFontSize(16);
    pdf.text('Metricas de Vendas', 20, 60);
    
    // Dados simulados para demonstração
    const totalRevenue = data.metrics.totalRevenue || 125000;
    const totalClients = data.metrics.totalClients || 3;
    const conversionRate = data.metrics.conversionRate || 33.3;
    const avgTicket = totalClients > 0 ? (totalRevenue / totalClients) : 0;
    
    // Card Receita Total
    pdf.setFillColor(16, 185, 129);
    pdf.rect(20, 70, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('Receita Total', 25, 80);
    pdf.setFontSize(14);
    pdf.text(`R$ ${totalRevenue.toLocaleString('pt-BR')}`, 25, 88);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('+18.5% vs periodo anterior', 25, 92);
    
    // Card Total de Clientes
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(59, 130, 246);
    pdf.rect(115, 70, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('Total de Clientes', 120, 80);
    pdf.setFontSize(14);
    pdf.text(`${totalClients}`, 120, 88);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('+12.3% vs periodo anterior', 120, 92);
    
    // Card Taxa de Conversão
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(139, 92, 246);
    pdf.rect(20, 105, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('Taxa de Conversao', 25, 115);
    pdf.setFontSize(14);
    pdf.text(`${conversionRate.toFixed(1)}%`, 25, 123);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('+2.7% vs periodo anterior', 25, 127);
    
    // Card Ticket Médio
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(245, 158, 11);
    pdf.rect(115, 105, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('Ticket Medio', 120, 115);
    pdf.setFontSize(14);
    pdf.text(`R$ ${avgTicket.toLocaleString('pt-BR')}`, 120, 123);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('+5.1% vs periodo anterior', 120, 127);
    
    // Gráfico de Evolução de Vendas
    pdf.setFontSize(16);
    pdf.text('Evolucao de Vendas (ultimos 6 meses)', 20, 150);
    
    const salesEvolution = data.salesEvolution || [
      { month: 'Jul', revenue: 45000, clients: 25 },
      { month: 'Ago', revenue: 52000, clients: 28 },
      { month: 'Set', revenue: 48000, clients: 26 },
      { month: 'Out', revenue: 61000, clients: 32 },
      { month: 'Nov', revenue: 55000, clients: 29 },
      { month: 'Dez', revenue: 67000, clients: 35 }
    ];
    
    const maxRevenue = salesEvolution.length > 0 ? Math.max(...salesEvolution.map(d => d.revenue)) : 1;
    const chartWidth = 150;
    const chartHeight = 50;
    const startX = 20;
    const startY = 170;
    
    // Desenhar eixos
    pdf.line(startX, startY, startX + chartWidth, startY); // Eixo X
    pdf.line(startX, startY, startX, startY - chartHeight); // Eixo Y
    
    // Desenhar barras de Receita
    const barWidth = chartWidth / salesEvolution.length;
    salesEvolution.forEach((item, index) => {
      const x = startX + (index * barWidth) + 2;
      const height = (item.revenue / maxRevenue) * chartHeight;
      
      // Cor da barra baseada no valor
      const intensity = item.revenue / maxRevenue;
      if (intensity > 0.8) {
        pdf.setFillColor(16, 185, 129); // Verde para valores altos
      } else if (intensity > 0.6) {
        pdf.setFillColor(59, 130, 246); // Azul para valores médios
      } else {
        pdf.setFillColor(245, 158, 11); // Laranja para valores baixos
      }
      
      pdf.rect(x, startY - height, barWidth - 4, height, 'F');
      
      // Label do mês
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.month, x + barWidth/2 - 2, startY + 5);
    });
    
    // Nova página para análise por Origem
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('🎯 Análise por Origem de Clientes', 20, 30);
    
    const sources = data.sourceData || [
      { name: 'Google Ads', value: 45, color: [59, 130, 246] },
      { name: 'Facebook', value: 32, color: [16, 185, 129] },
      { name: 'Instagram', value: 28, color: [139, 92, 246] },
      { name: 'Indicação', value: 18, color: [245, 158, 11] },
      { name: 'Site Orgânico', value: 15, color: [239, 68, 68] },
      { name: 'Outros', value: 8, color: [156, 163, 175] }
    ];
    
    // Gráfico de pizza das origens
    const totalClientsFromSources = sources.reduce((sum, source) => sum + source.value, 0);
    let currentAngle = 0;
    const centerX = 100;
    const centerY = 100;
    const radius = 40;
    
    sources.forEach((source, index) => {
      const sliceAngle = (source.value / totalClientsFromSources) * 360;
      
      // Desenhar fatia do gráfico de pizza
      pdf.setFillColor(source.color[0], source.color[1], source.color[2]);
      pdf.circle(centerX, centerY, radius, 'F');
      
      // Label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle * Math.PI / 180) * (radius + 15);
      const labelY = centerY + Math.sin(labelAngle * Math.PI / 180) * (radius + 15);
      
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${source.name}: ${source.value}`, labelX, labelY);
      
      currentAngle += sliceAngle;
    });
    
    // Tabela Detalhada das origens
    pdf.setFontSize(16);
    pdf.text('📋 Detalhamento por Origem', 20, 170);
    
    pdf.setFontSize(10);
    pdf.text('Origem', 20, 190);
    pdf.text('Clientes', 80, 190);
    pdf.text('% do Total', 120, 190);
    pdf.text('Receita Média', 160, 190);
    
    // Linha separadora
    pdf.line(20, 195, 190, 195);
    
    let yPosition = 205;
    sources.forEach((source, index) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const percentage = ((source.value / totalClientsFromSources) * 100).toFixed(1);
      const avgRevenue = (data.metrics.totalRevenue / totalClientsFromSources) * source.value;
      
      pdf.text(source.name, 20, yPosition);
      pdf.text(`${source.value}`, 80, yPosition);
      pdf.text(`${percentage}%`, 120, yPosition);
      pdf.text(`R$ ${avgRevenue.toLocaleString('pt-BR')}`, 160, yPosition);
      
      yPosition += 8;
    });
    
    // Gráfico de Performance por Origem
    pdf.setFontSize(16);
    pdf.text('📊 Performance por Origem', 20, 250);
    
    const maxSourceValue = sources.length > 0 ? Math.max(...sources.map(s => s.value)) : 1;
    const PerformanceChartWidth = 150;
    const PerformanceChartHeight = 40;
    const PerformanceStartX = 20;
    const PerformanceStartY = 270;
    
    // Desenhar eixos
    pdf.line(PerformanceStartX, PerformanceStartY, PerformanceStartX + PerformanceChartWidth, PerformanceStartY);
    pdf.line(PerformanceStartX, PerformanceStartY, PerformanceStartX, PerformanceStartY - PerformanceChartHeight);
    
    // Desenhar barras horizontais
    if (sources.length > 0) {
      const PerformanceBarHeight = PerformanceChartHeight / sources.length;
      sources.forEach((source, index) => {
        const y = PerformanceStartY - (index * PerformanceBarHeight) - PerformanceBarHeight/2;
        const width = (source.value / maxSourceValue) * PerformanceChartWidth;
        
        pdf.setFillColor(source.color[0], source.color[1], source.color[2]);
        pdf.rect(PerformanceStartX, y, width, PerformanceBarHeight - 2, 'F');
      
        // Label da Origem
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.text(source.name, PerformanceStartX - 2, y + 3);
      });
    }
    
    // Rodapé
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text('Relatório de Vendas gerado automaticamente em ' + new Date().toLocaleDateString('pt-BR'), 20, 280);
    pdf.text('Sistema de Relatórios Estratégicos v2.0 • Análise de vendas avançada', 20, 285);
    
    pdf.save(`${filename}.pdf`);
    console.log('Relatório de Vendas PDF com gráficos modernos gerado com sucesso');
    
  } catch (error) {
    console.error('Erro ao gerar Relatório de Vendas PDF:', error);
    alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Função específica para Relatório Financeiro com gráficos modernos
export function exportFinancialReportPDF(elementId: string, filename: string, data: any) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica');
    
    // Cabeçalho com design moderno
    pdf.setFillColor(34, 197, 94); // #22c55e
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('💳 Relatório Financeiro', 20, 25);
    
    pdf.setFontSize(12);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Resetar cor
    pdf.setTextColor(0, 0, 0);
    
    // Métricas Financeiras com cards visuais
    pdf.setFontSize(16);
    pdf.text('💰 Métricas Financeiras', 20, 60);
    
    // Card Receita Total
    pdf.setFillColor(16, 185, 129);
    pdf.rect(20, 70, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('💵 Receita Total', 25, 80);
    pdf.setFontSize(14);
    pdf.text(`R$ ${data.metrics.totalRevenue.toLocaleString('pt-BR')}`, 25, 88);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('↗ +12.8% vs período anterior', 25, 92);
    
    // Card Despesas Totais
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(239, 68, 68);
    pdf.rect(115, 70, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('💸 Despesas Totais', 120, 80);
    pdf.setFontSize(14);
    pdf.text(`R$ ${data.metrics.totalExpenses.toLocaleString('pt-BR')}`, 120, 88);
    pdf.setFontSize(8);
    pdf.setTextColor(239, 68, 68);
    pdf.text('↗ +8.2% vs período anterior', 120, 92);
    
    // Card Lucro Líquido
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(34, 197, 94);
    pdf.rect(20, 105, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('💎 Lucro Líquido', 25, 115);
    pdf.setFontSize(14);
    pdf.text(`R$ ${data.metrics.netProfit.toLocaleString('pt-BR')}`, 25, 123);
    pdf.setFontSize(8);
    pdf.setTextColor(34, 197, 94);
    pdf.text('↗ +18.5% vs período anterior', 25, 127);
    
    // Card Margem de Lucro
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(139, 92, 246);
    pdf.rect(115, 105, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('📈 Margem de Lucro', 120, 115);
    pdf.setFontSize(14);
    pdf.text(`${data.metrics.profitMargin.toFixed(1)}%`, 120, 123);
    pdf.setFontSize(8);
    pdf.setTextColor(34, 197, 94);
    pdf.text('↗ +2.3% vs período anterior', 120, 127);
    
    // Gráfico de Fluxo de Caixa
    pdf.setFontSize(16);
    pdf.text('💸 Análise de Fluxo de Caixa', 20, 150);
    
    const cashFlowData = data.cashFlowData || [
      { category: 'Receitas de Vendas', amount: 45000, type: 'in' },
      { category: 'Outras Receitas', amount: 5000, type: 'in' },
      { category: 'Despesas Operacionais', amount: -20000, type: 'out' },
      { category: 'Custos de Funcionários', amount: -15000, type: 'out' },
      { category: 'Marketing', amount: -8000, type: 'out' },
      { category: 'Outras Despesas', amount: -7000, type: 'out' }
    ];
    
    const maxAmount = Math.max(...cashFlowData.map(d => Math.abs(d.amount)));
    const chartWidth = 150;
    const chartHeight = 50;
    const startX = 20;
    const startY = 170;
    
    // Desenhar eixos
    pdf.line(startX, startY, startX + chartWidth, startY); // Eixo X
    pdf.line(startX, startY, startX, startY - chartHeight); // Eixo Y
    
    // Desenhar barras do fluxo de caixa
    const barWidth = chartWidth / cashFlowData.length;
    cashFlowData.forEach((item, index) => {
      const x = startX + (index * barWidth) + 2;
      const height = (Math.abs(item.amount) / maxAmount) * chartHeight;
      
      if (item.type === 'in') {
        pdf.setFillColor(16, 185, 129); // Verde para entradas
      } else {
        pdf.setFillColor(239, 68, 68); // Vermelho para saídas
      }
      
      pdf.rect(x, startY - height, barWidth - 4, height, 'F');
      
      // Label da categoria
      pdf.setFontSize(6);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.category.substring(0, 8), x + barWidth/2 - 4, startY + 5);
    });
    
    // Nova página para análise Detalhada
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('📊 Análise Detalhada do Fluxo de Caixa', 20, 30);
    
    // Tabela de fluxo de caixa
    pdf.setFontSize(10);
    pdf.text('Categoria', 20, 50);
    pdf.text('Valor', 100, 50);
    pdf.text('Tipo', 150, 50);
    pdf.text('Impacto', 170, 50);
    
    // Linha separadora
    pdf.line(20, 55, 190, 55);
    
    let yPosition = 65;
    cashFlowData.forEach((item, index) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const impact = item.amount > 0 ? 'Positivo' : 'Negativo';
      const color = item.amount > 0 ? [16, 185, 129] : [239, 68, 68];
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.category, 20, yPosition);
      pdf.text(`R$ ${Math.abs(item.amount).toLocaleString('pt-BR')}`, 100, yPosition);
      pdf.text(item.type === 'in' ? 'Entrada' : 'Saída', 150, yPosition);
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(impact, 170, yPosition);
      
      yPosition += 8;
    });
    
    // Gráfico de evolução financeira
    pdf.setFontSize(16);
    pdf.text('📈 Evolução Financeira (Últimos 6 meses)', 20, 200);
    
    const financialEvolution = data.financialEvolution || [
      { month: 'Jul', revenue: 45000, expenses: 30000, profit: 15000 },
      { month: 'Ago', revenue: 52000, expenses: 32000, profit: 20000 },
      { month: 'Set', revenue: 48000, expenses: 31000, profit: 17000 },
      { month: 'Out', revenue: 61000, expenses: 35000, profit: 26000 },
      { month: 'Nov', revenue: 55000, expenses: 33000, profit: 22000 },
      { month: 'Dez', revenue: 67000, expenses: 38000, profit: 29000 }
    ];
    
    const maxFinancialValue = Math.max(...financialEvolution.map(d => Math.max(d.revenue, d.expenses, d.profit)));
    const financialChartWidth = 150;
    const financialChartHeight = 50;
    const financialStartX = 20;
    const financialStartY = 220;
    
    // Desenhar eixos
    pdf.line(financialStartX, financialStartY, financialStartX + financialChartWidth, financialStartY);
    pdf.line(financialStartX, financialStartY, financialStartX, financialStartY - financialChartHeight);
    
    // Desenhar barras empilhadas
    const financialBarWidth = financialChartWidth / financialEvolution.length;
    financialEvolution.forEach((item, index) => {
      const x = financialStartX + (index * financialBarWidth) + 2;
      
      // Barra de Receita
      const revenueHeight = (item.revenue / maxFinancialValue) * financialChartHeight;
      pdf.setFillColor(16, 185, 129); // Verde para Receita
      pdf.rect(x, financialStartY - revenueHeight, financialBarWidth - 4, revenueHeight, 'F');
      
      // Barra de despesas
      const expensesHeight = (item.expenses / maxFinancialValue) * financialChartHeight;
      pdf.setFillColor(239, 68, 68); // Vermelho para despesas
      pdf.rect(x, financialStartY - expensesHeight, financialBarWidth - 4, expensesHeight, 'F');
      
      // Barra de Lucro
      const profitHeight = (item.profit / maxFinancialValue) * financialChartHeight;
      pdf.setFillColor(34, 197, 94); // Verde claro para Lucro
      pdf.rect(x, financialStartY - profitHeight, financialBarWidth - 4, profitHeight, 'F');
      
      // Label do mês
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.month, x + financialBarWidth/2 - 2, financialStartY + 5);
    });
    
    // Legenda
    pdf.setFontSize(10);
    pdf.text('Legenda:', 20, 280);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('■ Receita', 20, 285);
    pdf.setTextColor(239, 68, 68);
    pdf.text('■ Despesas', 60, 285);
    pdf.setTextColor(34, 197, 94);
    pdf.text('■ Lucro', 100, 285);
    
    // Rodapé
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text('Relatório Financeiro gerado automaticamente em ' + new Date().toLocaleDateString('pt-BR'), 20, 280);
    pdf.text('Sistema de Relatórios Estratégicos v2.0 • Análise financeira avançada', 20, 285);
    
    pdf.save(`${filename}.pdf`);
    console.log('Relatório Financeiro PDF gerado com sucesso');
    
  } catch (error) {
    console.error('Erro ao gerar Relatório Financeiro PDF:', error);
    alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Função específica para Relatório de Performance com gráficos modernos
export function exportPerformanceReportPDF(elementId: string, filename: string, data: any) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica');
    
    // Cabeçalho com design moderno
    pdf.setFillColor(139, 92, 246); // #8b5cf6
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('⚡ Relatório de Performance', 20, 25);
    
    pdf.setFontSize(12);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Resetar cor
    pdf.setTextColor(0, 0, 0);
    
    // Métricas de Performance com cards visuais
    pdf.setFontSize(16);
    pdf.text('📊 Métricas de Performance', 20, 60);
    
    // Card Total de Clientes
    pdf.setFillColor(16, 185, 129);
    pdf.rect(20, 70, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('👥 Total de Clientes', 25, 80);
    pdf.setFontSize(14);
    pdf.text(`${data.metrics.totalClients}`, 25, 88);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('↗ +15.3% vs período anterior', 25, 92);
    
    // Card Taxa de Conversão
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(59, 130, 246);
    pdf.rect(115, 70, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('🎯 Taxa de Conversão', 120, 80);
    pdf.setFontSize(14);
    pdf.text(`${data.metrics.conversionRate.toFixed(1)}%`, 120, 88);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('↗ +3.2% vs período anterior', 120, 92);
    
    // Card Pipeline Ativo
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(139, 92, 246);
    pdf.rect(20, 105, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('🔄 Pipeline Ativo', 25, 115);
    pdf.setFontSize(14);
    pdf.text(`${data.metrics.totalTasks}`, 25, 123);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('↗ +8.7% vs período anterior', 25, 127);
    
    // Card Performance Geral
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(245, 158, 11);
    pdf.rect(115, 105, 85, 25, 'F');
    pdf.setFontSize(10);
    pdf.text('⭐ Performance Geral', 120, 115);
    pdf.setFontSize(14);
    pdf.text('87%', 120, 123);
    pdf.setFontSize(8);
    pdf.setTextColor(16, 185, 129);
    pdf.text('↗ +5.1% vs período anterior', 120, 127);
    
    // Gráfico de Performance da Equipe
    pdf.setFontSize(16);
    pdf.text('👥 Performance da Equipe', 20, 150);
    
    const teamPerformance = data.teamPerformance || [
      { name: 'João Silva', sales: 12, clients: 8, conversion: 85, color: [16, 185, 129] },
      { name: 'Maria Santos', sales: 15, clients: 12, conversion: 78, color: [59, 130, 246] },
      { name: 'Carlos Lima', sales: 8, clients: 6, conversion: 75, color: [139, 92, 246] },
      { name: 'Ana Costa', sales: 18, clients: 14, conversion: 90, color: [245, 158, 11] }
    ];
    
    const maxSales = Math.max(...teamPerformance.map(member => member.sales));
    const chartWidth = 150;
    const chartHeight = 50;
    const startX = 20;
    const startY = 170;
    
    // Desenhar eixos
    pdf.line(startX, startY, startX + chartWidth, startY); // Eixo X
    pdf.line(startX, startY, startX, startY - chartHeight); // Eixo Y
    
    // Desenhar barras da equipe
    const barWidth = chartWidth / teamPerformance.length;
    teamPerformance.forEach((member, index) => {
      const x = startX + (index * barWidth) + 2;
      const height = (member.sales / maxSales) * chartHeight;
      
      // Cor baseada na Performance
      pdf.setFillColor(member.color[0], member.color[1], member.color[2]);
      pdf.rect(x, startY - height, barWidth - 4, height, 'F');
      
      // Label do nome
      pdf.setFontSize(6);
      pdf.setTextColor(0, 0, 0);
      pdf.text(member.name.split(' ')[0], x + barWidth/2 - 3, startY + 5);
    });
    
    // Nova página para análise Detalhada
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('📋 Análise Detalhada da Equipe', 20, 30);
    
    // Tabela de Performance da equipe
    pdf.setFontSize(10);
    pdf.text('Membro', 20, 50);
    pdf.text('Vendas', 80, 50);
    pdf.text('Clientes', 110, 50);
    pdf.text('Conversão', 140, 50);
    pdf.text('Performance', 170, 50);
    
    // Linha separadora
    pdf.line(20, 55, 190, 55);
    
    let yPosition = 65;
    teamPerformance.forEach((member, index) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const Performance = member.conversion >= 85 ? 'Excelente' : 
                        member.conversion >= 75 ? 'Boa' : 'Regular';
      const PerformanceColor = member.conversion >= 85 ? [16, 185, 129] : 
                              member.conversion >= 75 ? [59, 130, 246] : [239, 68, 68];
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(member.name, 20, yPosition);
      pdf.text(`${member.sales}`, 80, yPosition);
      pdf.text(`${member.clients}`, 110, yPosition);
      pdf.text(`${member.conversion}%`, 140, yPosition);
      pdf.setTextColor(PerformanceColor[0], PerformanceColor[1], PerformanceColor[2]);
      pdf.text(Performance, 170, yPosition);
      
      yPosition += 8;
    });
    
    // Gráfico de conversão por membro
    pdf.setFontSize(16);
    pdf.text('📈 Taxa de Conversão por Membro', 20, 200);
    
    const maxConversion = Math.max(...teamPerformance.map(member => member.conversion));
    const conversionChartWidth = 150;
    const conversionChartHeight = 40;
    const conversionStartX = 20;
    const conversionStartY = 220;
    
    // Desenhar eixos
    pdf.line(conversionStartX, conversionStartY, conversionStartX + conversionChartWidth, conversionStartY);
    pdf.line(conversionStartX, conversionStartY, conversionStartX, conversionStartY - conversionChartHeight);
    
    // Desenhar barras de conversão
    const conversionBarWidth = conversionChartWidth / teamPerformance.length;
    teamPerformance.forEach((member, index) => {
      const x = conversionStartX + (index * conversionBarWidth) + 2;
      const height = (member.conversion / maxConversion) * conversionChartHeight;
      
      // Cor baseada na Taxa de conversão
      if (member.conversion >= 85) {
        pdf.setFillColor(16, 185, 129); // Verde para excelente
      } else if (member.conversion >= 75) {
        pdf.setFillColor(59, 130, 246); // Azul para bom
      } else {
        pdf.setFillColor(239, 68, 68); // Vermelho para regular
      }
      
      pdf.rect(x, conversionStartY - height, conversionBarWidth - 4, height, 'F');
      
      // Label do nome
      pdf.setFontSize(6);
      pdf.setTextColor(0, 0, 0);
      pdf.text(member.name.split(' ')[0], x + conversionBarWidth/2 - 3, conversionStartY + 5);
    });
    
    // Gráfico de radar de competências
    pdf.setFontSize(16);
    pdf.text('🎯 Análise de Competências', 20, 270);
    
    // Criar um gráfico de radar simples
    const competencies = [
      { name: 'Vendas', value: 85 },
      { name: 'Atendimento', value: 92 },
      { name: 'Prospecção', value: 78 },
      { name: 'Follow-up', value: 88 },
      { name: 'Fechamento', value: 82 }
    ];
    
    const radarCenterX = 100;
    const radarCenterY = 100;
    const radarRadius = 30;
    
    // Desenhar círculos concêntricos
    for (let i = 1; i <= 5; i++) {
      const radius = (radarRadius / 5) * i;
      pdf.setDrawColor(200, 200, 200);
      pdf.circle(radarCenterX, radarCenterY, radius);
    }
    
    // Desenhar eixos
    for (let i = 0; i < competencies.length; i++) {
      const angle = (i * 360) / competencies.length;
      const x = radarCenterX + Math.cos(angle * Math.PI / 180) * radarRadius;
      const y = radarCenterY + Math.sin(angle * Math.PI / 180) * radarRadius;
      pdf.setDrawColor(100, 100, 100);
      pdf.line(radarCenterX, radarCenterY, x, y);
      
      // Label da competência
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(competencies[i].name, x + 5, y);
    }
    
    // Desenhar área de Performance
    pdf.setFillColor(16, 185, 129, 0.3);
    competencies.forEach((comp, index) => {
      const angle = (index * 360) / competencies.length;
      const radius = (comp.value / 100) * radarRadius;
      const x = radarCenterX + Math.cos(angle * Math.PI / 180) * radius;
      const y = radarCenterY + Math.sin(angle * Math.PI / 180) * radius;
      
      if (index === 0) {
        pdf.moveTo(x, y);
      } else {
        pdf.lineTo(x, y);
      }
    });
    
    // Rodapé
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text('Relatório de Performance gerado automaticamente em ' + new Date().toLocaleDateString('pt-BR'), 20, 280);
    pdf.text('Sistema de Relatórios Estratégicos v2.0 • Análise de Performance avançada', 20, 285);
    
    pdf.save(`${filename}.pdf`);
    console.log('Relatório de Performance PDF gerado com sucesso');
    
  } catch (error) {
    console.error('Erro ao gerar Relatório de Performance PDF:', error);
    alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Função específica para Análise de Crescimento com gráficos modernos
export function exportGrowthReportPDF(elementId: string, filename: string, data: any) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica');
    
    // Cabeçalho com design moderno
    pdf.setFillColor(245, 158, 11); // #f59e0b
    pdf.rect(0, 0, 210, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('🚀 Análise de Crescimento', 20, 25);
    
    pdf.setFontSize(12);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Resetar cor
    pdf.setTextColor(0, 0, 0);
    
    // Estratégias de Crescimento com cards visuais
    pdf.setFontSize(16);
    pdf.text('📈 Estratégias de Crescimento', 20, 60);
    
    // Card Curto Prazo
    pdf.setFillColor(16, 185, 129);
    pdf.rect(20, 70, 50, 40, 'F');
    pdf.setFontSize(12);
    pdf.text('🚀 Curto Prazo', 25, 80);
    pdf.setFontSize(10);
    pdf.text('Próximos 3 meses', 25, 85);
    pdf.setFontSize(9);
    pdf.text('• Aumentar conversão em 15%', 25, 90);
    pdf.text('• Reduzir custos operacionais', 25, 95);
    pdf.text('• Melhorar atendimento', 25, 100);
    
    // Card Médio Prazo
    pdf.setFillColor(59, 130, 246);
    pdf.rect(80, 70, 50, 40, 'F');
    pdf.setFontSize(12);
    pdf.text('🎯 Médio Prazo', 85, 80);
    pdf.setFontSize(10);
    pdf.text('6-12 meses', 85, 85);
    pdf.setFontSize(9);
    pdf.text('• Expansão de mercado', 85, 90);
    pdf.text('• Novos produtos/serviços', 85, 95);
    pdf.text('• Parcerias estratégicas', 85, 100);
    
    // Card Longo Prazo
    pdf.setFillColor(139, 92, 246);
    pdf.rect(140, 70, 50, 40, 'F');
    pdf.setFontSize(12);
    pdf.text('👑 Longo Prazo', 145, 80);
    pdf.setFontSize(10);
    pdf.text('1-3 anos', 145, 85);
    pdf.setFontSize(9);
    pdf.text('• Liderança de mercado', 145, 90);
    pdf.text('• Franquias/licenciamento', 145, 95);
    pdf.text('• Internacionalização', 145, 100);
    
    // Gráfico de Projeção de Crescimento
    pdf.setFontSize(16);
    pdf.text('📊 Projeção de Crescimento (12 meses)', 20, 130);
    
    const growthProjection = data.growthProjection || [
      { month: 'Jan', revenue: 45000, clients: 25, growth: 0 },
      { month: 'Fev', revenue: 52000, clients: 28, growth: 15.6 },
      { month: 'Mar', revenue: 48000, clients: 26, growth: -7.7 },
      { month: 'Abr', revenue: 61000, clients: 32, growth: 27.1 },
      { month: 'Mai', revenue: 55000, clients: 29, growth: -9.8 },
      { month: 'Jun', revenue: 67000, clients: 35, growth: 21.8 },
      { month: 'Jul', revenue: 72000, clients: 38, growth: 7.5 },
      { month: 'Ago', revenue: 68000, clients: 36, growth: -5.6 },
      { month: 'Set', revenue: 75000, clients: 40, growth: 10.3 },
      { month: 'Out', revenue: 82000, clients: 44, growth: 9.3 },
      { month: 'Nov', revenue: 78000, clients: 42, growth: -4.9 },
      { month: 'Dez', revenue: 90000, clients: 48, growth: 15.4 }
    ];
    
    const maxRevenue = Math.max(...growthProjection.map(d => d.revenue));
    const chartWidth = 150;
    const chartHeight = 50;
    const startX = 20;
    const startY = 150;
    
    // Desenhar eixos
    pdf.line(startX, startY, startX + chartWidth, startY); // Eixo X
    pdf.line(startX, startY, startX, startY - chartHeight); // Eixo Y
    
    // Desenhar linha de Crescimento
    const barWidth = chartWidth / growthProjection.length;
    growthProjection.forEach((item, index) => {
      const x = startX + (index * barWidth) + 2;
      const height = (item.revenue / maxRevenue) * chartHeight;
      
      // Cor baseada no Crescimento
      if (item.growth > 10) {
        pdf.setFillColor(16, 185, 129); // Verde para Crescimento alto
      } else if (item.growth > 0) {
        pdf.setFillColor(59, 130, 246); // Azul para Crescimento moderado
      } else {
        pdf.setFillColor(239, 68, 68); // Vermelho para declínio
      }
      
      pdf.rect(x, startY - height, barWidth - 4, height, 'F');
      
      // Label do mês
      pdf.setFontSize(6);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.month, x + barWidth/2 - 2, startY + 5);
    });
    
    // Nova página para análise Detalhada
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('📋 Análise Detalhada de Crescimento', 20, 30);
    
    // Tabela de projeção
    pdf.setFontSize(10);
    pdf.text('Mês', 20, 50);
    pdf.text('Receita', 50, 50);
    pdf.text('Clientes', 100, 50);
    pdf.text('Crescimento %', 140, 50);
    pdf.text('Status', 170, 50);
    
    // Linha separadora
    pdf.line(20, 55, 190, 55);
    
    let yPosition = 65;
    growthProjection.forEach((item, index) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const status = item.growth > 10 ? 'Excelente' : 
                   item.growth > 0 ? 'Bom' : 'Atenção';
      const statusColor = item.growth > 10 ? [16, 185, 129] : 
                         item.growth > 0 ? [59, 130, 246] : [239, 68, 68];
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.month, 20, yPosition);
      pdf.text(`R$ ${item.revenue.toLocaleString('pt-BR')}`, 50, yPosition);
      pdf.text(`${item.clients}`, 100, yPosition);
      pdf.text(`${item.growth.toFixed(1)}%`, 140, yPosition);
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(status, 170, yPosition);
      
      yPosition += 8;
    });
    
    // Gráfico de evolução de Clientes
    pdf.setFontSize(16);
    pdf.text('👥 Evolução de Clientes', 20, 200);
    
    const maxClients = Math.max(...growthProjection.map(d => d.clients));
    const clientsChartWidth = 150;
    const clientsChartHeight = 40;
    const clientsStartX = 20;
    const clientsStartY = 220;
    
    // Desenhar eixos
    pdf.line(clientsStartX, clientsStartY, clientsStartX + clientsChartWidth, clientsStartY);
    pdf.line(clientsStartX, clientsStartY, clientsStartX, clientsStartY - clientsChartHeight);
    
    // Desenhar linha de Clientes
    const clientsBarWidth = clientsChartWidth / growthProjection.length;
    growthProjection.forEach((item, index) => {
      const x = clientsStartX + (index * clientsBarWidth) + 2;
      const height = (item.clients / maxClients) * clientsChartHeight;
      
      pdf.setFillColor(139, 92, 246); // Roxo para Clientes
      pdf.rect(x, clientsStartY - height, clientsBarWidth - 4, height, 'F');
      
      // Label do mês
      pdf.setFontSize(6);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.month, x + clientsBarWidth/2 - 2, clientsStartY + 5);
    });
    
    // Gráfico de radar de estratégias
    pdf.setFontSize(16);
    pdf.text('🎯 Análise de Estratégias', 20, 270);
    
    // Criar um gráfico de radar para estratégias
    const strategies = [
      { name: 'Marketing', value: 85 },
      { name: 'Vendas', value: 92 },
      { name: 'Produto', value: 78 },
      { name: 'Operações', value: 88 },
      { name: 'Financeiro', value: 82 }
    ];
    
    const strategyCenterX = 100;
    const strategyCenterY = 100;
    const strategyRadius = 30;
    
    // Desenhar círculos concêntricos
    for (let i = 1; i <= 5; i++) {
      const radius = (strategyRadius / 5) * i;
      pdf.setDrawColor(200, 200, 200);
      pdf.circle(strategyCenterX, strategyCenterY, radius);
    }
    
    // Desenhar eixos
    for (let i = 0; i < strategies.length; i++) {
      const angle = (i * 360) / strategies.length;
      const x = strategyCenterX + Math.cos(angle * Math.PI / 180) * strategyRadius;
      const y = strategyCenterY + Math.sin(angle * Math.PI / 180) * strategyRadius;
      pdf.setDrawColor(100, 100, 100);
      pdf.line(strategyCenterX, strategyCenterY, x, y);
      
      // Label da estratégia
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(strategies[i].name, x + 5, y);
    }
    
    // Desenhar área de estratégias
    pdf.setFillColor(245, 158, 11, 0.3);
    strategies.forEach((strategy, index) => {
      const angle = (index * 360) / strategies.length;
      const radius = (strategy.value / 100) * strategyRadius;
      const x = strategyCenterX + Math.cos(angle * Math.PI / 180) * radius;
      const y = strategyCenterY + Math.sin(angle * Math.PI / 180) * radius;
      
      if (index === 0) {
        pdf.moveTo(x, y);
      } else {
        pdf.lineTo(x, y);
      }
    });
    
    // Rodapé
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text('Análise de Crescimento gerada automaticamente em ' + new Date().toLocaleDateString('pt-BR'), 20, 280);
    pdf.text('Sistema de Relatórios Estratégicos v2.0 • Análise de Crescimento avançada', 20, 285);
    
    // Projeções de Crescimento
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Projeções de Crescimento (12 meses)', 20, 30);
    
    pdf.setFontSize(12);
    const projections = [
      'Janeiro: Receita R$ 45.000, Despesas R$ 30.000, Lucro R$ 15.000',
      'Fevereiro: Receita R$ 52.000, Despesas R$ 32.000, Lucro R$ 20.000',
      'Março: Receita R$ 48.000, Despesas R$ 31.000, Lucro R$ 17.000',
      'Abril: Receita R$ 61.000, Despesas R$ 35.000, Lucro R$ 26.000',
      'Maio: Receita R$ 55.000, Despesas R$ 33.000, Lucro R$ 22.000',
      'Junho: Receita R$ 67.000, Despesas R$ 38.000, Lucro R$ 29.000'
    ];
    
    yPosition = 45;
    projections.forEach(line => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 8;
    });
    
    pdf.save(`${filename}.pdf`);
    console.log('Análise de Crescimento PDF gerado com sucesso');
    
  } catch (error) {
    console.error('Erro ao gerar Análise de Crescimento PDF:', error);
    alert('Erro ao gerar PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
}
