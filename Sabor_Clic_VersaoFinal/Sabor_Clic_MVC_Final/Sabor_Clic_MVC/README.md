# Sabor & Clic — versão MVC obrigatória (Flask + MySQL)

Esta versão reorganiza o backend em camadas reais. `app.py` apenas cria a aplicação, registra blueprints e configura rotas de apresentação; SQL e conexão ficam em `models/`; requisições HTTP ficam em `controllers/`; regras transacionais ficam em `services/`; autenticação, autorização e CSRF ficam em `middleware/`.

## Estrutura

- `models/database.py`: pool MySQL e execução de consultas parametrizadas.
- `models/{administrador,cliente,cozinheiro,produto,pedido,reserva}.py`: modelos do domínio.
- `controllers/auth_controller.py`: cadastro, login, logout e sessão.
- `controllers/cliente_controller.py`: cardápio, pedidos, bancadas e reservas.
- `controllers/cozinheiro_controller.py`: atualização de status de pedidos.
- `controllers/administrador_controller.py`: catálogo e indicadores.
- `middleware/autenticacao.py`: bloqueia sessões ausentes e perfis não autorizados.
- `middleware/autorizacao.py`: matriz explícita de permissões.
- `middleware/seguranca.py`: Flask-WTF CSRF e cabeçalhos de segurança.
- `services/pedido_service.py`: pedido e itens numa transação, com bloqueio de estoque.
- `services/reserva_service.py`: cálculo e prevenção de conflito de reserva numa transação.
- `templates/`: HTML renderizado pelo Flask; `static/`: CSS, JavaScript e imagens.
- `sql/`: modelo físico, dados iniciais, triggers e migração de autenticação.

## Perfis e autorização

| Perfil | Acesso principal |
|---|---|
| Cliente | próprio histórico, criação de pedidos e reservas |
| Cozinheiro | consulta de pedidos, atualização de status e resumo operacional |
| Administrador | catálogo, gestão, pedidos, status e indicadores |

A proteção é aplicada no backend. Ocultar um botão ou uma página no navegador não substitui a autorização das rotas. As páginas de cada área também verificam a sessão e o perfil.

## Feedback de operações

As APIs retornam `mensagem` em JSON e um status HTTP adequado. O JavaScript integrado apresenta a mensagem em notificação visual; não se usa `flash()` junto com JSON, evitando duplicidade. Para páginas renderizadas, o Flask disponibiliza `flash()`/`get_flashed_messages()` e os templates exibem as mensagens flash.

## Segurança

- Senhas armazenadas com `generate_password_hash` e verificadas com `check_password_hash`.
- Sessão assinada pelo Flask; cookie `HttpOnly`, `SameSite=Lax` e `Secure` configurável.
- CSRF habilitado com Flask-WTF. As páginas incluem token meta e `static/js/integracao.js` envia `X-CSRFToken` nas requisições mutáveis.
- SQL parametrizado; identificadores dinâmicos são limitados a tabelas/colunas internas definidas no servidor.
- Transações com `rollback` em falhas para pedidos e reservas.
- Erros internos não expõem detalhes do banco ao cliente.

## Instalação (Windows / VS Code)

1. Instale Python 3.10+ e MySQL 8+.
2. Abra a pasta `Sabor_Clic_MVC`.
3. Crie ambiente virtual e instale dependências:

   ```powershell
   py -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. Execute no MySQL Workbench, nesta ordem, em banco novo:
   - `sql/01_modelo_fisico.sql`
   - `sql/02_insercoes_basicas.sql`
   - `sql/20_triggers.sql`
   - `sql/03_migracao_autenticacao.sql`

   **Atenção:** `01_modelo_fisico.sql` apaga e recria as tabelas. Não rode em banco com dados que deseja preservar. `03_migracao_autenticacao.sql` também é uma migração inicial e não deve ser repetida.
5. Copie `.env.example` para `.env`, configure usuário/senha do MySQL e gere uma `FLASK_SECRET_KEY` aleatória longa. Em produção, defina `COOKIE_SECURE=1` e use HTTPS.
6. Crie o administrador inicial:

   ```powershell
   python create_admin.py
   ```

7. Inicie:

   ```powershell
   python app.py
   ```

8. Acesse `http://127.0.0.1:5000`.

## Teste da API com CSRF

No navegador, as páginas Flask já incluem o token. Para chamadas externas, primeiro obtenha o token e o cookie de sessão em `GET /api/csrf`, e envie o cookie recebido e o valor `csrf_token` no cabeçalho `X-CSRFToken` nas requisições POST/PATCH/DELETE. Exemplo de fluxo no navegador:

```javascript
const csrf = document.querySelector('meta[name="csrf-token"]').content;
fetch('/api/pedidos', {
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'X-CSRFToken': csrf},
  body: JSON.stringify({itens: [{id: 1, quantidade: 1}]})
});
```

## Rotas principais

- `GET /api/health`, `GET /api/csrf`
- `POST /api/cadastro`, `POST /api/login`, `POST /api/logout`, `GET /api/me`
- `GET /api/cardapio`, `GET /api/categorias`
- `POST /api/pedidos`, `GET /api/pedidos`, `PATCH /api/pedidos/<id>/status`
- `GET /api/bancadas`, `POST /api/reservas`, `GET /api/reservas`
- `POST /api/produtos`, `GET /api/gestao/resumo`

## Escopo validado e limitações

O código foi organizado e passou por verificação estática de sintaxe. A conexão real, as transações, os gatilhos e os fluxos ponta a ponta precisam ser executados no ambiente MySQL configurado pelo desenvolvedor; este pacote não contém credenciais nem um servidor MySQL, portanto não afirma que esses testes de integração foram executados. As páginas visuais originais foram preservadas. Algumas telas de gestão continuam dependendo de implementação adicional de interface/rotas além das operações listadas acima. O checkout registra o pedido, mas não processa pagamento.
