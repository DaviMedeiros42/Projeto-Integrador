import os
from flask import Flask,render_template,abort,request,jsonify,flash
from config import Config
from middleware.seguranca import configurar_seguranca
from controllers.auth_controller import bp as auth_bp
from controllers.cliente_controller import bp as cliente_bp
from controllers.cozinheiro_controller import bp as cozinheiro_bp
from controllers.administrador_controller import bp as administrador_bp
from models.database import query
from mysql.connector import Error

def create_app(test_config=None):
 app=Flask(__name__)
 app.config.from_object(Config)
 if test_config:app.config.update(test_config)
 if not app.config.get("SECRET_KEY"):raise RuntimeError("Defina FLASK_SECRET_KEY no arquivo .env.")
 configurar_seguranca(app)
 app.register_blueprint(auth_bp);app.register_blueprint(cliente_bp);app.register_blueprint(cozinheiro_bp);app.register_blueprint(administrador_bp)
 @app.get("/")
 def home():return render_template("index.html")
 @app.get("/<path:page>")
 def pages(page):
  allowed={"index.html","cliente/index.html","cliente/carrinho.html","cliente/finalizar.html","cliente/pedidos.html","cliente/alugueis.html","cliente/perfil.html","empreendedor/index.html","empreendedor/produtos.html","empreendedor/pedidos.html","empreendedor/clientes.html","empreendedor/espacos.html","empreendedor/relatorios.html","empreendedor/avaliacoes.html","empreendedor/configuracoes.html","cozinheiro/index.html","administrador/index.html","administrador/catalogo.html","administrador/configuracoes.html","administrador/cozinhas.html","administrador/locacoes.html","administrador/relatorios.html","administrador/usuarios.html"}
  if page not in allowed:abort(404)
  # As telas internas não podem ser abertas apenas digitando a URL.
  from flask import session,redirect,url_for
  perfil=session.get("usuario",{}).get("tipo")
  prefix=page.split("/",1)[0]
  permitido={"cliente":"cliente","cozinheiro":"cozinheiro","administrador":"administrador","empreendedor":"administrador"}
  if prefix in permitido and perfil!=permitido[prefix] and not (prefix=="empreendedor" and perfil=="administrador"):
   flash("Entre com um perfil autorizado para acessar esta página.","warning")
   return redirect(url_for("home"))
  return render_template(page)
 @app.get("/api/csrf")
 def csrf_token():
  from flask_wtf.csrf import generate_csrf
  return jsonify(csrf_token=generate_csrf())
 @app.get("/api/health")
 def health():
  try:return jsonify(ok=True,banco=query("SELECT DATABASE() AS banco",one=True)["banco"])
  except Error:return jsonify(ok=False,mensagem="Não foi possível conectar ao MySQL. Confira o .env e o banco."),503
 @app.errorhandler(500)
 def internal_error(error):
  app.logger.exception("Falha não tratada")
  if request.path.startswith("/api/"):return jsonify(sucesso=False,mensagem="Não foi possível concluir a operação."),500
  return "Ocorreu um erro interno. Tente novamente.",500
 return app

app=create_app()
if __name__=="__main__":
 app.run(debug=os.getenv("FLASK_DEBUG","0")=="1")
