class AppController {
    #carrinho;
    #listaPratosGlobais;
    #contenedorMenu;
    #inputBusca;
    #elementoTotal;

    constructor() {
        this.#carrinho = new Carrinho();
        this.#listaPratosGlobais = [];
        
        this.#contenedorMenu = document.getElementById('cardapio-lista');
        this.#inputBusca = document.getElementById('input-busca');
        this.#elementoTotal = document.getElementById('carrinho-total');
    }

    async iniciar() {
        this.#configurarEventos();
        await this.#carregarCardapio();
    }

    async #carregarCardapio() {
        if (!this.#contenedorMenu) return;

        this.#mostrarEstadoCarregamento();

        try {
            const dadosPratos = await buscarCardapio();
            
            this.#listaPratosGlobais = dadosPratos.map(item =>
                new Prato(item.id, item.nome, item.preco, item.descricao, item.ativo)
            );

            this.#renderizarPratos(this.#listaPratosGlobais);
        } catch (erro) {
            this.#mostrarErroDOM("Não foi possível carregar o cardápio.");
        }
    }

    #renderizarPratos(pratos) {
        this.#contenedorMenu.innerHTML = '';
        
        if (pratos.length === 0) {
            this.#contenedorMenu.innerHTML = '<p class="mensagem-vazia">Nenhum prato encontrado com esta descrição.</p>';
            return;
        }

        const fragmento = document.createDocumentFragment();

        pratos.forEach(prato => {
            const card = document.createElement('div');
            card.className = 'prato-card';
            
            const precoFormatado = prato.preco.toFixed(2).replace('.', ',');

            card.innerHTML = `
                <h3>${prato.nome}</h3>
                <p>${prato.descricao}</p>
                <span class="preco">R$ ${precoFormatado}</span>
                <button class="btn-adicionar" data-id="${prato.id}">Adicionar ao Carrinho</button>
            `;

            const botaoElemento = card.querySelector('.btn-adicionar');
            botaoElemento.addEventListener('click', () => this.#adicionarAoCarrinho(prato, botaoElemento));

            fragmento.appendChild(card);
        });

        this.#contenedorMenu.appendChild(fragmento);
    }

    #adicionarAoCarrinho(prato, botaoElemento) {
        this.#carrinho.adicionarItem(prato);
        this.#atualizarTotalCarrinho();
        
        const textoOriginal = botaoElemento.innerText;
        botaoElemento.innerText = "Adicionado! ✔";
        
        setTimeout(() => {
            botaoElemento.innerText = textoOriginal;
        }, 1500);
    }

    #atualizarTotalCarrinho() {
        if (this.#elementoTotal) {
            const totalFormatado = this.#carrinho.calcularTotal().toFixed(2).replace('.', ',');
            this.#elementoTotal.innerText = `R$ ${totalFormatado}`;
        }
    }

    #configurarEventos() {
        if (this.#inputBusca) {
            let timerOcioso;
            this.#inputBusca.addEventListener('input', (evento) => {
                clearTimeout(timerOcioso);
                timerOcioso = setTimeout(() => {
                    this.#filtrarPratos(evento.target.value);
                }, 300);
            });
        }
    }

    #filtrarPratos(termo) {
        const busca = termo.toLowerCase().trim();
        const filtrados = this.#listaPratosGlobais.filter(prato =>
            prato.nome.toLowerCase().includes(busca) ||
            prato.descricao.toLowerCase().includes(busca)
        );
        this.#renderizarPratos(filtrados);
    }

    #mostrarEstadoCarregamento() {
        this.#contenedorMenu.innerHTML = '<p class="loading">Carregando cardápio...</p>';
    }

    #mostrarErroDOM(mensagem) {
        this.#contenedorMenu.innerHTML = `<p style="color: red;">Erro: ${mensagem}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    app.iniciar();
});
