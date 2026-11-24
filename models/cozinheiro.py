from .database import query
class Cozinheiro:
 @staticmethod
 def buscar_por_id(identificador): return query("SELECT * FROM cozinheiro WHERE id_cozinheiro=%s",(identificador,),one=True)
 @staticmethod
 def autenticar(email): return query("SELECT id_cozinheiro AS id,nome,email,password_hash FROM cozinheiro WHERE email=%s AND ativo=1",(email,),one=True)
