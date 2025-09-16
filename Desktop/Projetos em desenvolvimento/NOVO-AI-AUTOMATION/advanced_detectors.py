#!/usr/bin/env python3
"""
Detectores Avançados para o Sistema de Auto-Documentação
Detecta mudanças específicas em APIs, banco de dados e dependências
"""

import re
import json
import ast
from typing import List, Dict, Set, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

@dataclass
class APIDetection:
    """Resultado da detecção de API"""
    method: str
    endpoint: str
    file_path: str
    line_number: int
    description: Optional[str] = None
    parameters: List[str] = None
    response_type: Optional[str] = None

@dataclass
class DatabaseDetection:
    """Resultado da detecção de banco de dados"""
    table_name: str
    operation: str  # CREATE, ALTER, DROP, INSERT, UPDATE, DELETE
    file_path: str
    line_number: int
    columns: List[str] = None
    constraints: List[str] = None

@dataclass
class DependencyDetection:
    """Resultado da detecção de dependências"""
    package_name: str
    version: str
    file_path: str
    change_type: str  # added, removed, updated
    category: str  # production, development, peer

class APIDetector:
    """Detector avançado de APIs"""
    
    def __init__(self):
        self.patterns = {
            'express_js': [
                r'app\.(get|post|put|delete|patch|options|head)\([\'"]([^\'"]+)[\'"]\s*,\s*(?:async\s+)?(?:\([^)]*\)\s*=>\s*)?(?:async\s+)?(?:function\s*)?(?:\([^)]*\)\s*)?\s*\{',
                r'router\.(get|post|put|delete|patch|options|head)\([\'"]([^\'"]+)[\'"]\s*,\s*(?:async\s+)?(?:\([^)]*\)\s*=>\s*)?(?:async\s+)?(?:function\s*)?(?:\([^)]*\)\s*)?\s*\{',
                r'\.(get|post|put|delete|patch|options|head)\([\'"]([^\'"]+)[\'"]\s*,\s*(?:async\s+)?(?:\([^)]*\)\s*=>\s*)?(?:async\s+)?(?:function\s*)?(?:\([^)]*\)\s*)?\s*\{'
            ],
            'fastapi': [
                r'@app\.(get|post|put|delete|patch|options|head)\([\'"]([^\'"]+)[\'"]\)',
                r'@router\.(get|post|put|delete|patch|options|head)\([\'"]([^\'"]+)[\'"]\)'
            ],
            'flask': [
                r'@app\.route\([\'"]([^\'"]+)[\'"]\s*,\s*methods\s*=\s*\[[\'"]([^\'"]+)[\'"]\]\)',
                r'@app\.route\([\'"]([^\'"]+)[\'"]\)'
            ]
        }
    
    def detect_apis(self, file_path: str, content: str) -> List[APIDetection]:
        """Detecta APIs em um arquivo"""
        detections = []
        
        # Determinar tipo de framework
        framework = self._detect_framework(content)
        
        if framework in self.patterns:
            for pattern in self.patterns[framework]:
                matches = re.finditer(pattern, content, re.MULTILINE | re.IGNORECASE)
                
                for match in matches:
                    line_number = content[:match.start()].count('\n') + 1
                    
                    if framework == 'express_js':
                        method = match.group(1).upper()
                        endpoint = match.group(2)
                    elif framework == 'fastapi':
                        method = match.group(1).upper()
                        endpoint = match.group(2)
                    elif framework == 'flask':
                        if len(match.groups()) == 2:
                            endpoint = match.group(1)
                            method = match.group(2).upper()
                        else:
                            endpoint = match.group(1)
                            method = 'GET'  # Default para Flask
                    
                    # Extrair descrição se houver comentário
                    description = self._extract_description(content, line_number)
                    
                    # Extrair parâmetros
                    parameters = self._extract_parameters(content, match.start(), match.end())
                    
                    detection = APIDetection(
                        method=method,
                        endpoint=endpoint,
                        file_path=file_path,
                        line_number=line_number,
                        description=description,
                        parameters=parameters
                    )
                    detections.append(detection)
        
        return detections
    
    def _detect_framework(self, content: str) -> str:
        """Detecta o framework usado"""
        if 'express' in content.lower() or 'app.get' in content or 'app.post' in content:
            return 'express_js'
        elif 'fastapi' in content.lower() or '@app.get' in content:
            return 'fastapi'
        elif 'flask' in content.lower() or '@app.route' in content:
            return 'flask'
        return 'unknown'
    
    def _extract_description(self, content: str, line_number: int) -> Optional[str]:
        """Extrai descrição de comentários acima do endpoint"""
        lines = content.split('\n')
        if line_number > 1:
            # Verificar linha anterior
            prev_line = lines[line_number - 2].strip()
            if prev_line.startswith('//') or prev_line.startswith('*'):
                return prev_line.lstrip('//* ').strip()
        return None
    
    def _extract_parameters(self, content: str, start: int, end: int) -> List[str]:
        """Extrai parâmetros do endpoint"""
        # Buscar por req.params, req.body, req.query
        params = []
        param_patterns = [
            r'req\.params\.(\w+)',
            r'req\.body\.(\w+)',
            r'req\.query\.(\w+)',
            r'request\.(\w+)',
            r'@Param\([\'"](\w+)[\'"]\)',
            r'@Query\([\'"](\w+)[\'"]\)',
            r'@Body\(\)\s+(\w+)'
        ]
        
        # Buscar na área próxima ao endpoint
        search_area = content[max(0, start-500):min(len(content), end+500)]
        
        for pattern in param_patterns:
            matches = re.findall(pattern, search_area)
            params.extend(matches)
        
        return list(set(params))

class DatabaseDetector:
    """Detector avançado de banco de dados"""
    
    def __init__(self):
        self.patterns = {
            'sql': [
                r'CREATE\s+TABLE\s+(\w+)\s*\(',
                r'ALTER\s+TABLE\s+(\w+)\s+',
                r'DROP\s+TABLE\s+(\w+)',
                r'INSERT\s+INTO\s+(\w+)\s*\(',
                r'UPDATE\s+(\w+)\s+SET',
                r'DELETE\s+FROM\s+(\w+)'
            ],
            'supabase': [
                r'\.from\([\'"]([^\'"]+)[\'"]\)',
                r'\.table\([\'"]([^\'"]+)[\'"]\)',
                r'\.select\([\'"]\*[\'"]\)\s*\.from\([\'"]([^\'"]+)[\'"]\)'
            ],
            'prisma': [
                r'model\s+(\w+)\s*\{',
                r'@@map\([\'"]([^\'"]+)[\'"]\)'
            ],
            'sequelize': [
                r'sequelize\.define\([\'"]([^\'"]+)[\'"]',
                r'\.create\([\'"]([^\'"]+)[\'"]'
            ]
        }
    
    def detect_database_changes(self, file_path: str, content: str) -> List[DatabaseDetection]:
        """Detecta mudanças no banco de dados"""
        detections = []
        
        # Detectar tipo de ORM/Query Builder
        db_type = self._detect_database_type(content)
        
        if db_type in self.patterns:
            for pattern in self.patterns[db_type]:
                matches = re.finditer(pattern, content, re.MULTILINE | re.IGNORECASE)
                
                for match in matches:
                    line_number = content[:match.start()].count('\n') + 1
                    
                    if db_type == 'sql':
                        operation = self._extract_sql_operation(match.group(0))
                        table_name = match.group(1)
                    elif db_type == 'supabase':
                        table_name = match.group(1)
                        operation = 'QUERY'
                    elif db_type == 'prisma':
                        table_name = match.group(1)
                        operation = 'MODEL'
                    elif db_type == 'sequelize':
                        table_name = match.group(1)
                        operation = 'MODEL'
                    
                    # Extrair colunas se for CREATE TABLE
                    columns = []
                    if operation == 'CREATE':
                        columns = self._extract_columns(content, match.start())
                    
                    detection = DatabaseDetection(
                        table_name=table_name,
                        operation=operation,
                        file_path=file_path,
                        line_number=line_number,
                        columns=columns
                    )
                    detections.append(detection)
        
        return detections
    
    def _detect_database_type(self, content: str) -> str:
        """Detecta o tipo de banco/ORM usado"""
        if 'supabase' in content.lower():
            return 'supabase'
        elif 'prisma' in content.lower() or 'model ' in content:
            return 'prisma'
        elif 'sequelize' in content.lower():
            return 'sequelize'
        elif any(keyword in content.upper() for keyword in ['CREATE TABLE', 'ALTER TABLE', 'DROP TABLE']):
            return 'sql'
        return 'unknown'
    
    def _extract_sql_operation(self, sql_line: str) -> str:
        """Extrai operação SQL"""
        sql_line = sql_line.upper().strip()
        if sql_line.startswith('CREATE'):
            return 'CREATE'
        elif sql_line.startswith('ALTER'):
            return 'ALTER'
        elif sql_line.startswith('DROP'):
            return 'DROP'
        elif sql_line.startswith('INSERT'):
            return 'INSERT'
        elif sql_line.startswith('UPDATE'):
            return 'UPDATE'
        elif sql_line.startswith('DELETE'):
            return 'DELETE'
        return 'UNKNOWN'
    
    def _extract_columns(self, content: str, start_pos: int) -> List[str]:
        """Extrai colunas de CREATE TABLE"""
        columns = []
        
        # Buscar até encontrar o fechamento da tabela
        paren_count = 0
        in_table_def = False
        current_pos = start_pos
        
        while current_pos < len(content):
            char = content[current_pos]
            
            if char == '(':
                paren_count += 1
                in_table_def = True
            elif char == ')':
                paren_count -= 1
                if paren_count == 0 and in_table_def:
                    break
            
            current_pos += 1
        
        # Extrair definições de colunas
        table_def = content[start_pos:current_pos]
        column_pattern = r'(\w+)\s+(?:VARCHAR|INT|TEXT|BOOLEAN|DECIMAL|DATE|TIMESTAMP)'
        matches = re.findall(column_pattern, table_def, re.IGNORECASE)
        columns.extend(matches)
        
        return columns

class DependencyDetector:
    """Detector avançado de dependências"""
    
    def __init__(self):
        self.package_files = {
            'package.json': 'node',
            'requirements.txt': 'python',
            'yarn.lock': 'node',
            'package-lock.json': 'node',
            'Pipfile': 'python',
            'poetry.lock': 'python',
            'composer.json': 'php',
            'Gemfile': 'ruby'
        }
    
    def detect_dependencies(self, file_path: str, content: str) -> List[DependencyDetection]:
        """Detecta mudanças em dependências"""
        detections = []
        
        file_name = Path(file_path).name
        
        if file_name == 'package.json':
            detections.extend(self._detect_npm_dependencies(file_path, content))
        elif file_name == 'requirements.txt':
            detections.extend(self._detect_pip_dependencies(file_path, content))
        elif file_name in ['yarn.lock', 'package-lock.json']:
            detections.extend(self._detect_lock_dependencies(file_path, content))
        
        return detections
    
    def _detect_npm_dependencies(self, file_path: str, content: str) -> List[DependencyDetection]:
        """Detecta dependências NPM"""
        detections = []
        
        try:
            data = json.loads(content)
            
            # Dependências de produção
            if 'dependencies' in data:
                for package, version in data['dependencies'].items():
                    detection = DependencyDetection(
                        package_name=package,
                        version=version,
                        file_path=file_path,
                        change_type='added',
                        category='production'
                    )
                    detections.append(detection)
            
            # Dependências de desenvolvimento
            if 'devDependencies' in data:
                for package, version in data['devDependencies'].items():
                    detection = DependencyDetection(
                        package_name=package,
                        version=version,
                        file_path=file_path,
                        change_type='added',
                        category='development'
                    )
                    detections.append(detection)
            
            # Dependências peer
            if 'peerDependencies' in data:
                for package, version in data['peerDependencies'].items():
                    detection = DependencyDetection(
                        package_name=package,
                        version=version,
                        file_path=file_path,
                        change_type='added',
                        category='peer'
                    )
                    detections.append(detection)
                    
        except json.JSONDecodeError:
            pass
        
        return detections
    
    def _detect_pip_dependencies(self, file_path: str, content: str) -> List[DependencyDetection]:
        """Detecta dependências PIP"""
        detections = []
        
        lines = content.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                # Formato: package==version ou package>=version
                if '==' in line:
                    package, version = line.split('==', 1)
                elif '>=' in line:
                    package, version = line.split('>=', 1)
                elif '~=' in line:
                    package, version = line.split('~=', 1)
                else:
                    package = line
                    version = 'latest'
                
                detection = DependencyDetection(
                    package_name=package.strip(),
                    version=version.strip(),
                    file_path=file_path,
                    change_type='added',
                    category='production'
                )
                detections.append(detection)
        
        return detections
    
    def _detect_lock_dependencies(self, file_path: str, content: str) -> List[DependencyDetection]:
        """Detecta dependências em arquivos de lock"""
        detections = []
        
        # Para yarn.lock e package-lock.json, extrair informações básicas
        lines = content.split('\n')
        current_package = None
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('"') and '@' in line:
                # Formato yarn.lock
                package_info = line.strip('"').split('@')
                if len(package_info) >= 2:
                    package_name = package_info[0]
                    version = package_info[1].split('"')[0]
                    
                    detection = DependencyDetection(
                        package_name=package_name,
                        version=version,
                        file_path=file_path,
                        change_type='added',
                        category='production'
                    )
                    detections.append(detection)
        
        return detections

class AdvancedChangeAnalyzer:
    """Analisador avançado de mudanças"""
    
    def __init__(self):
        self.api_detector = APIDetector()
        self.db_detector = DatabaseDetector()
        self.dep_detector = DependencyDetector()
    
    def analyze_file_changes(self, file_path: str, old_content: str = None, new_content: str = None) -> Dict:
        """Analisa mudanças em um arquivo específico"""
        if not new_content:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    new_content = f.read()
            except:
                return {}
        
        results = {
            'apis': [],
            'database': [],
            'dependencies': [],
            'general_changes': []
        }
        
        # Detectar APIs
        api_detections = self.api_detector.detect_apis(file_path, new_content)
        results['apis'] = api_detections
        
        # Detectar mudanças no banco
        db_detections = self.db_detector.detect_database_changes(file_path, new_content)
        results['database'] = db_detections
        
        # Detectar dependências
        dep_detections = self.dep_detector.detect_dependencies(file_path, new_content)
        results['dependencies'] = dep_detections
        
        return results
