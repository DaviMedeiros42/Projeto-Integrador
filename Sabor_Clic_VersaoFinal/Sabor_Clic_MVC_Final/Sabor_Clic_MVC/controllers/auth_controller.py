from flask import Blueprint,request,jsonify,session
from werkzeug.security import generate_password_hash,check_password_hash
from mysql.connector import Error
from models.cliente import Cliente
from models.administrador import Administrador
from models.cozinheiro import Cozinheiro
bp=Blueprint("auth",__name__,url_prefix="/api")
@bp.post("/cadastro")
def cadastro():
 d=request.get_json(silent=True) or {};nome=(d.get("nome") or "").strip();email=(d.get("email") or "").strip().lower();senha=d.get("senha") or "";endereco=(d.get("endereco") or "").strip()
 if not nome or not email or len(senha)<8 or not endereco:return jsonify(sucesso=False,mensagem="Verifique os dados informados. A senha deve ter pelo menos 8 caracteres."),400
 try:return jsonify(sucesso=True,id=Cliente.criar(nome,email,endereco,senha),mensagem="Conta criada com sucesso."),201
 except Error as e:
  if getattr(e,"errno",None)==1062:return jsonify(sucesso=False,mensagem="Este e-mail já está cadastrado."),409
  raise
@bp.post("/login")
def login():
 d=request.get_json(silent=True) or {};email=(d.get("email") or "").strip().lower();senha=d.get("senha") or "";tipo=d.get("tipo","cliente")
 modelos={"cliente":Cliente,"administrador":Administrador,"cozinheiro":Cozinheiro}
 if tipo not in modelos:return jsonify(sucesso=False,mensagem="Tipo de usuário inválido."),400
 user=modelos[tipo].autenticar(email)
 if not user or not user.get("password_hash") or not check_password_hash(user["password_hash"],senha):return jsonify(sucesso=False,mensagem="E-mail ou senha incorretos."),401
 session.clear();session["usuario"]={"id":user["id"],"nome":user["nome"],"email":user["email"],"tipo":tipo};session.permanent=True
 return jsonify(sucesso=True,usuario=session["usuario"],mensagem="Login efetuado com sucesso.")
@bp.post("/logout")
def logout():session.clear();return jsonify(sucesso=True,mensagem="Logout realizado com sucesso.")
@bp.get("/me")
def me():return jsonify(usuario=session.get("usuario"))
