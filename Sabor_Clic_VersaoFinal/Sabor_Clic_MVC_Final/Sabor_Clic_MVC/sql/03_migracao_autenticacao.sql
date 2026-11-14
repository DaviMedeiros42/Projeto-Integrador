-- Execute depois de 01_modelo_fisico.sql e antes de iniciar o Flask.
USE sabor_clic;

-- Senhas sempre armazenadas como hash gerado pelo Werkzeug, nunca em texto puro.
ALTER TABLE cliente ADD COLUMN password_hash VARCHAR(255) NULL;
ALTER TABLE administrador ADD COLUMN password_hash VARCHAR(255) NULL;
ALTER TABLE cozinheiro ADD COLUMN email VARCHAR(150) NULL UNIQUE;
ALTER TABLE cozinheiro ADD COLUMN password_hash VARCHAR(255) NULL;
