from flask_wtf.csrf import CSRFProtect,generate_csrf
from flask import request,jsonify,current_app,render_template
csrf=CSRFProtect()
def configurar_seguranca(app):
 csrf.init_app(app)
 @app.context_processor
 def csrf_context(): return {"csrf_token":generate_csrf}
 @app.after_request
 def headers(response):
  response.headers.setdefault("X-Content-Type-Options","nosniff")
  response.headers.setdefault("X-Frame-Options","SAMEORIGIN")
  response.headers.setdefault("Referrer-Policy","strict-origin-when-cross-origin")
  return response
 @app.errorhandler(400)
 def bad_request(error):
  if request.path.startswith("/api/"): return jsonify({"sucesso":False,"mensagem":"Verifique os dados informados ou o token de segurança."}),400
  return "Requisição inválida. Atualize a página e tente novamente.",400
 @app.errorhandler(500)
 def internal_error(error):
  current_app.logger.exception("Erro interno")
  if request.path.startswith("/api/"): return jsonify({"sucesso":False,"mensagem":"Não foi possível concluir a operação."}),500
  return render_template("index.html"),500
