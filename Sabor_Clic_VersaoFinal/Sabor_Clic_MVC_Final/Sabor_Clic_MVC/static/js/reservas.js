const API_RESERVAS = '/api';
async function requisicaoReserva(url, options = {}) {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const response = await fetch(url, {
        ...options,
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/json', 'X-CSRFToken': token, ...(options.headers || {})}
    });
    const dados = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(dados.mensagem || 'Não foi possível concluir a operação.');
    return dados;
}
async function carregarBancadasReserva() {
    const select = document.querySelector('#bancada');
    const bancadas = await requisicaoReserva(`${API_RESERVAS}/bancadas`);
    select.replaceChildren(new Option('Selecione uma bancada', ''));
    bancadas.forEach(b => {
        const preco = Number(b.valor_hora).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
        select.add(new Option(`${b.nome} - ${preco}/hora`, b.id));
    });
}
async function carregarMinhasReservas() {
    const lista = document.querySelector('#lista-reservas');
    const reservas = await requisicaoReserva(`${API_RESERVAS}/reservas`);
    lista.replaceChildren();
    if (!reservas.length) { lista.textContent = 'Você ainda não possui reservas.'; return; }
    reservas.forEach(r => {
        const card = document.createElement('article'); card.className = 'panel rental-booking';
        const info = document.createElement('div'); info.className = 'booking-details';
        const nome = document.createElement('h3'); nome.textContent = r.bancada || 'Bancada';
        const periodo = document.createElement('p'); periodo.textContent = `${r.inicio} até ${r.fim}`;
        const status = document.createElement('small'); status.textContent = `Status: ${r.status}`;
        const valor = document.createElement('strong'); valor.textContent = Number(r.valor_total).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
        info.append(nome, periodo, status); card.append(info, valor); lista.append(card);
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    const botao = document.querySelector('#btn-solicitar-reserva'); if (!botao) return;
    const feedback = document.querySelector('#reserva-feedback');
    const data = document.querySelector('#data-reserva');
    const agora = new Date(); data.min = `${agora.getFullYear()}-${String(agora.getMonth()+1).padStart(2,'0')}-${String(agora.getDate()).padStart(2,'0')}`;
    try { await carregarBancadasReserva(); await carregarMinhasReservas(); }
    catch (e) { feedback.textContent = e.message; }
    botao.addEventListener('click', async () => {
        const id_bancada = Number(document.querySelector('#bancada').value);
        const dia = data.value, horaInicio = document.querySelector('#inicio-reserva').value, horaFim = document.querySelector('#fim-reserva').value;
        const observacao = document.querySelector('#observacao-reserva').value.trim();
        if (!id_bancada || !dia || !horaInicio || !horaFim) { feedback.textContent = 'Preencha todos os campos obrigatórios.'; return; }
        const inicio = `${dia}T${horaInicio}:00`, fim = `${dia}T${horaFim}:00`;
        if (fim <= inicio) { feedback.textContent = 'O horário final deve ser posterior ao inicial.'; return; }
        botao.disabled = true; feedback.textContent = 'Enviando solicitação...';
        try {
            const resultado = await requisicaoReserva(`${API_RESERVAS}/reservas`, {method:'POST', body:JSON.stringify({id_bancada, inicio, fim, observacao})});
            feedback.textContent = `${resultado.mensagem} Valor: ${Number(resultado.valor_total).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}`;
            await carregarMinhasReservas();
            document.querySelector('#data-reserva').value = '';
            document.querySelector('#inicio-reserva').value = '';
            document.querySelector('#fim-reserva').value = '';
            document.querySelector('#observacao-reserva').value = '';
            document.querySelector('#bancada').selectedIndex = 0;
        } catch (e) { feedback.textContent = e.message; }
        finally { botao.disabled = false; }
    });
});
