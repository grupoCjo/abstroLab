# Aplicação WEB - Abstrolab

Este projeto foi desenvolvido para a disciplina de Projeto de Extensão 2, realizado em parceria com o NAPNE do Campus IFSP - CJO.
A aplicação possui como objetivo auxiliar alunos com TEA no processo de Abstração Matemática, por meio de exercícios simples, que exploram pcitogramas para visualização e correlação com os números.
Ainda, foi utilizada a API REST ARASAAC para pictogramas.

## Funcionalidades

- **Dashboard Interativo**: Interface do usuário que mostra o progresso.
- **Cadastro de usuários** com validação de campos e senha segura
- **Login com autenticação** e resposta com usuario_ID
- **Registro de sessões** para controle de uso
- **Registro de progresso** em exercícios
- **Sistema de trilha** com identificação do “próximo exercício”
- **Painel de configurações** com tema claro/escuro (armazenado por usuário)
- **Serviço de pictogramas** para ilustrar exercícios
- **Logs detalhados com Winston** (informações, warnings, erros)
- **Servidor estático completo** (HTML, CSS, JS, imagens, áudios)

## Tecnologias e Bibliotecas Utilizadas

- Express – framework principal do servidor
- Cors – para habilitar requisições cross-origin (CORS)
- Dotenv – para variáveis de ambiente
- Winston – para logging de eventos, erros e requisições
- Bcrypt – para criptografar senhas
- Axios – para fazer requisições HTTP externas (API Arasaac)
- Mysql2 – driver de acesso ao banco de dados
- Path – módulo nativo do Node.js para lidar com caminhos de arquivos

## API Externa

- **API ARAASAC** - API REST para pictogramas ARASAAC e dados relacionados. Disponível para desenvolvedores.
- Disponível em: <https://beta.arasaac.org/developers/api>

## Estrutura do Projeto

```
/backEndRepository/dbConnection.js – conexão com banco
/frontEndRepository/css, /js, /img, /views, /audio – arquivos estáticos e HTML
```

## Integração com o Backend

### Rotas da API

O frontend espera que o backend forneça os seguintes endpoints:

#### Usuários
- `POST /api/usuarios´ – cria novo usuário com hash de senha
- `GET /api/usuarios´ – lista todos os usuários
- `GET /api/usuarios/:id´ – retorna dados de um usuário específico
- `PUT /api/usuarios/:id´ – atualiza campos de um usuário
- `DELETE /api/usuarios/:id´ – deleta um usuário

#### Notas
- `POST /api/exercicios´ – cadastra 1 ou mais exercícios (com validações)
- `GET /exercicios´ – lista todos os exercícios
- `GET /api/exercicios/codigo/:codigo´ – busca exercício por codigo

#### Login/Autenticação
- `POST /login´ – autenticação via e-mail e senha

#### Sessões
- `POST /api/sessoes/criar´ – cria sessão para um usuário
- `GET /api/sessoes/usuario/:sessao_ID´– retorna o usuário da sessão

#### Progresso
- `POST /api/progresso/registrar´ – registra progresso do usuário no exercício
- `GET /api/progresso/:usuario_ID/:exercicio_ID´ – progresso individual
- `GET /progresso/:usuario_ID´ – lista exercícios realizados
- `GET /api/progresso/proximo/:usuario_ID´ – retorna o próximo exercício na trilha

#### Configurações de usuário
- `GET /api/configuracoes/:usuario_ID´ – busca tema salvo
- `PUT /api/configuracoes/:usuario_ID´ – atualiza/insere tema do usuário

#### Integração com API externa
- `GET /api/pictogramas/:busca´ – busca pictogramas na API Arasaac


## Funcionalidades Implementadas

### 1. Sistema de Autenticação
- Registro de novos usuários com validação de campos e e-mail
- Armazenamento seguro de senhas com bcrypt
- Login com e-mail e senha
- Retorno do usuario_ID após login para uso no front-end
- Logs detalhados de tentativas de login com Winston

### 2. Sistema de Exercícios
- Cadastro de exercícios com alternativas, nível e código único
- Validação automática de alternativas e resposta correta
- Consulta de todos os exercícios ou por código específico
- Armazenamento estruturado no banco de dados com JSON
- Suporte à trilha de aprendizado (ordem dos exercícios)

### 3. Progresso do Usuário
- Registro automático do progresso em exercícios resolvidos
- Verificação se um exercício já foi feito
- Exibição de progresso geral por usuário
- Recomendação do próximo exercício na trilha
- Detecção automática de conclusão da trilha

### 4. Sessões de Usuário
- Criação de sessões com status ativo e horário de início
- Identificação do usuário ativo por sessão
- Estrutura pronta para controle de tempo de uso

### 5. Configurações de Interface
- Armazenamento de preferências de tema (ex: claro/escuro)
- Atualização de configurações individuais por usuário

### 6. Integração com API Arasaac
- Busca de pictogramas relacionados a palavras-chave
- Retorno dinâmico de resultados para enriquecer os exercícios

### 7. Servidor Express com Arquivos Estáticos
- Servir HTML, CSS, JS, imagens e áudios diretamente via rotas
- URLs amigáveis para páginas principais (cadastro, trilha, etc.)
- Encerramento manual do servidor em ambiente de desenvolvimento

### 8. Segurança e Logging
- Uso de Winston para logs de requisições, alertas e erros
- Separação de arquivos estáticos para evitar logs excessivos
- Validações de dados no back-end para evitar inserções inválidas
- dotenv para ocultar senhas, portas e configs sensíveis

### 9. Organização de Código
- Separação lógica entre back-end e front-end
- Estrutura modular com dbConnection.js centralizado
- Suporte para múltiplas rotas de API e páginas


## Suporte
Para dúvidas ou problemas:
1. Verifique se o backend está rodando corretamente
2. Confirme se as rotas da API estão configuradas
3. Verifique o console do navegador para erros JavaScript
4. Confirme se as dependências estão instaladas corretamente

