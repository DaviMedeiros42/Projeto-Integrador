from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def test_mvc_layers_exist():
    for path in ["models/database.py","controllers/auth_controller.py","controllers/cliente_controller.py","middleware/autenticacao.py","middleware/seguranca.py","services/pedido_service.py","services/reserva_service.py"]:
        assert (ROOT/path).is_file()
def test_required_dependencies():
    req=(ROOT/"requirements.txt").read_text()
    assert "Flask-WTF" in req and "mysql-connector-python" in req
