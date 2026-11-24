from .database import query
class Reserva:
 @staticmethod
 def buscar_por_id(identificador): return query("SELECT * FROM reserva_bancada WHERE id_reserva=%s",(identificador,),one=True)
 @staticmethod
 def listar(usuario):
  sql="SELECT r.id_reserva,r.inicio,r.fim,r.status,r.valor_total,b.nome bancada,c.nome cliente FROM reserva_bancada r JOIN bancada b ON b.id_bancada=r.id_bancada JOIN cliente c ON c.id_cliente=r.id_cliente";params=()
  if usuario["tipo"]=="cliente":sql+=" WHERE r.id_cliente=%s";params=(usuario["id"],)
  rows=query(sql+" ORDER BY r.inicio DESC",params)
  for row in rows:row["inicio"]=row["inicio"].isoformat(sep=" ");row["fim"]=row["fim"].isoformat(sep=" ");row["valor_total"]=float(row["valor_total"])
  return rows
 @staticmethod
 def bancadas():
  rows=query("SELECT id_bancada AS id,nome,descricao,capacidade,valor_hora FROM bancada WHERE ativa=1 ORDER BY nome")
  for row in rows:row["valor_hora"]=float(row["valor_hora"])
  return rows
