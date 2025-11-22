// ============================================
// FRONTEND - APLICAÇÃO DE TROCA DE LIVROS
// Tecnologia: HTML, CSS, JavaScript Puro
// ============================================

// ============================================
// CONFIGURAÇÃO
// ============================================

const API_URL = 'http://localhost:3000/api';

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================

let estadoApp = {
    usuarioLogado: null,
    livroSelecionado: null,
    solicitacaoSelecionada: null
};

// ============================================
// ELEMENTOS DO DOM
// ============================================

// Telas
const telaLogin = document.getElementById('tela-login');
const telaCadastro = document.getElementById('tela-cadastro');
const telaHome = document.getElementById('tela-home');

// Formulários
const formLogin = document.getElementById('form-login');
const formCadastro = document.getElementById('form-cadastro');
const formCadastroLivro = document.getElementById('form-cadastro-livro');

// Botões de navegação
const btnIrCadastro = document.getElementById('btn-ir-cadastro');
const btnVoltarLogin = document.getElementById('btn-voltar-login');
const btnLogout = document.getElementById('btn-logout');

// Elementos de mensagem
const msgErroLogin = document.getElementById('msg-erro-login');
const msgErroCadastro = document.getElementById('msg-erro-cadastro');
const msgErroTroca = document.getElementById('msg-erro-troca');
const msgErroCadastroLivro = document.getElementById('msg-erro-cadastro-livro');

// Home
const nomeUsuario = document.getElementById('nome-usuario');
const infoLocalizacao = document.getElementById('info-localizacao');
const listaLivros = document.getElementById('lista-livros');
const listaMeusLivros = document.getElementById('lista-meus-livros');
const listaSolicitacoes = document.getElementById('lista-solicitacoes');

// Abas
const abaBtns = document.querySelectorAll('.aba-btn');
const secoesAbas = document.querySelectorAll('.secao-aba');

// Modal de troca
const modalTroca = document.getElementById('modal-troca');
const fecharModal = document.querySelector('.fechar-modal');
const fecharModalBtn = document.querySelector('.fechar-modal-btn');
const btnConfirmarTroca = document.getElementById('btn-confirmar-troca');
const modalInfoLivro = document.getElementById('modal-info-livro');
const modalInfoDono = document.getElementById('modal-info-dono');

// Modal de responder solicitação
const modalResponderSolicitacao = document.getElementById('modal-responder-solicitacao');
const fecharModalResposta = document.querySelector('.fechar-modal-resposta');
const fecharModalRespostaBtn = document.querySelector('.fechar-modal-resposta-btn');
const btnAceitarSolicitacao = document.getElementById('btn-aceitar-solicitacao');
const btnRejeitarSolicitacao = document.getElementById('btn-rejeitar-solicitacao');
const modalSolicitacaoInfo = document.getElementById('modal-solicitacao-info');

// ============================================
// FUNÇÕES DE NAVEGAÇÃO ENTRE TELAS
// ============================================

/**
 * Exibe uma tela e esconde as outras
 * @param {HTMLElement} tela - Elemento da tela a ser exibida
 */
function mostrarTela(tela) {
    document.querySelectorAll('.tela').forEach(t => {
        t.classList.remove('ativa');
    });
    tela.classList.add('ativa');
}

/**
 * Limpa os campos de um formulário
 * @param {HTMLElement} form - Elemento do formulário
 */
function limparFormulario(form) {
    form.reset();
}

/**
 * Exibe mensagem de erro
 * @param {HTMLElement} elemento - Elemento onde exibir a mensagem
 * @param {string} mensagem - Texto da mensagem
 */
function exibirErro(elemento, mensagem) {
    elemento.textContent = mensagem;
    elemento.classList.add('ativa');
}

/**
 * Limpa mensagem de erro
 * @param {HTMLElement} elemento - Elemento da mensagem
 */
function limparErro(elemento) {
    elemento.textContent = '';
    elemento.classList.remove('ativa');
}

/**
 * Muda para uma aba específica
 * @param {string} abaId - ID da aba a ser exibida
 */
function mudarAba(abaId) {
    // Remove classe ativa de todos os botões e seções
    abaBtns.forEach(btn => btn.classList.remove('aba-ativa'));
    secoesAbas.forEach(secao => secao.classList.remove('ativa'));

    // Adiciona classe ativa ao botão e seção selecionados
    document.querySelector(`[data-aba="${abaId}"]`).classList.add('aba-ativa');
    document.getElementById(`aba-${abaId}`).classList.add('ativa');
}

// ============================================
// FUNÇÕES DE REQUISIÇÃO HTTP
// ============================================

/**
 * Faz uma requisição POST para o backend
 * @param {string} endpoint - Caminho da API
 * @param {object} dados - Dados a enviar
 * @returns {Promise} Resposta da API
 */
async function fazerRequisicaoPost(endpoint, dados) {
    try {
        const resposta = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || 'Erro na requisição');
        }

        return resultado;
    } catch (erro) {
        throw new Error(erro.message);
    }
}

/**
 * Faz uma requisição GET para o backend
 * @param {string} endpoint - Caminho da API
 * @returns {Promise} Resposta da API
 */
async function fazerRequisicaoGet(endpoint) {
    try {
        const resposta = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || 'Erro na requisição');
        }

        return resultado;
    } catch (erro) {
        throw new Error(erro.message);
    }
}

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================

/**
 * Realiza o login do usuário
 * @param {object} credenciais - Email e senha
 */
async function fazerLogin(credenciais) {
    try {
        limparErro(msgErroLogin);

        const resposta = await fazerRequisicaoPost('/login', credenciais);

        estadoApp.usuarioLogado = resposta.usuario;

        atualizarTelaHome();
        await carregarLivros();
        await carregarMeusLivros();
        await carregarSolicitacoes();

        mostrarTela(telaHome);
        limparFormulario(formLogin);
    } catch (erro) {
        exibirErro(msgErroLogin, erro.message);
    }
}

/**
 * Realiza o cadastro de um novo usuário
 * @param {object} dados - Dados do novo usuário
 */
async function fazerCadastro(dados) {
    try {
        limparErro(msgErroCadastro);

        const resposta = await fazerRequisicaoPost('/register', dados);

        alert('Cadastro realizado com sucesso! Faça login para continuar.');

        mostrarTela(telaLogin);
        limparFormulario(formCadastro);
    } catch (erro) {
        exibirErro(msgErroCadastro, erro.message);
    }
}

/**
 * Realiza o logout do usuário
 */
function fazerLogout() {
    estadoApp.usuarioLogado = null;
    estadoApp.livroSelecionado = null;
    estadoApp.solicitacaoSelecionada = null;
    mostrarTela(telaLogin);
    limparFormulario(formLogin);
}

// ============================================
// FUNÇÕES DE LIVROS
// ============================================

/**
 * Carrega os livros disponíveis na cidade do usuário
 */
async function carregarLivros() {
    try {
        const cidade = estadoApp.usuarioLogado.cidade;
        const resposta = await fazerRequisicaoGet(`/books?cidade=${encodeURIComponent(cidade)}`);

        renderizarLivros(resposta.livros);
    } catch (erro) {
        listaLivros.innerHTML = `<div class="carregando">Erro ao carregar livros: ${erro.message}</div>`;
    }
}

/**
 * Carrega os livros do usuário logado
 */
async function carregarMeusLivros() {
    try {
        const cidade = estadoApp.usuarioLogado.cidade;
        const resposta = await fazerRequisicaoGet(`/books?cidade=${encodeURIComponent(cidade)}`);

        const meusLivros = resposta.livros.filter(livro => livro.donoid === estadoApp.usuarioLogado.id);
        renderizarMeusLivros(meusLivros);
    } catch (erro) {
        listaMeusLivros.innerHTML = `<div class="carregando">Erro ao carregar seus livros: ${erro.message}</div>`;
    }
}

/**
 * Renderiza os livros disponíveis na tela
 * @param {array} livros - Array de livros
 */
function renderizarLivros(livros) {
    const livrosFiltrados = livros.filter(livro => livro.donoid !== estadoApp.usuarioLogado.id);

    if (livrosFiltrados.length === 0) {
        listaLivros.innerHTML = '<div class="carregando">Nenhum livro disponível no momento.</div>';
        return;
    }

    listaLivros.innerHTML = livrosFiltrados.map(livro => `
        <div class="card-livro">
            <h3 class="card-livro-titulo">${livro.titulo}</h3>
            <p class="card-livro-autor">por ${livro.autor}</p>
            
            <div class="card-livro-info">
                <strong>Dono:</strong> ${livro.dono}
            </div>
            
            <div class="card-livro-bairro">
                📍 ${livro.bairro}
            </div>
            
            <p class="card-livro-descricao">${livro.descricao}</p>
            
            <button class="btn-solicitar" onclick="abrirModalTroca(${livro.id}, '${livro.titulo}', '${livro.dono}')">
                Solicitar Troca
            </button>
        </div>
    `).join('');
}

/**
 * Renderiza os livros do usuário
 * @param {array} livros - Array de livros do usuário
 */
function renderizarMeusLivros(livros) {
    if (livros.length === 0) {
        listaMeusLivros.innerHTML = '<div class="carregando">Você ainda não cadastrou nenhum livro</div>';
        return;
    }

    listaMeusLivros.innerHTML = livros.map(livro => `
        <div class="card-livro">
            <h3 class="card-livro-titulo">${livro.titulo}</h3>
            <p class="card-livro-autor">por ${livro.autor}</p>
            
            <div class="card-livro-info">
                <strong>Seu livro</strong>
            </div>
            
            <div class="card-livro-bairro">
                📍 ${livro.bairro}
            </div>
            
            <p class="card-livro-descricao">${livro.descricao}</p>
        </div>
    `).join('');
}

/**
 * Cadastra um novo livro
 * @param {object} dados - Dados do novo livro
 */
async function cadastrarLivro(dados) {
    try {
        limparErro(msgErroCadastroLivro);

        const dadosCompletos = {
            ...dados,
            donoid: estadoApp.usuarioLogado.id
        };

        const resposta = await fazerRequisicaoPost('/books', dadosCompletos);

        alert('Livro cadastrado com sucesso!');
        limparFormulario(formCadastroLivro);

        await carregarLivros();
        await carregarMeusLivros();
    } catch (erro) {
        exibirErro(msgErroCadastroLivro, erro.message);
    }
}

/**
 * Atualiza a tela home com dados do usuário logado
 */
function atualizarTelaHome() {
    const usuario = estadoApp.usuarioLogado;
    nomeUsuario.textContent = usuario.nome;
    infoLocalizacao.textContent = `📍 ${usuario.bairro}, ${usuario.cidade}`;
}

// ============================================
// FUNÇÕES DE SOLICITAÇÕES DE TROCA
// ============================================

/**
 * Carrega as solicitações de troca recebidas
 */
async function carregarSolicitacoes() {
    try {
        const resposta = await fazerRequisicaoGet(`/trade-requests?usuarioId=${estadoApp.usuarioLogado.id}`);

        renderizarSolicitacoes(resposta.solicitacoes);
    } catch (erro) {
        listaSolicitacoes.innerHTML = `<div class="carregando">Erro ao carregar solicitações: ${erro.message}</div>`;
    }
}

/**
 * Renderiza as solicitações de troca recebidas
 * @param {array} solicitacoes - Array de solicitações
 */
function renderizarSolicitacoes(solicitacoes) {
    if (solicitacoes.length === 0) {
        listaSolicitacoes.innerHTML = '<div class="carregando">Nenhuma solicitação recebida</div>';
        return;
    }

    listaSolicitacoes.innerHTML = solicitacoes.map(solicitacao => `
        <div class="card-solicitacao">
            <div class="solicitacao-info">
                <div class="solicitacao-usuario">👤 ${solicitacao.nomeUsuario}</div>
                <div class="solicitacao-livro">📖 Interessado em: "${solicitacao.tituloLivro}"</div>
                <div class="solicitacao-data">📅 ${new Date(solicitacao.data).toLocaleDateString('pt-BR')}</div>
            </div>
            <div class="solicitacao-acoes">
                <button class="btn-responder" onclick="abrirModalResponderSolicitacao(${solicitacao.id}, '${solicitacao.nomeUsuario}', '${solicitacao.tituloLivro}', '${solicitacao.emailUsuario}')">
                    Responder
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// FUNÇÕES DE MODAL
// ============================================

/**
 * Abre o modal de solicitação de troca
 * @param {number} livroId - ID do livro
 * @param {string} tituloLivro - Título do livro
 * @param {string} donoLivro - Nome do dono
 */
function abrirModalTroca(livroId, tituloLivro, donoLivro) {
    estadoApp.livroSelecionado = livroId;
    modalInfoLivro.textContent = `Livro: "${tituloLivro}"`;
    modalInfoDono.textContent = `Dono: ${donoLivro}`;
    limparErro(msgErroTroca);
    modalTroca.classList.add('ativo');
}

/**
 * Fecha o modal de solicitação de troca
 */
function fecharModalTroca() {
    modalTroca.classList.remove('ativo');
    estadoApp.livroSelecionado = null;
}

/**
 * Abre o modal para responder uma solicitação
 * @param {number} solicitacaoId - ID da solicitação
 * @param {string} nomeUsuario - Nome do usuário que solicitou
 * @param {string} tituloLivro - Título do livro
 * @param {string} emailUsuario - Email do usuário
 */
function abrirModalResponderSolicitacao(solicitacaoId, nomeUsuario, tituloLivro, emailUsuario) {
    estadoApp.solicitacaoSelecionada = {
        id: solicitacaoId,
        nomeUsuario,
        emailUsuario
    };
    modalSolicitacaoInfo.textContent = `${nomeUsuario} está interessado em trocar "${tituloLivro}". Deseja aceitar?`;
    modalResponderSolicitacao.classList.add('ativo');
}

/**
 * Fecha o modal de responder solicitação
 */
function fecharModalResponderSolicitacao() {
    modalResponderSolicitacao.classList.remove('ativo');
    estadoApp.solicitacaoSelecionada = null;
}

/**
 * Realiza a solicitação de troca
 */
async function realizarSolicitacaoTroca() {
    try {
        limparErro(msgErroTroca);

        const dados = {
            livroId: estadoApp.livroSelecionado,
            usuarioId: estadoApp.usuarioLogado.id
        };

        const resposta = await fazerRequisicaoPost('/request-trade', dados);

        alert('Solicitação de troca enviada com sucesso!');

        fecharModalTroca();
        await carregarSolicitacoes();
    } catch (erro) {
        exibirErro(msgErroTroca, erro.message);
    }
}

/**
 * Aceita uma solicitação de troca
 */
async function aceitarSolicitacao() {
    const solicitacao = estadoApp.solicitacaoSelecionada;
    alert(`Você aceitou a troca com ${solicitacao.nomeUsuario}! Você pode entrar em contato pelo email: ${solicitacao.emailUsuario}`);
    fecharModalResponderSolicitacao();
    await carregarSolicitacoes();
}

/**
 * Rejeita uma solicitação de troca
 */
async function rejeitarSolicitacao() {
    alert('Solicitação rejeitada.');
    fecharModalResponderSolicitacao();
    await carregarSolicitacoes();
}

// ============================================
// EVENT LISTENERS
// ============================================

// --- Navegação entre telas ---

btnIrCadastro.addEventListener('click', () => {
    mostrarTela(telaCadastro);
    limparFormulario(formLogin);
    limparErro(msgErroLogin);
});

btnVoltarLogin.addEventListener('click', () => {
    mostrarTela(telaLogin);
    limparFormulario(formCadastro);
    limparErro(msgErroCadastro);
});

btnLogout.addEventListener('click', fazerLogout);

// --- Formulários ---

formLogin.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    fazerLogin({ email, senha });
});

formCadastro.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;
    const confirmacaoSenha = document.getElementById('cadastro-confirmacao').value;
    const cidade = document.getElementById('cadastro-cidade').value;
    const bairro = document.getElementById('cadastro-bairro').value;

    fazerCadastro({
        nome,
        email,
        senha,
        confirmacaoSenha,
        cidade,
        bairro
    });
});

formCadastroLivro.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const titulo = document.getElementById('livro-titulo').value;
    const autor = document.getElementById('livro-autor').value;
    const descricao = document.getElementById('livro-descricao').value;

    cadastrarLivro({
        titulo,
        autor,
        descricao
    });
});

// --- Abas ---

abaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const abaId = btn.getAttribute('data-aba');
        mudarAba(abaId);
    });
});

// --- Modal de troca ---

fecharModal.addEventListener('click', fecharModalTroca);
fecharModalBtn.addEventListener('click', fecharModalTroca);

btnConfirmarTroca.addEventListener('click', realizarSolicitacaoTroca);

modalTroca.addEventListener('click', (evento) => {
    if (evento.target === modalTroca) {
        fecharModalTroca();
    }
});

// --- Modal de responder solicitação ---

fecharModalResposta.addEventListener('click', fecharModalResponderSolicitacao);
fecharModalRespostaBtn.addEventListener('click', fecharModalResponderSolicitacao);

btnAceitarSolicitacao.addEventListener('click', aceitarSolicitacao);
btnRejeitarSolicitacao.addEventListener('click', rejeitarSolicitacao);

modalResponderSolicitacao.addEventListener('click', (evento) => {
    if (evento.target === modalResponderSolicitacao) {
        fecharModalResponderSolicitacao();
    }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    mostrarTela(telaLogin);
});