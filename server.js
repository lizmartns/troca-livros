// ============================================
// BACKEND - APLICAÇÃO DE TROCA DE LIVROS
// Tecnologia: Node.js + Express
// Dados: Em memória (arrays)
// ============================================

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// ============================================
// DADOS EM MEMÓRIA
// ============================================

// Array de usuários registrados
let users = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@example.com',
    senha: '123456',
    cidade: 'São Paulo',
    bairro: 'Vila Mariana'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@example.com',
    senha: '123456',
    cidade: 'São Paulo',
    bairro: 'Pinheiros'
  }
];

// Array de livros disponíveis para troca
let books = [
  {
    id: 1,
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis',
    dono: 'João Silva',
    donoid: 1,
    cidade: 'São Paulo',
    bairro: 'Vila Mariana',
    descricao: 'Clássico da literatura brasileira'
  },
  {
    id: 2,
    titulo: '1984',
    autor: 'George Orwell',
    dono: 'Maria Santos',
    donoid: 2,
    cidade: 'São Paulo',
    bairro: 'Pinheiros',
    descricao: 'Ficção científica distópica'
  },
  {
    id: 3,
    titulo: 'O Cortiço',
    autor: 'Aluísio Azevedo',
    dono: 'João Silva',
    donoid: 1,
    cidade: 'São Paulo',
    bairro: 'Vila Mariana',
    descricao: 'Romance naturalista brasileiro'
  },
  {
    id: 4,
    titulo: 'O Pequeno Príncipe',
    autor: 'Antoine de Saint-Exupéry',
    dono: 'Maria Santos',
    donoid: 2,
    cidade: 'São Paulo',
    bairro: 'Pinheiros',
    descricao: 'Fábula poética para todas as idades'
  }
];

// Array de solicitações de troca
let tradeRequests = [];

// Contador para gerar IDs únicos
let nextUserId = 3;
let nextBookId = 5;
let nextTradeRequestId = 1;

// ============================================
// ROTA: POST /api/register
// Descrição: Registra um novo usuário
// ============================================

app.post('/api/register', (req, res) => {
  const { nome, email, senha, confirmacaoSenha, cidade, bairro } = req.body;

  // Validação básica
  if (!nome || !email || !senha || !confirmacaoSenha || !cidade || !bairro) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Todos os campos são obrigatórios'
    });
  }

  // Validar se as senhas coincidem
  if (senha !== confirmacaoSenha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'As senhas não coincidem'
    });
  }

  // Validar se o email já existe
  const emailExiste = users.some(user => user.email === email);
  if (emailExiste) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Este email já está registrado'
    });
  }

  // Criar novo usuário
  const novoUsuario = {
    id: nextUserId++,
    nome,
    email,
    senha,
    cidade,
    bairro
  };

  users.push(novoUsuario);

  return res.status(201).json({
    sucesso: true,
    mensagem: 'Usuário registrado com sucesso',
    usuario: {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      cidade: novoUsuario.cidade,
      bairro: novoUsuario.bairro
    }
  });
});

// ============================================
// ROTA: POST /api/login
// Descrição: Autentica um usuário
// ============================================

app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  // Validação básica
  if (!email || !senha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Email e senha são obrigatórios'
    });
  }

  // Buscar usuário pelo email
  const usuario = users.find(user => user.email === email);

  // Validar credenciais
  if (!usuario || usuario.senha !== senha) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Email ou senha incorretos'
    });
  }

  // Retornar dados do usuário (sem a senha)
  return res.status(200).json({
    sucesso: true,
    mensagem: 'Login realizado com sucesso',
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cidade: usuario.cidade,
      bairro: usuario.bairro
    }
  });
});

// ============================================
// ROTA: GET /api/books
// Descrição: Retorna livros disponíveis na mesma cidade
// Query: ?cidade=<cidade>
// ============================================

app.get('/api/books', (req, res) => {
  const { cidade } = req.query;

  // Validação
  if (!cidade) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Parâmetro "cidade" é obrigatório'
    });
  }

  // Filtrar livros pela cidade
  const livrosDaCidade = books.filter(book => book.cidade === cidade);

  return res.status(200).json({
    sucesso: true,
    livros: livrosDaCidade
  });
});

// ============================================
// ROTA: POST /api/request-trade
// Descrição: Cria uma solicitação de troca de livro
// ============================================

app.post('/api/request-trade', (req, res) => {
  const { livroId, usuarioId } = req.body;

  // Validação
  if (!livroId || !usuarioId) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'ID do livro e ID do usuário são obrigatórios'
    });
  }

  // Validar se o livro existe
  const livro = books.find(book => book.id === parseInt(livroId));
  if (!livro) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Livro não encontrado'
    });
  }

  // Validar se o usuário existe
  const usuario = users.find(user => user.id === parseInt(usuarioId));
  if (!usuario) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Usuário não encontrado'
    });
  }

  // Validar se o usuário não é o dono do livro
  if (livro.donoid === parseInt(usuarioId)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Você não pode solicitar troca do seu próprio livro'
    });
  }

  // Criar solicitação de troca
  const novaSolicitacao = {
    id: nextTradeRequestId++,
    livroId: parseInt(livroId),
    usuarioId: parseInt(usuarioId),
    nomeUsuario: usuario.nome,
    emailUsuario: usuario.email,
    tituloLivro: livro.titulo,
    donoid: livro.donoid,
    data: new Date().toISOString(),
    status: 'pendente'
  };

  tradeRequests.push(novaSolicitacao);

  return res.status(201).json({
    sucesso: true,
    mensagem: 'Solicitação de troca enviada com sucesso',
    solicitacao: novaSolicitacao
  });
});

// ============================================
// ROTA: GET /api/trade-requests
// Descrição: Retorna as solicitações de troca de um usuário
// Query: ?usuarioId=<usuarioId>
// ============================================

app.get('/api/trade-requests', (req, res) => {
  const { usuarioId } = req.query;

  // Validação
  if (!usuarioId) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Parâmetro "usuarioId" é obrigatório'
    });
  }

  // Filtrar solicitações onde o usuário é o dono do livro
  const solicitacoes = tradeRequests.filter(
    request => {
      const livro = books.find(b => b.id === request.livroId);
      return livro && livro.donoid === parseInt(usuarioId);
    }
  );

  return res.status(200).json({
    sucesso: true,
    solicitacoes
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 API de Troca de Livros ativa`);
});