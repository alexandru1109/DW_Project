import os
import re

# Cele mai stricte extensii (doar codul efectiv de logica si UI, fara styling, fara docs)
ALLOWED_EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx', '.py'}

# Directoare ignorate (orice tine de cache, build, module)
IGNORE_DIRS = {
    'node_modules', '.git', '__pycache__', 'venv', 'env', 
    'dist', 'build', '.idea', '.vscode', 'local_mongo',
    'spark-warehouse', 'data', 'stream_in', 'stream_out',
    'tests', '__tests__', 'test'
}

OUTPUT_FILE = 'claude_context_minimal.txt'

def generate_context():
    total_files = 0
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk('.'):
            # Filtram directoarele
            dirs[:] = [d for d in dirs if d.lower() not in IGNORE_DIRS and not d.startswith('.')]
            
            for file in files:
                # Sarim peste fisierele de test pentru a economisi tokeni masiv
                if 'test' in file.lower() or 'spec' in file.lower():
                    continue
                
                ext = os.path.splitext(file)[1].lower()
                
                # Includem DOAR logica. Fara package.json, fara CSS, fara README.
                if ext in ALLOWED_EXTENSIONS:
                    filepath = os.path.join(root, file)
                    
                    try:
                        with open(filepath, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            
                            # Eliminam liniile goale multiple pentru a reduce numarul de tokeni
                            content = re.sub(r'\n\s*\n', '\n\n', content)
                            
                            outfile.write(f"\n// {'='*50}\n")
                            outfile.write(f"// FILE: {filepath}\n")
                            outfile.write(f"// {'='*50}\n")
                            outfile.write(content.strip())
                            outfile.write("\n")
                            total_files += 1
                    except Exception as e:
                        print(f"Eroare la citirea {filepath}: {e}")

    size_kb = os.path.getsize(OUTPUT_FILE) // 1024
    print(f"Gata! Am procesat {total_files} fisiere esentiale.")
    print(f"Fisierul {OUTPUT_FILE} a fost generat si curatat de whitespace inutil.")
    print(f"Dimensiunea fisierului este MINUSCULA: {size_kb} KB.")
    print("Incarca acest fisier 'claude_context_minimal.txt' in Claude. Va merge 100%.")

if __name__ == "__main__":
    generate_context()
