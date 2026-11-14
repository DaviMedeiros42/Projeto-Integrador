
from .database import query


class Produto:

    @staticmethod
    def buscar_por_id(identificador):
        return query(
            "SELECT * FROM produto WHERE id_produto=%s",
            (identificador,),
            one=True
        )

    @staticmethod
    def cardapio():
        rows = query("""
            SELECT
                p.id_produto AS id,
                p.nome,
                p.descricao,
                p.preco,
                p.estoque,
                p.ativo,
                c.nome AS categoria
            FROM produto p
            JOIN categoria c ON c.id_categoria = p.id_categoria
            WHERE p.ativo = 1 AND p.estoque > 0
            ORDER BY c.nome, p.nome
        """)

        for row in rows:
            row["preco"] = float(row["preco"])

        return rows

    @staticmethod
    def listar_admin():
        rows = query("""
            SELECT
                p.id_produto AS id,
                p.nome,
                p.descricao,
                p.preco,
                p.estoque,
                p.ativo,
                c.nome AS categoria
            FROM produto p
            LEFT JOIN categoria c
                ON c.id_categoria = p.id_categoria
            ORDER BY p.id_produto DESC
        """)

        for row in rows:
            row["preco"] = float(row["preco"])

        return rows

    @staticmethod
    def categorias():
        return query("""
            SELECT id_categoria AS id, nome, descricao
            FROM categoria
            WHERE ativo = 1
            ORDER BY nome
        """)

    @staticmethod
    def criar(categoria, nome, descricao, preco, estoque):
        return query("""
            INSERT INTO produto
                (id_categoria, nome, descricao, preco, estoque)
            VALUES (%s, %s, %s, %s, %s)
        """, (categoria, nome, descricao, preco, estoque), commit=True)
