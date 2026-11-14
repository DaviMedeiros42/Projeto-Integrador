from models.database import get_connection
def criar_pedido(cliente_id,itens,observacao=""):
 if not isinstance(itens,list) or not itens: raise ValueError("O carrinho está vazio.")
 conn=get_connection(); cur=conn.cursor(dictionary=True)
 try:
  conn.start_transaction()
  cur.execute("INSERT INTO pedido (id_cliente,observacao) VALUES (%s,%s)",(cliente_id,observacao or None)); pedido_id=cur.lastrowid
  vistos=set()
  for item in itens:
   try: pid,qtd=int(item.get("id",0)),int(item.get("quantidade",0))
   except (TypeError,ValueError): raise ValueError("Item ou quantidade inválida.")
   if pid<1 or qtd<1 or qtd>50 or pid in vistos: raise ValueError("Item ou quantidade inválida.")
   vistos.add(pid); cur.execute("SELECT preco,estoque,ativo FROM produto WHERE id_produto=%s FOR UPDATE",(pid,)); produto=cur.fetchone()
   if not produto or not produto["ativo"]: raise ValueError("Um dos produtos não está disponível.")
   if produto["estoque"]<qtd: raise ValueError("Estoque insuficiente para um dos produtos.")
   cur.execute("INSERT INTO item_pedido (id_pedido,id_produto,quantidade,preco_unitario) VALUES (%s,%s,%s,%s)",(pedido_id,pid,qtd,produto["preco"]))
  conn.commit(); return pedido_id
 except Exception: conn.rollback(); raise
 finally: cur.close(); conn.close()
