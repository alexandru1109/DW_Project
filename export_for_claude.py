import os

# Extensiile pe care vrem sa le extragem (doar cod sursa util)
ALLOWED_EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx', '.py', '.css', '.html', '.md'}

# Fisiere si directoare pe care vrem sa le ignoram complet
IGNORE_DIRS = {
    'node_modules', '.git', '__pycache__', 'venv', 'env', 
    'dist', 'build', '.idea', '.vscode', 'local_mongo',
    'spark-warehouse', 'data', 'stream_in', 'stream_out'
}
IGNORE_FILES = {
    'package-lock.json', 'saved_model.h5', 'plot.png', 'logo.webp', '.DS_Store'
}

OUTPUT_FILE = 'claude_context.txt'

def generate_context():
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk('.'):
            # Filtram directoarele ignorate (modificam lista in-place pt os.walk)
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')]
            
            for file in files:
                if file in IGNORE_FILES:
                    continue
                
                # Verificam extensia (luam pachet.json, dar nu package-lock)
                ext = os.path.splitext(file)[1]
                if ext in ALLOWED_EXTENSIONS or file == 'package.json':
                    filepath = os.path.join(root, file)
                    
                    try:
                        with open(filepath, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            
                            # Scriem calea fisierului ca header
                            outfile.write(f"\n{'='*80}\n")
                            outfile.write(f"FILE: {filepath}\n")
                            outfile.write(f"{'='*80}\n\n")
                            outfile.write(content)
                            outfile.write("\n")
                    except Exception as e:
                        print(f"Eroare la citirea {filepath}: {e}")

    print(f"Gata! Fisierul {OUTPUT_FILE} a fost generat.")
    print(f"Dimensiunea fisierului este de aproximativ {os.path.getsize(OUTPUT_FILE) // 1024} KB.")
    print("Acum poti uploada 'claude_context.txt' in Claude, va avea un numar redus de tokeni.")

if __name__ == "__main__":
    generate_context()
