
from flask import Blueprint, request, jsonify
from decimal import Decimal, InvalidOperation

from models.produto import Produto
from models.administrador import Administrador
from middleware.autenticacao import login_required
from mysql.connector import Error

bp = Blueprint("administrador", __name__, url_prefix="/api")


@bp.post("/produtos")
@login_required("administrador")
def criar_produto():
    d = request.get_json(silent=True) or {}

    try:
        nome = (d["nome"] or "").strip()
        categoria = int(d["id_categoria"])
        preco = Decimal(str(d["preco"]))
        estoque = int(d.get("estoque", 0))
        descricao = (d.get("descricao") or "").strip()

        if (
            not nome
            or preco < 0
            or estoque < 0
            or len(nome) > 120
            or len(descricao) > 500
        ):
            raise ValueError()

        identificador = Produto.criar(
            categoria, nome, descricao, preco, estoque
        )

        return jsonify(
            sucesso=True,
            id=identificador,
            mensagem="Produto adicionado ao catálogo."
        ), 201

    except (KeyError, ValueError, InvalidOperation):
        return jsonify(
            sucesso=False,
            mensagem="Verifique os dados informados."
        ), 400

    except Error:
        return jsonify(
            sucesso=False,
            mensagem="Não foi possível concluir a operação."
        ), 503


@bp.get("/produtos")
@login_required("administrador")
def listar_produtos():
    try:
        return jsonify(Produto.listar_admin())

    except Error:
        return jsonify(
            sucesso=False,
            mensagem="Não foi possível carregar os produtos."
        ), 503


@bp.get("/gestao/resumo")
@login_required(["administrador", "cozinheiro"])
def resumo():
    return jsonify(Administrador.resumo())
