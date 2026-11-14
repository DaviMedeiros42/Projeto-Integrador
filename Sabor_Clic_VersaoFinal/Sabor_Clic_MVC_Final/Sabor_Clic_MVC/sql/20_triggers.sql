-- Sabor & Clic
-- 20_triggers.sql
-- Triggers para baixa automática de estoque e atualização do total do pedido

USE sabor_clic;

DROP TRIGGER IF EXISTS trg_baixa_estoque_insert;
DROP TRIGGER IF EXISTS trg_baixa_estoque_update;
DROP TRIGGER IF EXISTS trg_baixa_estoque_delete;
DROP TRIGGER IF EXISTS trg_atualiza_total_insert;
DROP TRIGGER IF EXISTS trg_atualiza_total_update;
DROP TRIGGER IF EXISTS trg_atualiza_total_delete;

DELIMITER $$

-- 1. Ao inserir um item de pedido, diminui automaticamente o estoque.
CREATE TRIGGER trg_baixa_estoque_insert
AFTER INSERT ON item_pedido
FOR EACH ROW
BEGIN
    IF (SELECT estoque FROM produto WHERE id_produto = NEW.id_produto) < NEW.quantidade THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Estoque insuficiente para o produto.';
    END IF;

    UPDATE produto
    SET estoque = estoque - NEW.quantidade
    WHERE id_produto = NEW.id_produto;
END$$

-- 2. Ao alterar a quantidade ou o produto de um item,
-- devolve a quantidade antiga e desconta a nova.
CREATE TRIGGER trg_baixa_estoque_update
AFTER UPDATE ON item_pedido
FOR EACH ROW
BEGIN
    IF NEW.id_produto = OLD.id_produto THEN

        IF (SELECT estoque FROM produto WHERE id_produto = NEW.id_produto)
             + OLD.quantidade < NEW.quantidade THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Estoque insuficiente para atualizar o item.';
        END IF;

        UPDATE produto
        SET estoque = estoque + OLD.quantidade - NEW.quantidade
        WHERE id_produto = NEW.id_produto;

    ELSE

        UPDATE produto
        SET estoque = estoque + OLD.quantidade
        WHERE id_produto = OLD.id_produto;

        IF (SELECT estoque FROM produto WHERE id_produto = NEW.id_produto) < NEW.quantidade THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Estoque insuficiente para trocar o produto do item.';
        END IF;

        UPDATE produto
        SET estoque = estoque - NEW.quantidade
        WHERE id_produto = NEW.id_produto;

    END IF;
END$$

-- 3. Se um item for excluído, a quantidade volta ao estoque.
CREATE TRIGGER trg_baixa_estoque_delete
AFTER DELETE ON item_pedido
FOR EACH ROW
BEGIN
    UPDATE produto
    SET estoque = estoque + OLD.quantidade
    WHERE id_produto = OLD.id_produto;
END$$

-- 4. Atualiza automaticamente o valor total do pedido após inserir item.
CREATE TRIGGER trg_atualiza_total_insert
AFTER INSERT ON item_pedido
FOR EACH ROW
BEGIN
    UPDATE pedido
    SET valor_total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM item_pedido
        WHERE id_pedido = NEW.id_pedido
    )
    WHERE id_pedido = NEW.id_pedido;
END$$

-- 5. Atualiza automaticamente o valor total após alterar item.
CREATE TRIGGER trg_atualiza_total_update
AFTER UPDATE ON item_pedido
FOR EACH ROW
BEGIN
    UPDATE pedido
    SET valor_total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM item_pedido
        WHERE id_pedido = NEW.id_pedido
    )
    WHERE id_pedido = NEW.id_pedido;

    IF OLD.id_pedido <> NEW.id_pedido THEN
        UPDATE pedido
        SET valor_total = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM item_pedido
            WHERE id_pedido = OLD.id_pedido
        )
        WHERE id_pedido = OLD.id_pedido;
    END IF;
END$$

-- 6. Atualiza automaticamente o valor total após excluir item.
CREATE TRIGGER trg_atualiza_total_delete
AFTER DELETE ON item_pedido
FOR EACH ROW
BEGIN
    UPDATE pedido
    SET valor_total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM item_pedido
        WHERE id_pedido = OLD.id_pedido
    )
    WHERE id_pedido = OLD.id_pedido;
END$$

DELIMITER ;

-- TESTE RECOMENDADO:
-- 1. Consulte o estoque de um produto.
-- 2. Insira um novo item em um pedido.
-- 3. Consulte novamente o estoque.
-- O estoque deverá ter diminuído automaticamente.
--
-- Exemplo:
-- SELECT id_produto, nome, estoque FROM produto WHERE id_produto = 1;
-- INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario)
-- VALUES (3, 1, 2, 25.90);
-- SELECT id_produto, nome, estoque FROM produto WHERE id_produto = 1;
