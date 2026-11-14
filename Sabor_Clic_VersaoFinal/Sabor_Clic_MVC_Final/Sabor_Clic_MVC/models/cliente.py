from .database import query
from werkzeug.security import generate_password_hash
class Cliente:
 @staticmethod
 def buscar_por_id(identificador): return query("SELECT * FROM cliente WHERE id_cliente=%s",(identificador,),one=True)
 @staticmethod
 def criar(nome,email,endereco,senha):
  return query("INSERT INTO cliente (nome,email,endereco,password_hash) VALUES (%s,%s,%s,%s)",(nome,email,endereco,generate_password_hash(senha)),commit=True)
 @staticmethod
 def autenticar(email):
  return query("SELECT id_cliente AS id,nome,email,password_hash FROM cliente WHERE email=%s AND ativo=1",(email,),one=True)

 @staticmethod
 def atualizar(identificador, nome, email, endereco):
        query("UPDATE cliente SET nome=%s, email=%s, endereco=%s WHERE id_cliente=%s",
  (nome, email, endereco, identificador), commit=True)
