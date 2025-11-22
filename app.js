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
    livroSelecionado: null
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

// Botões de navegação
const btnIrCadastro = document.getElementById('btn-ir-cadastro');
const btnVoltarLogin = document.getElementById('btn-voltar-login');
const btnLogout = document.getElementById('btn-logout');

// Elementos de mensagem
const msgErroLogin = document.getElementById('msg-erro-login');
const msgErroCadastro = document.getElementById('msg-erro-cadastro');
const msgErroTroca = document.getElementById('msg-erro-troca');

// Home
const nomeUsuario = document.getElementById('nome-usuario');
const infoLocalizacao = document.getElementById('info-localizacao');
const listaLivros = document.getElementById('lista-livros');

// Modal
const modalTroca = document.getElementById('modal-troca');
const fecharModal = document.querySelector('.fechar-modal');
const fecharModalBtn = document.querySelector('.fechar-modal-btn');
const btnConfirmarTroca = document.getElementById('btn-confirmar-troca');
const modalInfoLivro = document.getElementById('modal-info-livro');
const modalInfoDono = document.getElementById('modal-info-dono');

// ============================================
// FUNÇÕES DE NAVEGAÇÃO ENTRE TELAS
// ============================================

/**
 * Exibe uma tela e esconde as outras
 * @param {HTMLElement} tela - Elemento da tela a ser exibida
 */
function mostrarTela(tela) {
    // Esconde todas as telas
    document.querySelectorAll('.tela').forEach(t => {
        t.classList.remove('ativa');
    });

    // Mostra a tela desejada
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

        // Salva dados do usuário no estado
        estadoApp.usuarioLogado = resposta.usuario;

        // Atualiza a tela home com dados do usuário
        atualizarTelaHome();

        // Carrega os livros
        await carregarLivros();

        // Mostra a tela home
        mostrarTela(telaHome);

        // Limpa o formulário
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

        // Mostra mensagem de sucesso
        alert('Cadastro realizado com sucesso! Faça login para continuar.');

        // Volta para a tela de login
        mostrarTela(telaLogin);

        // Limpa o formulário
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
 * Renderiza os livros na tela
 * @param {array} livros - Array de livros
 */
function renderizarLivros(livros) {
    if (livros.length === 0) {
        listaLivros.innerHTML = '<div class="carregando">Nenhum livro disponível no momento.</div>';
        return;
    }

    listaLivros.innerHTML = livros.map(livro => `
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
 * Atualiza a tela home com dados do usuário logado
 */
function atualizarTelaHome() {
    const usuario = estadoApp.usuarioLogado;
    nomeUsuario.textContent = usuario.nome;
    infoLocalizacao.textContent = `📍 ${usuario.bairro}, ${usuario.cidade}`;
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

        // Mostra mensagem de sucesso
        alert('Solicitação de troca enviada com sucesso!');

        // Fecha o modal
        fecharModalTroca();
    } catch (erro) {
        exibirErro(msgErroTroca, erro.message);
    }
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

// --- Modal ---

fecharModal.addEventListener('click', fecharModalTroca);
fecharModalBtn.addEventListener('click', fecharModalTroca);

btnConfirmarTroca.addEventListener('click', realizarSolicitacaoTroca);

// Fecha o modal ao clicar fora dele
modalTroca.addEventListener('click', (evento) => {
    if (evento.target === modalTroca) {
        fecharModalTroca();
    }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    mostrarTela(telaLogin);
});