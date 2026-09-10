
from database import get_db_connection

class ProdutoModel:
    @staticmethod
    def listar_todos(restaurante_id):
        conn = get_db_connection()
        produtos = conn.execute(
            'SELECT id, nome, descricao, preco, categoria, disponivel FROM produtos WHERE restaurante_id = ? AND disponivel = 1',
            (restaurante_id,)
        ).fetchall()
        conn.close()

        # Serialização manual para dicionários (JSON-ready)
        return [
            {
                'id': prod['id'],
                'nome': prod['nome'],
                'descricao': prod['descricao'],
                'preco': float(prod['preco']),
                'categoria': prod['categoria'],
                'disponivel': bool(prod['disponivel'])
            }
            for prod in produtos
        ]
