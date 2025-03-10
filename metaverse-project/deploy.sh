#!/bin/bash

# Diretório de origem (dist)
DIST_DIR="./dist"

# Diretório temporário para o deploy
TEMP_DIR="/tmp/netlify_deploy_$(date +%s)"

# Criar diretório temporário
mkdir -p "$TEMP_DIR"

# Copiar arquivos para o diretório temporário
cp -r "$DIST_DIR"/* "$TEMP_DIR"

# Criar netlify.toml no diretório temporário
cat > "$TEMP_DIR/netlify.toml" << EOL
[build]
  publish = "/"
  command = "echo 'No build command needed, site is pre-built'"
  
[build.environment]
  NODE_VERSION = "18"
  
[build.processing]
  skip_processing = true
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOL

# Navegar para o diretório temporário
cd "$TEMP_DIR"

# Fazer o deploy para o Netlify
echo "Fazendo o deploy para o Netlify..."
npx netlify deploy --dir=. --prod

# Limpar
echo "Limpando arquivos temporários..."
rm -rf "$TEMP_DIR"

echo "Deploy concluído!" 