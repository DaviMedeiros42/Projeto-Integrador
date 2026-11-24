from .database import query
class Pedido:
 @staticmethod
 def buscar_por_id(identificador): return query("SELECT * FROM pedido WHERE id_pedido=%s",(identificador,),one=True)
 @staticmethod
 def listar(usuario):
  sql="SELECT p.id_pedido,p.data_pedido,p.status,p.valor_total,p.observacao,c.nome cliente FROM pedido p JOIN cliente c ON c.id_cliente=p.id_cliente";params=()
  if usuario["tipo"]=="cliente":sql+=" WHERE p.id_cliente=%s";params=(usuario["id"],)
  rows=query(sql+" ORDER BY p.data_pedido DESC",params)
  for row in rows:row["valor_total"]=float(row["valor_total"]);row["data_pedido"]=row["data_pedido"].isoformat(sep=" ")
  return rows
 @staticmethod
 def atualizar_status(pedido_id,status):return query("UPDATE pedido SET status=%s WHERE id_pedido=%s",(status,pedido_id),commit=True)
