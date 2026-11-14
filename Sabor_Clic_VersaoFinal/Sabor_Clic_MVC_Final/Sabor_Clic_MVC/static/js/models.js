class Prato {
    #id;
    #nome;
    #preco;
    #descricao;
    #ativo;

    constructor(id, nome, preco, descricao, ativo = true) {
        this.#id = id;
        this.#nome = nome;
        this.#preco = Number(preco);
        this.#descricao = descricao;
        this.#ativo = Boolean(ativo);
    }

    get id() { return this.#id; }
    get nome() { return this.#nome; }
    get preco() { return this.#preco; }
    get descricao() { return this.#descricao; }
    get ativo() { return this.#ativo; }

    toJSON() {
        return {
            id: this.#id,
            nome: this.#nome,
            preco: this.#preco,
            descricao: this.#descricao,
            ativo: this.#ativo
        };
    }
}

class Carrinho {
    #itens;

    constructor() {
        this.#itens = [];
    }

    adicionarItem(prato, quantidade = 1) {
        const itemExistente = this.#itens.find(item => item.prato.id === prato.id);
        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            this.#itens.push({ prato, quantidade });
        }
    }

    removerItem(pratoId) {
        this.#itens = this.#itens.filter(item => item.prato.id !== pratoId);
    }

    calcularTotal() {
        return this.#itens.reduce((total, item) => total + (item.prato.preco * item.quantidade), 0);
    }

    obterItens() {
        return [...this.#itens];
    }

    limpar() {
        this.#itens = [];
    }
}
