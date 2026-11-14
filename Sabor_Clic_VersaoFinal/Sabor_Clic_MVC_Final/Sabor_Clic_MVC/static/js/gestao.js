
const apiGestao = '/api';

async function apiJson(url, options = {}) {
    const token = document.querySelector(
        'meta[name="csrf-token"]'
    )?.content || '';

    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': token,
        ...(options.headers || {})
    };

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin'
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.mensagem ||
            data.message ||
            'Falha na operação.'
        );
    }

    return data;
}


// Carregar produtos cadastrados
async function carregarProdutos() {
    const lista = document.querySelector('#lista-produtos');

    if (!lista) return;

    try {
        const produtos = await apiJson(`${apiGestao}/produtos`);

        lista.replaceChildren();

        if (!Array.isArray(produtos) || produtos.length === 0) {
            const linha = document.createElement('tr');
            const celula = document.createElement('td');

            celula.colSpan = 6;
            celula.textContent = 'Nenhum produto cadastrado.';

            linha.appendChild(celula);
            lista.appendChild(linha);
            return;
        }

        produtos.forEach(produto => {
            const linha = document.createElement('tr');

            const valores = [
                produto.nome,
                produto.categoria || 'Sem categoria',
                Number(produto.preco).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                produto.estoque,
                Number(produto.ativo) === 1 ? 'Ativo' : 'Inativo',
                Number(produto.estoque) > 0 ? 'Disponível' : 'Sem estoque'
            ];

            valores.forEach(valor => {
                const celula = document.createElement('td');
                celula.textContent = valor;
                linha.appendChild(celula);
            });

            lista.appendChild(linha);
        });

    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        lista.innerHTML = '';

        const linha = document.createElement('tr');
        const celula = document.createElement('td');

        celula.colSpan = 6;
        celula.textContent = erro.message;

        linha.appendChild(celula);
        lista.appendChild(linha);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('#produto-form');

    if (!form) return;

    const select = form.querySelector('#product-category');
    const botao = document.querySelector('#salvar-produto');
    const feedback = document.querySelector('#produto-feedback');

    // Carregar categorias
    try {
        const categorias = await apiJson(`${apiGestao}/categorias`);

        select.replaceChildren(new Option('Selecione', ''));

        categorias.forEach(categoria => {
            select.add(
                new Option(categoria.nome, categoria.id)
            );
        });

    } catch (erro) {
        if (feedback) feedback.textContent = erro.message;
    }

    // Carregar produtos existentes
    await carregarProdutos();

    // Cadastrar produto
    botao?.addEventListener('click', async () => {
        const nome = document.querySelector('#product-name').value.trim();
        const id_categoria = Number(select.value);

        const preco = document.querySelector('#product-price')
            .value.replace(',', '.');

        const estoque =
            document.querySelector('#product-stock').value === 'Disponível'
                ? 10
                : 0;

        const descricao = document.querySelector(
            '#product-description'
        ).value.trim();

        if (!nome || !id_categoria || !preco || Number(preco) <= 0) {
            feedback.textContent =
                'Preencha corretamente os campos obrigatórios.';
            return;
        }

        botao.disabled = true;
        feedback.textContent = 'Cadastrando produto...';

        try {
            await apiJson(`${apiGestao}/produtos`, {
                method: 'POST',
                body: JSON.stringify({
                    nome,
                    id_categoria,
                    preco: Number(preco),
                    estoque,
                    descricao
                })
            });

            feedback.textContent = 'Produto cadastrado com sucesso!';

            form.querySelectorAll('input, textarea').forEach(campo => {
                campo.value = '';
            });

            select.selectedIndex = 0;

            // Atualizar a tabela sem recarregar a página
            await carregarProdutos();

        } catch (erro) {
            feedback.textContent = erro.message;

        } finally {
            botao.disabled = false;
        }
    });
});
