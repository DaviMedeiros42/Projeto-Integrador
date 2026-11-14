-- Sabor & Clic
-- 01_modelo_fisico.sql
-- Modelo físico relacional - MySQL 8+
-- Projeto: gestão de pedidos, cardápio, estoque e locação de bancadas

CREATE DATABASE IF NOT EXISTS sabor_clic
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sabor_clic;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS item_pedido;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS reserva_bancada;
DROP TABLE IF EXISTS bancada;
DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS cozinheiro;
DROP TABLE IF EXISTS administrador;
DROP TABLE IF EXISTS cliente;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    endereco VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE administrador (
    id_administrador INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    nivel_permissao VARCHAR(30) NOT NULL DEFAULT 'ADMINISTRADOR',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cozinheiro (
    id_cozinheiro INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    turno VARCHAR(30) NOT NULL,
    especialidade VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nome VARCHAR(120) NOT NULL,
    descricao VARCHAR(500),
    preco DECIMAL(10,2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 5,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_produto_preco CHECK (preco >= 0),
    CONSTRAINT chk_produto_estoque CHECK (estoque >= 0),
    CONSTRAINT chk_produto_estoque_minimo CHECK (estoque_minimo >= 0),
    CONSTRAINT fk_produto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_cozinheiro INT NULL,
    data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO',
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    observacao VARCHAR(500),
    CONSTRAINT chk_pedido_status CHECK (
        status IN (
            'AGUARDANDO',
            'INICIANDO_PREPARO',
            'EM_PREPARO',
            'PRONTO_PARA_ENTREGA',
            'ENTREGUE',
            'CANCELADO'
        )
    ),
    CONSTRAINT chk_pedido_valor CHECK (valor_total >= 0),
    CONSTRAINT fk_pedido_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_cozinheiro
        FOREIGN KEY (id_cozinheiro)
        REFERENCES cozinheiro(id_cozinheiro)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE item_pedido (
    id_item_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS
        (quantidade * preco_unitario) STORED,
    CONSTRAINT chk_item_quantidade CHECK (quantidade > 0),
    CONSTRAINT chk_item_preco CHECK (preco_unitario >= 0),
    CONSTRAINT uq_item_pedido_produto UNIQUE (id_pedido, id_produto),
    CONSTRAINT fk_item_pedido_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedido(id_pedido)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_item_pedido_produto
        FOREIGN KEY (id_produto)
        REFERENCES produto(id_produto)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE bancada (
    id_bancada INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    capacidade INT NOT NULL,
    valor_hora DECIMAL(10,2) NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_bancada_capacidade CHECK (capacidade > 0),
    CONSTRAINT chk_bancada_valor_hora CHECK (valor_hora >= 0)
);

CREATE TABLE reserva_bancada (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_bancada INT NOT NULL,
    id_cliente INT NOT NULL,
    inicio DATETIME NOT NULL,
    fim DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AGENDADA',
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    observacao VARCHAR(500),
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reserva_periodo CHECK (fim > inicio),
    CONSTRAINT chk_reserva_status CHECK (
        status IN ('AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA')
    ),
    CONSTRAINT chk_reserva_valor CHECK (valor_total >= 0),
    CONSTRAINT fk_reserva_bancada
        FOREIGN KEY (id_bancada)
        REFERENCES bancada(id_bancada)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_reserva_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_produto_categoria ON produto(id_categoria);
CREATE INDEX idx_pedido_cliente ON pedido(id_cliente);
CREATE INDEX idx_pedido_data ON pedido(data_pedido);
CREATE INDEX idx_pedido_status ON pedido(status);
CREATE INDEX idx_item_pedido_produto ON item_pedido(id_produto);
CREATE INDEX idx_reserva_bancada_periodo ON reserva_bancada(id_bancada, inicio, fim);
CREATE INDEX idx_reserva_cliente ON reserva_bancada(id_cliente);
