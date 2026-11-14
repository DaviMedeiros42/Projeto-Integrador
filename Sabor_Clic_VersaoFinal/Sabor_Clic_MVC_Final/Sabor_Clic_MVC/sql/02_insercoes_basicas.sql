-- Sabor & Clic
-- 02_insercoes_basicas.sql
-- Dados mínimos para testes

USE sabor_clic;

INSERT INTO cliente (nome, email, endereco) VALUES
('Maria Oliveira', 'maria.oliveira@email.com', 'Rua das Flores, 100'),
('João Santos', 'joao.santos@email.com', 'Avenida Brasil, 250'),
('Ana Souza', 'ana.souza@email.com', 'Rua do Mercado, 45'),
('Carlos Lima', 'carlos.lima@email.com', 'Rua das Cozinhas, 80');

INSERT INTO administrador (nome, email, nivel_permissao) VALUES
('Administrador Sabor & Clic', 'admin@saboreclic.com', 'ADMINISTRADOR');

INSERT INTO cozinheiro (nome, turno, especialidade) VALUES
('Lucas Ferreira', 'MANHÃ', 'Hambúrgueres'),
('Beatriz Costa', 'TARDE', 'Massas e pratos quentes'),
('Rafael Almeida', 'NOITE', 'Culinária geral');

INSERT INTO categoria (nome, descricao) VALUES
('Hambúrgueres', 'Lanches artesanais'),
('Massas', 'Massas e pratos com molhos'),
('Bebidas', 'Bebidas diversas'),
('Sobremesas', 'Doces e sobremesas');

INSERT INTO produto
(id_categoria, nome, descricao, preco, estoque, estoque_minimo)
VALUES
(1, 'Hambúrguer Artesanal', 'Pão, carne, queijo e molho especial', 25.90, 30, 5),
(1, 'Cheeseburger', 'Hambúrguer com queijo e molho da casa', 22.90, 20, 5),
(2, 'Macarrão ao Molho Especial', 'Massa com molho artesanal', 28.50, 15, 4),
(3, 'Refrigerante Lata', 'Refrigerante 350 ml', 6.00, 50, 10),
(3, 'Suco Natural', 'Suco natural da fruta', 8.50, 25, 5),
(4, 'Brownie', 'Brownie de chocolate', 9.90, 18, 5);

INSERT INTO bancada (nome, descricao, capacidade, valor_hora) VALUES
('Bancada 01', 'Bancada equipada para preparo geral', 4, 35.00),
('Bancada 02', 'Bancada equipada para confeitaria', 3, 40.00),
('Bancada 03', 'Bancada equipada para produção de massas', 5, 45.00);

-- Pedidos de teste
INSERT INTO pedido
(id_cliente, id_cozinheiro, status, observacao)
VALUES
(1, 1, 'ENTREGUE', 'Pedido de teste finalizado'),
(2, 2, 'EM_PREPARO', 'Sem cebola'),
(3, NULL, 'AGUARDANDO', 'Entregar no endereço cadastrado');

-- Os preços são registrados no item no momento da venda.
INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(1, 1, 2, 25.90),
(1, 4, 2, 6.00),
(2, 3, 1, 28.50),
(2, 6, 2, 9.90),
(3, 2, 2, 22.90),
(3, 5, 1, 8.50);

-- Reservas de teste
INSERT INTO reserva_bancada
(id_bancada, id_cliente, inicio, fim, status, valor_total, observacao)
VALUES
(1, 1, '2026-11-15 09:00:00', '2026-11-15 12:00:00',
 'CONCLUIDA', 105.00, 'Produção de salgados'),
(2, 2, '2026-11-16 14:00:00', '2026-11-16 17:00:00',
 'AGENDADA', 120.00, 'Produção de sobremesas'),
(3, 3, '2026-11-17 18:00:00', '2026-11-17 21:00:00',
 'AGENDADA', 135.00, 'Produção de massas');

-- Atualiza o total dos pedidos após os itens serem inseridos.
UPDATE pedido p
SET valor_total = (
    SELECT COALESCE(SUM(ip.subtotal), 0)
    FROM item_pedido ip
    WHERE ip.id_pedido = p.id_pedido
)
WHERE p.id_pedido > 0;
