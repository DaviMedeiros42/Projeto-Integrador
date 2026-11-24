from datetime import datetime
from decimal import Decimal
from models.database import get_connection
def criar_reserva(cliente_id,dados):
 bid=int(dados["id_bancada"]); inicio=datetime.fromisoformat(dados["inicio"]); fim=datetime.fromisoformat(dados["fim"])
 if fim<=inicio: raise ValueError("O horário final deve ser posterior ao inicial.")
 conn=get_connection(); cur=conn.cursor(dictionary=True)
 try:
  conn.start_transaction(); cur.execute("SELECT valor_hora FROM bancada WHERE id_bancada=%s AND ativa=1 FOR UPDATE",(bid,)); bancada=cur.fetchone()
  if not bancada: raise ValueError("Bancada não encontrada.")
  cur.execute("SELECT id_reserva FROM reserva_bancada WHERE id_bancada=%s AND status<>'CANCELADA' AND inicio<%s AND fim>%s FOR UPDATE",(bid,fim,inicio))
  if cur.fetchone(): raise ValueError("Esta bancada já está reservada nesse período.")
  horas=Decimal(str((fim-inicio).total_seconds()))/Decimal("3600"); total=(horas*Decimal(str(bancada["valor_hora"]))).quantize(Decimal("0.01"))
  cur.execute("INSERT INTO reserva_bancada (id_bancada,id_cliente,inicio,fim,valor_total,observacao) VALUES (%s,%s,%s,%s,%s,%s)",(bid,cliente_id,inicio,fim,total,(dados.get("observacao") or "")[:500]))
  rid=cur.lastrowid; conn.commit(); return rid,float(total)
 except Exception: conn.rollback(); raise
 finally: cur.close(); conn.close()
