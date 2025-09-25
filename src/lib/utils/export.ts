import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

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
