from functools import wraps
from flask import session,jsonify,redirect,url_for,request
def login_required(perfis=None):
 def decorator(view):
  @wraps(view)
  def wrapped(*args,**kwargs):
   usuario=session.get("usuario")
   if not usuario:
    if request.path.startswith("/api/"): return jsonify({"sucesso":False,"mensagem":"Faça login para continuar."}),401
    return redirect(url_for("home"))
   permitidos=[perfis] if isinstance(perfis,str) else perfis
   if permitidos and usuario.get("tipo") not in permitidos:
    if request.path.startswith("/api/"): return jsonify({"sucesso":False,"mensagem":"Você não tem permissão para esta operação."}),403
    return "Acesso não autorizado",403
   return view(*args,**kwargs)
  return wrapped
 return decorator
