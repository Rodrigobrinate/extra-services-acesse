# Usa a imagem oficial do Nginx baseada no Alpine Linux
FROM nginx:alpine

# Remove o arquivo de configuração padrão do Nginx
# Isso evita conflitos e garante que sua configuração seja usada
RUN rm /etc/nginx/conf.d/default.conf

# Copia seu arquivo de configuração personalizado do Nginx para o contêiner
# Certifique-se de que 'nginx.conf' esteja no mesmo diretório do Dockerfile
COPY nginx.conf /etc/nginx/conf.d/

# Copia seus arquivos estáticos (HTML, CSS, JS, imagens, etc.) para o diretório de serviço do Nginx
# Certifique-se de que a pasta 'public' (ou o nome da sua pasta de arquivos estáticos)
# esteja no mesmo diretório do Dockerfile
COPY . /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx para HTTP
# Isso permite que você acesse o servidor de fora do contêiner
EXPOSE 8085

# O comando padrão do Nginx já é executado automaticamente quando o contêiner inicia
# CMD ["nginx", "-g", "daemon off;"] # Não precisa, já é o CMD padrão da imagem nginx:alpine
