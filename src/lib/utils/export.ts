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
  // Para uma implementação mais robusta, seria necessário uma biblioteca como xlsx
  // Por enquanto, vamos usar CSV que pode ser aberto no Excel
  exportToCSV(data, filename);
}
