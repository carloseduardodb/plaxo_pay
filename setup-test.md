# Setup para Testes

## 1. Gerar Hash da Senha
```bash
npm run generate-hash admin123
```

## 2. Configurar .env
```bash
# Copie o hash gerado e adicione no .env
AUTH_USERNAME=admin
AUTH_PASSWORD_HASH=<hash_gerado_aqui>
JWT_SECRET=minha-chave-secreta-jwt-super-segura
```

## 3. Executar Aplicação
```bash
# Subir banco
docker-compose up -d postgres

# Executar migrations
npm run migration:run

# Executar seeds (opcional)
npm run seed

# Iniciar aplicação
npm run start:dev
```

## 4. Testar APIs
- Abra o arquivo `api-test.http` no VS Code
- Execute primeiro o request de **Login**
- O token será automaticamente capturado para os próximos requests
- Execute os demais endpoints

## 5. Swagger
Acesse: http://localhost:3000/api
- Use o botão "Authorize" para inserir o Bearer token
- Teste diretamente pela interface