// Recuperar dados do localStorage ou iniciar lista vazia
let obras = JSON.parse(localStorage.getItem('minhas_obras')) || [];
let filtroStatusAtual = 'todas';

// -------------------------------------------------------------
// NAVEGAÇÃO ENTRE TELAS
// -------------------------------------------------------------
function navegarPara(idTela) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  document.getElementById(`tela-${idTela}`).classList.add('ativa');
  
  if (idTela === 'home') atualizarDashboard();
  if (idTela === 'listagem') atualizarListagem();
  if (idTela === 'crud') atualizarTabelaCRUD();
}

// -------------------------------------------------------------
// TELA 1: DASHBOARD (HOME)
// -------------------------------------------------------------
function atualizarDashboard() {
  document.getElementById('dash-total').innerText = obras.length;
  document.getElementById('dash-lendo').innerText = obras.filter(o => o.status === 'Lendo').length;
  document.getElementById('dash-lido').innerText = obras.filter(o => o.status === 'Lido').length;
}

// -------------------------------------------------------------
// TELA 2: LISTAGEM DE OBRAS (COM BUSCA, FILTRO E ORDENAÇÃO)
// -------------------------------------------------------------
function atualizarListagem() {
  const termoBusca = document.getElementById('input-busca').value.toLowerCase().trim();
  const tipoOrdenacao = document.getElementById('select-ordem').value;

  // 1. Filtrar por Nome
  let resultado = obras.filter(obra => 
    obra.nome.toLowerCase().includes(termoBusca)
  );

  // 2. Filtrar por Status
  if (filtroStatusAtual !== 'todas') {
    resultado = resultado.filter(obra => obra.status === filtroStatusAtual);
  }

  // 3. Ordenar (por ID ou Alfabeto)
  resultado.sort((a, b) => {
    switch (tipoOrdenacao) {
      case 'nome-asc':
        return a.nome.localeCompare(b.nome);
      case 'nome-desc':
        return b.nome.localeCompare(a.nome);
      case 'id-asc':
        return a.id - b.id;
      case 'id-desc':
      default:
        return b.id - a.id;
    }
  });

  renderizarObras(resultado);
}

function alterarFiltroStatus(status) {
  filtroStatusAtual = status;

  document.querySelectorAll('.btn-filtro').forEach(btn => {
    btn.classList.toggle('ativo', btn.dataset.status === status);
  });

  atualizarListagem();
}

function renderizarObras(listaObras) {
  const container = document.getElementById('grid-obras');
  container.innerHTML = '';

  if (listaObras.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">Nenhuma obra encontrada.</p>';
    return;
  }

  listaObras.forEach(obra => {
    const card = document.createElement('div');
    card.className = 'card-obra';
    const statusClass = obra.status.replace(' ', '-');
    
    card.innerHTML = `
      <span class="badge ${statusClass}">${obra.status}</span>
      <h3>${obra.nome}</h3>
      <p><strong>Categoria:</strong> ${obra.categoria}</p>
      <p><strong>Capítulo/Página:</strong> ${obra.capitulo}</p>
    `;
    container.appendChild(card);
  });
}

// -------------------------------------------------------------
// TELA 3: CRUD (FORMULÁRIO, TABELA, BUSCA E ORDENAÇÃO)
// -------------------------------------------------------------
document.getElementById('form-obra').addEventListener('submit', (e) => {
  e.preventDefault();

  const id = document.getElementById('obra-id').value;
  const nome = document.getElementById('nome').value;
  const categoria = document.getElementById('categoria').value;
  const capitulo = document.getElementById('capitulo').value;
  const status = document.getElementById('status').value;

  if (id) {
    // Edição
    const index = obras.findIndex(o => o.id == id);
    obras[index] = { id: Number(id), nome, categoria, capitulo, status };
  } else {
    // Criação
    const novaObra = { id: Date.now(), nome, categoria, capitulo, status };
    obras.push(novaObra);
  }

  salvarStorage();
  limparFormulario();
  atualizarTabelaCRUD();
});

function atualizarTabelaCRUD() {
  const termoBusca = document.getElementById('input-busca-crud').value.toLowerCase().trim();
  const tipoOrdenacao = document.getElementById('select-ordem-crud').value;

  // 1. Filtrar pelo nome da obra
  let resultado = obras.filter(obra => 
    obra.nome.toLowerCase().includes(termoBusca)
  );

  // 2. Ordenar por ID ou Alfabeto
  resultado.sort((a, b) => {
    switch (tipoOrdenacao) {
      case 'nome-asc':
        return a.nome.localeCompare(b.nome);
      case 'nome-desc':
        return b.nome.localeCompare(a.nome);
      case 'id-asc':
        return a.id - b.id;
      case 'id-desc':
      default:
        return b.id - a.id;
    }
  });

  renderizarTabelaCRUD(resultado);
}

function renderizarTabelaCRUD(listaObras = obras) {
  const tbody = document.getElementById('tabela-obras-body');
  tbody.innerHTML = '';

  if (listaObras.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #777;">Nenhuma obra encontrada.</td>
      </tr>
    `;
    return;
  }

  listaObras.forEach(obra => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${obra.nome}</td>
      <td>${obra.categoria}</td>
      <td>${obra.capitulo}</td>
      <td>${obra.status}</td>
      <td>
        <button class="btn-acao-editar" onclick="prepararEdicao(${obra.id})">Editar</button>
        <button class="btn-acao-deletar" onclick="deletarObra(${obra.id})">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function prepararEdicao(id) {
  const obra = obras.find(o => o.id === id);
  if (obra) {
    document.getElementById('obra-id').value = obra.id;
    document.getElementById('nome').value = obra.nome;
    document.getElementById('categoria').value = obra.categoria;
    document.getElementById('capitulo').value = obra.capitulo;
    document.getElementById('status').value = obra.status;
    document.getElementById('form-titulo').innerText = 'Editar Obra';
    
    // Rola a página suavemente até o formulário para facilitar a edição em celulares
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function deletarObra(id) {
  if (confirm('Tem certeza que deseja excluir esta obra?')) {
    obras = obras.filter(o => o.id !== id);
    salvarStorage();
    atualizarTabelaCRUD();
  }
}

function limparFormulario() {
  document.getElementById('form-obra').reset();
  document.getElementById('obra-id').value = '';
  document.getElementById('form-titulo').innerText = 'Cadastrar / Editar Obra';
}

function salvarStorage() {
  localStorage.setItem('minhas_obras', JSON.stringify(obras));
}

// Inicialização ao carregar a página
atualizarDashboard();