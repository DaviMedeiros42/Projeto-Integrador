async function buscarCardapio() {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: 1, nome: "Hambúrguer Artesanal", preco: 35.90, descricao: "Pão brioche, blend 180g, cheddar e bacon.", ativo: true },
            { id: 2, nome: "Estrogonofe de Frango", preco: 28.50, descricao: "Acompanha arroz branco e batata palha.", ativo: true },
            { id: 3, nome: "Lasanha à Bolonhesa", preco: 42.00, descricao: "Massa fresca com muito molho e queijo.", ativo: true },
            { id: 4, nome: "Salada Fit", preco: 22.00, descricao: "Alface, tomate, frango desfiado e molho de mostarda.", ativo: true }
        ];
    } catch (erro) {
        console.error("Erro ao buscar o cardápio:", erro);
        return [];
    }
}

async function enviarPedido(dadosPedido) {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { sucesso: true, mensagem: "Pedido enviado com sucesso!" };
    } catch (erro) {
        console.error("Erro ao enviar pedido:", erro);
        throw erro;
    }
}
