from flask import Blueprint,request,jsonify
from models.pedido import Pedido
from middleware.autenticacao import login_required
bp=Blueprint("cozinheiro",__name__,url_prefix="/api")
@bp.patch("/pedidos/<int:pedido_id>/status")
@login_required(["cozinheiro","administrador"])
def atualizar_status(pedido_id):
 status=(request.get_json(silent=True) or {}).get("status")
 permitidos={"AGUARDANDO","INICIANDO_PREPARO","EM_PREPARO","PRONTO_PARA_ENTREGA","ENTREGUE","CANCELADO"}
 if status not in permitidos:return jsonify(sucesso=False,mensagem="Status inválido."),400
 Pedido.atualizar_status(pedido_id,status)
 return jsonify(sucesso=True,mensagem="Status do pedido atualizado.")
