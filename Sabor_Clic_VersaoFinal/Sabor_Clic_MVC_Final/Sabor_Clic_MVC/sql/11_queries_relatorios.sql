-- Sabor & Clic
-- 11_queries_relatorios.sql
-- Queries de relatórios: vendas, estoque e ocupação

USE sabor_clic;

-- 1. Lista completa de produtos e estoque
SELECT
    p.id_produto,
    p.nome AS produto,
    c.nome AS categoria,
    p.preco,
    p.estoque,
    p.estoque_minimo,
    CASE
        WHEN p.estoque = 0 THEN 'SEM ESTOQUE'
        WHEN p.estoque <= p.estoque_minimo THEN 'ESTOQUE BAIXO'
        ELSE 'NORMAL'
    END AS situacao
FROM produto p
JOIN categoria c ON c.id_categoria = p.id_categoria
ORDER BY p.estoque ASC, p.nome;

-- 2. Produtos com estoque baixo
SELECT
    p.id_produto,
    p.nome,
    p.estoque,
    p.estoque_minimo
FROM produto p
WHERE p.estoque <= p.estoque_minimo
ORDER BY p.estoque ASC;

-- 3. Faturamento por pedido
SELECT
    pe.id_pedido,
    c.nome AS cliente,
    pe.data_pedido,
    pe.status,
    pe.valor_total
FROM pedido pe
JOIN cliente c ON c.id_cliente = pe.id_cliente
ORDER BY pe.data_pedido DESC;

-- 4. Faturamento total dos pedidos não cancelados
SELECT
    COALESCE(SUM(valor_total), 0) AS faturamento_total
FROM pedido
WHERE status <> 'CANCELADO';

-- 5. Produtos mais vendidos
SELECT
    p.id_produto,
    p.nome AS produto,
    SUM(ip.quantidade) AS quantidade_vendida,
    SUM(ip.subtotal) AS faturamento_produto
FROM item_pedido ip
JOIN produto p ON p.id_produto = ip.id_produto
JOIN pedido pe ON pe.id_pedido = ip.id_pedido
WHERE pe.status <> 'CANCELADO'
GROUP BY p.id_produto, p.nome
ORDER BY quantidade_vendida DESC, faturamento_produto DESC;

-- 6. Total de pedidos por cliente
SELECT
    c.id_cliente,
    c.nome,
    COUNT(pe.id_pedido) AS quantidade_pedidos,
    COALESCE(SUM(
        CASE WHEN pe.status <> 'CANCELADO'
             THEN pe.valor_total ELSE 0 END
    ), 0) AS total_gasto
FROM cliente c
LEFT JOIN pedido pe ON pe.id_cliente = c.id_cliente
GROUP BY c.id_cliente, c.nome
ORDER BY total_gasto DESC;

-- 7. Pedidos agrupados por status
SELECT
    status,
    COUNT(*) AS quantidade
FROM pedido
GROUP BY status
ORDER BY quantidade DESC;

-- 8. Faturamento por categoria
SELECT
    ca.nome AS categoria,
    SUM(ip.quantidade) AS itens_vendidos,
    SUM(ip.subtotal) AS faturamento
FROM item_pedido ip
JOIN produto p ON p.id_produto = ip.id_produto
JOIN categoria ca ON ca.id_categoria = p.id_categoria
JOIN pedido pe ON pe.id_pedido = ip.id_pedido
WHERE pe.status <> 'CANCELADO'
GROUP BY ca.id_categoria, ca.nome
ORDER BY faturamento DESC;

-- 9. Relatório de ocupação das bancadas
SELECT
    b.nome AS bancada,
    COUNT(r.id_reserva) AS quantidade_reservas,
    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, r.inicio, r.fim)) / 60, 0)
        AS horas_reservadas
FROM bancada b
LEFT JOIN reserva_bancada r
    ON r.id_bancada = b.id_bancada
    AND r.status <> 'CANCELADA'
GROUP BY b.id_bancada, b.nome
ORDER BY horas_reservadas DESC;

-- 10. Reservas futuras
SELECT
    r.id_reserva,
    b.nome AS bancada,
    c.nome AS cliente,
    r.inicio,
    r.fim,
    r.status,
    r.valor_total
FROM reserva_bancada r
JOIN bancada b ON b.id_bancada = r.id_bancada
JOIN cliente c ON c.id_cliente = r.id_cliente
WHERE r.inicio >= NOW()
  AND r.status <> 'CANCELADA'
ORDER BY r.inicio;

-- 11. Média do valor dos pedidos
SELECT
    ROUND(AVG(valor_total), 2) AS ticket_medio
FROM pedido
WHERE status <> 'CANCELADO';

-- 12. Quantidade vendida por dia
SELECT
    DATE(pe.data_pedido) AS dia,
    COUNT(DISTINCT pe.id_pedido) AS pedidos,
    SUM(ip.quantidade) AS itens_vendidos,
    SUM(ip.subtotal) AS faturamento
FROM pedido pe
JOIN item_pedido ip ON ip.id_pedido = pe.id_pedido
WHERE pe.status <> 'CANCELADO'
GROUP BY DATE(pe.data_pedido)
ORDER BY dia;
