from .database import query
class Administrador:
 @staticmethod
 def buscar_por_id(identificador): return query("SELECT * FROM administrador WHERE id_administrador=%s",(identificador,),one=True)
 @staticmethod
 def autenticar(email): return query("SELECT id_administrador AS id,nome,email,password_hash FROM administrador WHERE email=%s AND ativo=1",(email,),one=True)

 @staticmethod
 def resumo():
  from .database import query
  return {"pedidos":query("SELECT COUNT(*) total FROM pedido",one=True)["total"],"produtos":query("SELECT COUNT(*) total FROM produto WHERE ativo=1",one=True)["total"],"clientes":query("SELECT COUNT(*) total FROM cliente WHERE ativo=1",one=True)["total"],"reservas":query("SELECT COUNT(*) total FROM reserva_bancada WHERE status='AGENDADA'",one=True)["total"]}
