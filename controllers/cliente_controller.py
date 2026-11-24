from flask import Blueprint,request,jsonify,session
from models.produto import Produto
from models.pedido import Pedido
from models.reserva import Reserva
from models.cliente import Cliente
from middleware.autenticacao import login_required
from services.pedido_service import criar_pedido
from services.reserva_service import criar_reserva
from mysql.connector import Error
bp=Blueprint("cliente",__name__,url_prefix="/api")
@bp.get("/cardapio")
def cardapio():return jsonify(Produto.cardapio())
@bp.get("/categorias")
def categorias():return jsonify(Produto.categorias())
@bp.post("/pedidos")
@login_required("cliente")
def pedido():
 d=request.get_json(silent=True) or {}
 try:return jsonify(sucesso=True,id_pedido=criar_pedido(session["usuario"]["id"],d.get("itens") or [],(d.get("observacao") or "").strip()),mensagem="Pedido registrado com sucesso."),201
 except ValueError as e:return jsonify(sucesso=False,mensagem=str(e)),400
 except Error:return jsonify(sucesso=False,mensagem="Não foi possível concluir a operação."),503
@bp.get("/pedidos")
@login_required()
def pedidos():return jsonify(Pedido.listar(session["usuario"]))
@bp.get("/bancadas")
def bancadas():return jsonify(Reserva.bancadas())
@bp.post("/reservas")
@login_required("cliente")
def reserva():
 try:
  rid,total=criar_reserva(session["usuario"]["id"],request.get_json(silent=True) or {})
  return jsonify(sucesso=True,id_reserva=rid,valor_total=total,mensagem="Reserva realizada com sucesso."),201
 except (ValueError,KeyError,TypeError):return jsonify(sucesso=False,mensagem="Verifique os dados informados e a disponibilidade da bancada."),400
 except Error:return jsonify(sucesso=False,mensagem="Não foi possível concluir a operação."),503
@bp.get("/reservas")
@login_required()
def reservas():return jsonify(Reserva.listar(session["usuario"]))

@bp.get("/perfil")
@login_required("cliente")
def perfil():
    cliente = Cliente.buscar_por_id(session["usuario"]["id"])
    if not cliente:
        return jsonify(sucesso=False, mensagem="Cliente não encontrado."), 404
    return jsonify(perfil={"nome": cliente.get("nome", ""), "email": cliente.get("email", ""),
                           "endereco": cliente.get("endereco", ""),
                           "criado_em": str(cliente.get("criado_em", ""))[:10]})

@bp.put("/perfil")
@login_required("cliente")
def atualizar_perfil():
    dados = request.get_json(silent=True) or {}
    nome = (dados.get("nome") or "").strip()
    email = (dados.get("email") or "").strip().lower()
    endereco = (dados.get("endereco") or "").strip()
    if not nome or not email or not endereco:
        return jsonify(sucesso=False, mensagem="Preencha nome, e-mail e endereço."), 400
    try:
        Cliente.atualizar(session["usuario"]["id"], nome, email, endereco)
        session["usuario"]["nome"] = nome
        session["usuario"]["email"] = email
        session.modified = True
        return jsonify(sucesso=True, mensagem="Perfil atualizado com sucesso.")
    except Error as erro:
        if getattr(erro, "errno", None) == 1062:
            return jsonify(sucesso=False, mensagem="Este e-mail já está sendo usado por outra conta."), 409
        raise
