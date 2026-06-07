import os
import re

# Extensii stricte: doar logica și interfața
ALLOWED_EXTENSIONS = {'.ts', '.tsx', '.py'}

# Directoare care nu aduc valoare arhitecturala in evaluare
IGNORE_DIRS = {
    'node_modules', '.git', '__pycache__', 'venv', 'env', 
    'dist', 'build', '.idea', '.vscode', 'local_mongo',
    'spark-warehouse', 'data', 'stream_in', 'stream_out',
    'tests', '__tests__', 'test', 'assets', 'public'
}

OUTPUT_FILE = 'claude_context.txt'

def generate_context():
    total_files = 0
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk('.'):
            # Filtram directoarele in-place
            dirs[:] = [d for d in dirs if d.lower() not in IGNORE_DIRS and not d.startswith('.')]
            
            for file in files:
                # Ignoram fisierele de teste, lock-uri si imagini
                file_lower = file.lower()
                if 'test' in file_lower or 'spec' in file_lower or file_lower.endswith('-lock.json'):
                    continue
                
                ext = os.path.splitext(file)[1].lower()
                
                # Includem extensiile permise si fisierele package.json (pentru a vedea dependintele)
                if ext in ALLOWED_EXTENSIONS or file == 'package.json':
                    filepath = os.path.join(root, file)
                    
                    try:
                        with open(filepath, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            
                            # Comprimam putin textul
                            content = re.sub(r'\n\s*\n', '\n\n', content)
                            
                            outfile.write(f"\n// {'-'*50}\n")
                            outfile.write(f"// FILE: {filepath}\n")
                            outfile.write(f"// {'-'*50}\n")
                            outfile.write(content.strip())
                            outfile.write("\n")
                            total_files += 1
                    except Exception as e:
                        print(f"Nu am putut citi {filepath}: {e}")

    size_kb = os.path.getsize(OUTPUT_FILE) // 1024
    print(f"Gata! Am procesat {total_files} fisiere esentiale.")
    print(f"Dimensiunea fisierului este: {size_kb} KB.")

if __name__ == "__main__":
    generate_context()
