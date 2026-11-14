PERMISSOES={"cliente":{"pedidos.criar","pedidos.proprios","reservas.criar","reservas.proprias"},"cozinheiro":{"pedidos.listar","pedidos.status","gestao.resumo"},"administrador":{"*"}}
def permitido(perfil,acao):
 return "*" in PERMISSOES.get(perfil,set()) or acao in PERMISSOES.get(perfil,set())
