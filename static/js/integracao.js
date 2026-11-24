const API = '/api';
const dinheiro = v => Number(v || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const lerCarrinho = () => JSON.parse(localStorage.getItem('saborClicCarrinho') || '[]');
const salvarCarrinho = itens => {
  localStorage.setItem('saborClicCarrinho', JSON.stringify(itens));
  atualizarIndicadorCarrinho();
};
function atualizarIndicadorCarrinho() {
  const quantidade = lerCarrinho().reduce((total, item) => total + Number(item.quantidade || 0), 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = quantidade;
    el.setAttribute('aria-label', `${quantidade} ${quantidade === 1 ? 'item' : 'itens'} no carrinho`);
    el.hidden = quantidade === 0;
  });
}
async function carregarUsuarioLogado() {
  const nomeEl = document.getElementById('cliente-nome');
  const avatarEl = document.getElementById('cliente-avatar');
  if (!nomeEl) return;
  try {
    const dados = await requisicao(`${API}/me`);
    const nome = dados.usuario?.nome?.trim() || 'Cliente';
    nomeEl.textContent = nome;
    if (avatarEl) avatarEl.textContent = nome.charAt(0).toLocaleUpperCase('pt-BR');
  } catch (erro) {
    nomeEl.textContent = 'Cliente';
    if (avatarEl) avatarEl.textContent = 'C';
  }
}
async function requisicao(url, opcoes={}) {
  const resposta=await fetch(url,{...opcoes,headers:{'Content-Type':'application/json','X-CSRFToken':document.querySelector('meta[name="csrf-token"]')?.content||'',...(opcoes.headers||{})}});
  const dados=await resposta.json().catch(()=>({mensagem:'Resposta inválida do servidor.'}));
  if(!resposta.ok) throw new Error(dados.mensagem || 'Não foi possível concluir a operação.');
  return dados;
}
function aviso(mensagem, erro=false) {
  let el=document.getElementById('aviso-integracao');
  if(!el){el=document.createElement('p');el.id='aviso-integracao';el.setAttribute('role','status');el.style.cssText='padding:12px;margin:12px 0;border-radius:8px;background:#f1eee8;color:#342d25';(document.querySelector('main')||document.body).prepend(el);}
  el.textContent=mensagem; el.style.borderLeft=erro?'4px solid #b42318':'4px solid #26734d';
}
function adicionarCarrinho(produto){const itens=lerCarrinho();const existente=itens.find(i=>i.id===produto.id);if(existente)existente.quantidade++;else itens.push({...produto,quantidade:1});salvarCarrinho(itens);aviso(`${produto.nome} adicionado ao carrinho.`);}
async function carregarCardapio(){
 const grid=document.querySelector('.food-grid'); if(!grid)return;
 try{
  const produtos=await requisicao(`${API}/cardapio`);grid.replaceChildren();
  if(!produtos.length){grid.textContent='Nenhum produto disponível no momento.';return;}
  produtos.forEach(p=>{
   const card=document.createElement('article');card.className='food-card';
   const photo=document.createElement('div');photo.className='food-photo';photo.textContent='🍽️';
   const info=document.createElement('div');info.className='food-info';
   const cat=document.createElement('span');cat.className='food-category';cat.textContent=p.categoria;
   const nome=document.createElement('h4');nome.textContent=p.nome;
   const desc=document.createElement('p');desc.textContent=p.descricao||'';
   const bottom=document.createElement('div');bottom.className='food-bottom';
   const preco=document.createElement('strong');preco.textContent=dinheiro(p.preco);
   const btn=document.createElement('button');btn.className='add-button';btn.type='button';btn.textContent='＋';btn.setAttribute('aria-label',`Adicionar ${p.nome} ao carrinho`);
   btn.addEventListener('click',()=>adicionarCarrinho({id:p.id,nome:p.nome,preco:p.preco,descricao:p.descricao,categoria:p.categoria}));
   bottom.append(preco,btn);info.append(cat,nome,desc,bottom);card.append(photo,info);grid.append(card);
  });
 }catch(e){aviso(e.message,true);}
}
function renderizarCarrinho(){
 const panel=document.querySelector('.cart-panel');if(!panel)return;
 panel.querySelectorAll('.cart-item').forEach(el=>el.remove());
 const itens=lerCarrinho();const titulo=panel.querySelector('.count-label');if(titulo)titulo.textContent=`${itens.reduce((s,i)=>s+i.quantidade,0)} itens`;
 let anchor=panel.querySelector('.field-label');
 itens.forEach(item=>{
  const row=document.createElement('article');row.className='cart-item';
  const info=document.createElement('div');info.className='cart-item-info';
  const cat=document.createElement('span');cat.className='food-category';cat.textContent=item.categoria||'PRODUTO';
  const name=document.createElement('h4');name.textContent=item.nome;
  const price=document.createElement('strong');price.textContent=dinheiro(item.preco*item.quantidade);
  info.append(cat,name,price);
  const qty=document.createElement('div');qty.className='quantity';
  const menos=document.createElement('button');menos.type='button';menos.textContent='−';
  const count=document.createElement('b');count.textContent=item.quantidade;
  const mais=document.createElement('button');mais.type='button';mais.textContent='＋';
  menos.onclick=()=>alterar(item.id,-1);mais.onclick=()=>alterar(item.id,1);qty.append(menos,count,mais);row.append(info,qty);
  if(anchor)panel.insertBefore(row,anchor);else panel.append(row);
 });
 const subtotal=itens.reduce((s,i)=>s+i.preco*i.quantidade,0);
 const linhas=document.querySelectorAll('.summary-line b');if(linhas[0])linhas[0].textContent=dinheiro(subtotal);
 const total=document.querySelector('.summary-total strong');if(total)total.textContent=dinheiro(subtotal);
 const vazio=panel.querySelector('.cart-empty');if(vazio)vazio.remove();
 if(!itens.length){const p=document.createElement('p');p.className='cart-empty';p.textContent='Seu carrinho está vazio. Adicione pratos pelo cardápio.';panel.append(p);}
}
function alterar(id,delta){let itens=lerCarrinho();const item=itens.find(i=>i.id===id);if(item)item.quantidade+=delta;itens=itens.filter(i=>i.quantidade>0);salvarCarrinho(itens);renderizarCarrinho();}
async function configurarCheckout(){
 const sec=document.querySelector('#cliente-finalizar');if(!sec)return;
 const form=sec.querySelector('form');if(form)form.addEventListener('submit',e=>e.preventDefault());
 const botao=sec.querySelector('.summary-panel .button');if(!botao)return;
 botao.addEventListener('click',async e=>{
  e.preventDefault();const itens=lerCarrinho();if(!itens.length){aviso('Adicione produtos ao carrinho antes de finalizar.',true);return;}
  try{const dados=await requisicao(`${API}/pedidos`,{method:'POST',body:JSON.stringify({itens:itens.map(i=>({id:i.id,quantidade:i.quantidade})),observacao:''})});salvarCarrinho([]);aviso(`Pedido #${dados.id_pedido} registrado com sucesso!`);botao.textContent='Pedido registrado';botao.removeAttribute('href');}
  catch(err){aviso(err.message,true);}
 });
}
async function configurarLogin(){
 const form=document.querySelector('.login-form');if(!form)return;
 const seletorPerfil=form.querySelector('#login-type');
 let modo='login';
 const linkCadastro=form.querySelector('.form-foot a');
 seletorPerfil?.addEventListener('change',()=>{if(linkCadastro)linkCadastro.style.display=seletorPerfil.value==='cliente'?'':'none';});
 linkCadastro?.addEventListener('click',e=>{
  if(seletorPerfil && seletorPerfil.value!=='cliente')return;
  e.preventDefault();
  if(modo==='login'){
   modo='cadastro';
   const nome=document.createElement('input');nome.id='register-name';nome.placeholder='Seu nome completo';nome.required=true;nome.autocomplete='name';
   const endereco=document.createElement('input');endereco.id='register-address';endereco.placeholder='Rua, número e bairro';endereco.required=true;endereco.autocomplete='street-address';
   const labelNome=document.createElement('label');labelNome.htmlFor=nome.id;labelNome.textContent='Nome';
   const labelEndereco=document.createElement('label');labelEndereco.htmlFor=endereco.id;labelEndereco.textContent='Endereço';
   const labelSenha=form.querySelector('label[for="login-password"]');form.insertBefore(labelNome,labelSenha);form.insertBefore(nome,labelSenha);form.insertBefore(labelEndereco,labelSenha);form.insertBefore(endereco,labelSenha);
   form.querySelector('button[type="submit"]').textContent='Criar conta';linkCadastro.textContent='Já tenho uma conta';
  }else{modo='login';form.querySelector('#register-name')?.previousElementSibling?.remove();form.querySelector('#register-name')?.remove();form.querySelector('#register-address')?.previousElementSibling?.remove();form.querySelector('#register-address')?.remove();form.querySelector('button[type="submit"]').textContent='Entrar';linkCadastro.textContent='Criar conta';}
 });
 form.addEventListener('submit',async e=>{e.preventDefault();const email=form.querySelector('#login-email')?.value;const senha=form.querySelector('#login-password')?.value;
  try{
   if(modo==='cadastro'){
    const nome=form.querySelector('#register-name')?.value;const endereco=form.querySelector('#register-address')?.value;
    await requisicao(`${API}/cadastro`,{method:'POST',body:JSON.stringify({nome,email,senha,endereco})});
    modo='login';form.querySelector('#register-name')?.previousElementSibling?.remove();form.querySelector('#register-name')?.remove();form.querySelector('#register-address')?.previousElementSibling?.remove();form.querySelector('#register-address')?.remove();
    await requisicao(`${API}/login`,{method:'POST',body:JSON.stringify({email,senha,tipo:'cliente'})});aviso('Conta criada e login realizado com sucesso!');
    form.querySelector('button[type="submit"]').textContent='Entrar';linkCadastro.textContent='Criar conta';
    setTimeout(()=>{window.location.href='/cliente/index.html';},500);
   }else{const tipo=seletorPerfil?.value||'cliente';const r=await requisicao(`${API}/login`,{method:'POST',body:JSON.stringify({email,senha,tipo})});aviso(`Bem-vindo(a), ${r.usuario.nome}!`);setTimeout(()=>{window.location.href=tipo==='cliente'?'/cliente/index.html':tipo==='cozinheiro'?'/cozinheiro/index.html':'/administrador/index.html';},500);}
  }catch(err){aviso(err.message,true);}
 });
}
async function carregarPedidos(){
 const sec=document.querySelector('#cliente-pedidos');if(!sec)return;
 try{const pedidos=await requisicao(`${API}/pedidos`);const tbody=sec.querySelector('tbody');if(!tbody)return;tbody.replaceChildren();pedidos.forEach(p=>{const tr=document.createElement('tr');[ `#${p.id_pedido}`,p.data_pedido,dinheiro(p.valor_total),p.status ].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});tbody.append(tr);});}
 catch(e){aviso(e.message,true);}
}

async function configurarPerfil(){
 const form=document.getElementById('profile-form'); if(!form)return;
 const feedback=document.getElementById('profile-feedback');
 const nome=form.querySelector('#profile-name'), email=form.querySelector('#profile-mail'), endereco=form.querySelector('#profile-address');
 const heading=document.getElementById('profile-heading-name'), avatar=document.getElementById('profile-avatar'), criado=document.getElementById('profile-created');
 try{
  const dados=await requisicao(`${API}/perfil`); const p=dados.perfil;
  nome.value=p.nome||''; email.value=p.email||''; endereco.value=p.endereco||'';
  if(heading)heading.textContent=p.nome||'Cliente'; if(avatar)avatar.textContent=(p.nome||'C').trim().charAt(0).toLocaleUpperCase('pt-BR');
  if(criado && p.criado_em)criado.textContent=`Cliente desde ${new Date(`${p.criado_em}T12:00:00`).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}`;
 }catch(e){if(feedback)feedback.textContent=e.message;}
 form.addEventListener('submit',async e=>{e.preventDefault();const botao=form.querySelector('button[type="submit"]');botao.disabled=true;
  try{await requisicao(`${API}/perfil`,{method:'PUT',body:JSON.stringify({nome:nome.value,email:email.value,endereco:endereco.value})});
   if(heading)heading.textContent=nome.value.trim();if(avatar)avatar.textContent=nome.value.trim().charAt(0).toLocaleUpperCase('pt-BR');
   if(feedback)feedback.textContent='Perfil atualizado com sucesso.';
  }catch(err){if(feedback)feedback.textContent=err.message;}finally{botao.disabled=false;}
 });
}

document.addEventListener('DOMContentLoaded',()=>{atualizarIndicadorCarrinho();carregarUsuarioLogado();carregarCardapio();renderizarCarrinho();configurarCheckout();configurarLogin();carregarPedidos();configurarPerfil();});
