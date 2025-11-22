// ============================================
// TESTES DE REGRESSÃO - BACKEND
// Tecnologia: Jest + Supertest
// ============================================

const request = require('supertest');
const express = require('express');
const cors = require('cors');

// ============================================
// SETUP DO SERVIDOR PARA TESTES
// ============================================

// Criamos uma cópia do servidor apenas para testes
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Dados em memória (resetados para cada teste)
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
  }
];

let tradeRequests = [];

let nextUserId = 3;
let nextBookId = 3;
let nextTradeRequestId = 1;

// ============================================
// ROTAS DO SERVIDOR
// ============================================

// POST /api/register
app.post('/api/register', (req, res) => {
  const { nome, email, senha, confirmacaoSenha, cidade, bairro } = req.body;

  if (!nome || !email || !senha || !confirmacaoSenha || !cidade || !bairro) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Todos os campos são obrigatórios'
    });
  }

  if (senha !== confirmacaoSenha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'As senhas não coincidem'
    });
  }

  const emailExiste = users.some(user => user.email === email);
  if (emailExiste) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Este email já está registrado'
    });
  }

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

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Email e senha são obrigatórios'
    });
  }

  const usuario = users.find(user => user.email === email);

  if (!usuario || usuario.senha !== senha) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Email ou senha incorretos'
    });
  }

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

// POST /api/books
app.post('/api/books', (req, res) => {
  const { titulo, autor, descricao, donoid } = req.body;

  if (!titulo || !autor || !descricao || !donoid) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Título, autor, descrição e ID do dono são obrigatórios'
    });
  }

  const dono = users.find(user => user.id === parseInt(donoid));
  if (!dono) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Dono do livro não encontrado'
    });
  }

  const novoLivro = {
    id: nextBookId++,
    titulo,
    autor,
    dono: dono.nome,
    donoid: dono.id,
    cidade: dono.cidade,
    bairro: dono.bairro,
    descricao
  };

  books.push(novoLivro);

  return res.status(201).json({
    sucesso: true,
    mensagem: 'Livro cadastrado com sucesso',
    livro: novoLivro
  });
});

// GET /api/books
app.get('/api/books', (req, res) => {
  const { cidade } = req.query;

  if (!cidade) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Parâmetro "cidade" é obrigatório'
    });
  }

  const livrosDaCidade = books.filter(book => book.cidade === cidade);

  return res.status(200).json({
    sucesso: true,
    livros: livrosDaCidade
  });
});

// POST /api/request-trade
app.post('/api/request-trade', (req, res) => {
  const { livroId, usuarioId } = req.body;

  if (!livroId || !usuarioId) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'ID do livro e ID do usuário são obrigatórios'
    });
  }

  const livro = books.find(book => book.id === parseInt(livroId));
  if (!livro) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Livro não encontrado'
    });
  }

  const usuario = users.find(user => user.id === parseInt(usuarioId));
  if (!usuario) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Usuário não encontrado'
    });
  }

  if (livro.donoid === parseInt(usuarioId)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Você não pode solicitar troca do seu próprio livro'
    });
  }

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

// GET /api/trade-requests
app.get('/api/trade-requests', (req, res) => {
  const { usuarioId } = req.query;

  if (!usuarioId) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Parâmetro "usuarioId" é obrigatório'
    });
  }

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
// TESTES DE REGRESSÃO
// ============================================

describe('Testes de Regressão - API de Troca de Livros', () => {

  // ============================================
  // TESTES: POST /api/register
  // ============================================

  describe('POST /api/register - Cadastro de Usuário', () => {

    test('Deve registrar um novo usuário com sucesso', async () => {
      const novoUsuario = {
        nome: 'Pedro Costa',
        email: 'pedro@example.com',
        senha: 'senha123',
        confirmacaoSenha: 'senha123',
        cidade: 'São Paulo',
        bairro: 'Centro'
      };

      const response = await request(app)
        .post('/api/register')
        .send(novoUsuario)
        .expect(201);

      expect(response.body.sucesso).toBe(true);
      expect(response.body.usuario.nome).toBe('Pedro Costa');
      expect(response.body.usuario.email).toBe('pedro@example.com');
      expect(response.body.usuario.id).toBeDefined();
    });

    test('Deve retornar erro ao tentar registrar com senhas diferentes', async () => {
      const usuarioInvalido = {
        nome: 'Ana Silva',
        email: 'ana@example.com',
        senha: 'senha123',
        confirmacaoSenha: 'senha456',
        cidade: 'São Paulo',
        bairro: 'Centro'
      };

      const response = await request(app)
        .post('/api/register')
        .send(usuarioInvalido)
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('senhas não coincidem');
    });

    test('Deve retornar erro ao tentar registrar com email já existente', async () => {
      const usuarioDuplicado = {
        nome: 'Outro João',
        email: 'joao@example.com',
        senha: 'senha123',
        confirmacaoSenha: 'senha123',
        cidade: 'São Paulo',
        bairro: 'Centro'
      };

      const response = await request(app)
        .post('/api/register')
        .send(usuarioDuplicado)
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('email já está registrado');
    });

    test('Deve retornar erro ao tentar registrar com campos faltando', async () => {
      const usuarioIncompleto = {
        nome: 'Carlos',
        email: 'carlos@example.com'
        // Faltam: senha, confirmacaoSenha, cidade, bairro
      };

      const response = await request(app)
        .post('/api/register')
        .send(usuarioIncompleto)
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('obrigatórios');
    });
  });

  // ============================================
  // TESTES: POST /api/login
  // ============================================

  describe('POST /api/login - Autenticação de Usuário', () => {

    test('Deve fazer login com credenciais válidas', async () => {
      const credenciais = {
        email: 'joao@example.com',
        senha: '123456'
      };

      const response = await request(app)
        .post('/api/login')
        .send(credenciais)
        .expect(200);

      expect(response.body.sucesso).toBe(true);
      expect(response.body.usuario.nome).toBe('João Silva');
      expect(response.body.usuario.id).toBe(1);
    });

    test('Deve retornar erro com email incorreto', async () => {
      const credenciais = {
        email: 'emailinexistente@example.com',
        senha: '123456'
      };

      const response = await request(app)
        .post('/api/login')
        .send(credenciais)
        .expect(401);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('Email ou senha incorretos');
    });

    test('Deve retornar erro com senha incorreta', async () => {
      const credenciais = {
        email: 'joao@example.com',
        senha: 'senhaerrada'
      };

      const response = await request(app)
        .post('/api/login')
        .send(credenciais)
        .expect(401);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('Email ou senha incorretos');
    });

    test('Deve retornar erro quando faltam email ou senha', async () => {
      const credenciais = {
        email: 'joao@example.com'
        // Falta: senha
      };

      const response = await request(app)
        .post('/api/login')
        .send(credenciais)
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('obrigatórios');
    });
  });

  // ============================================
  // TESTES: POST /api/books
  // ============================================

  describe('POST /api/books - Cadastro de Livro', () => {

    test('Deve cadastrar um novo livro com sucesso', async () => {
      const novoLivro = {
        titulo: 'O Cortiço',
        autor: 'Aluísio Azevedo',
        descricao: 'Romance naturalista',
        donoid: 1
      };

      const response = await request(app)
        .post('/api/books')
        .send(novoLivro)
        .expect(201);

      expect(response.body.sucesso).toBe(true);
      expect(response.body.livro.titulo).toBe('O Cortiço');
      expect(response.body.livro.dono).toBe('João Silva');
      expect(response.body.livro.donoid).toBe(1);
    });

    test('Deve retornar erro ao cadastrar livro com campos faltando', async () => {
      const livroIncompleto = {
        titulo: 'Livro Teste',
        autor: 'Autor Teste'
        // Faltam: descricao, donoid
      };

      const response = await request(app)
        .post('/api/books')
        .send(livroIncompleto)
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('obrigatórios');
    });

    test('Deve retornar erro ao cadastrar livro com donoid inválido', async () => {
      const livroComDonoInvalido = {
        titulo: 'Livro Teste',
        autor: 'Autor Teste',
        descricao: 'Descrição teste',
        donoid: 9999
      };

      const response = await request(app)
        .post('/api/books')
        .send(livroComDonoInvalido)
        .expect(404);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('Dono do livro não encontrado');
    });
  });

  // ============================================
  // TESTES: GET /api/books
  // ============================================

  describe('GET /api/books - Listar Livros por Cidade', () => {

    test('Deve retornar livros de uma cidade específica', async () => {
      const response = await request(app)
        .get('/api/books?cidade=São Paulo')
        .expect(200);

      expect(response.body.sucesso).toBe(true);
      expect(Array.isArray(response.body.livros)).toBe(true);
      expect(response.body.livros.length).toBeGreaterThan(0);
      expect(response.body.livros[0].cidade).toBe('São Paulo');
    });

    test('Deve retornar lista vazia para cidade sem livros', async () => {
      const response = await request(app)
        .get('/api/books?cidade=Rio de Janeiro')
        .expect(200);

      expect(response.body.sucesso).toBe(true);
      expect(response.body.livros.length).toBe(0);
    });

    test('Deve retornar erro quando parâmetro cidade está faltando', async () => {
      const response = await request(app)
        .get('/api/books')
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('cidade');
    });
  });

  // ============================================
  // TESTES: POST /api/request-trade
  // ============================================

  describe('POST /api/request-trade - Solicitar Troca de Livro', () => {

    test('Deve criar uma solicitação de troca com sucesso', async () => {
      const solicitacao = {
        livroId: 1,
        usuarioId: 2
      };

      const response = await request(app)
        .post('/api/request-trade')
        .send(solicitacao)
        .expect(201);

      expect(response.body.sucesso).toBe(true);
      expect(response.body.solicitacao.livroId).toBe(1);
      expect(response.body.solicitacao.usuarioId).toBe(2);
      expect(response.body.solicitacao.status).toBe('pendente');
    });

    test('Deve retornar erro ao solicitar troca do próprio livro', async () => {
      const solicitacao = {
        livroId: 1,
        usuarioId: 1 // Mesmo dono do livro
      };

      const response = await request(app)
        .post('/api/request-trade')
        .send(solicitacao)
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('seu próprio livro');
    });

    test('Deve retornar erro ao solicitar livro inexistente', async () => {
      const solicitacao = {
        livroId: 9999,
        usuarioId: 2
      };

      const response = await request(app)
        .post('/api/request-trade')
        .send(solicitacao)
        .expect(404);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('Livro não encontrado');
    });

    test('Deve retornar erro ao solicitar com usuário inexistente', async () => {
      const solicitacao = {
        livroId: 1,
        usuarioId: 9999
      };

      const response = await request(app)
        .post('/api/request-trade')
        .send(solicitacao)
        .expect(404);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('Usuário não encontrado');
    });

    test('Deve retornar erro quando faltam parâmetros', async () => {
      const solicitacao = {
        livroId: 1
        // Falta: usuarioId
      };

      const response = await request(app)
        .post('/api/request-trade')
        .send(solicitacao)
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('obrigatórios');
    });
  });

  // ============================================
  // TESTES: GET /api/trade-requests
  // ============================================

  describe('GET /api/trade-requests - Listar Solicitações Recebidas', () => {

    test('Deve retornar solicitações de um usuário', async () => {
      // Primeiro, criar uma solicitação
      await request(app)
        .post('/api/request-trade')
        .send({ livroId: 1, usuarioId: 2 });

      // Depois, recuperar as solicitações
      const response = await request(app)
        .get('/api/trade-requests?usuarioId=1')
        .expect(200);

      expect(response.body.sucesso).toBe(true);
      expect(Array.isArray(response.body.solicitacoes)).toBe(true);
      expect(response.body.solicitacoes.length).toBeGreaterThan(0);
    });

    test('Deve retornar lista vazia se não há solicitações', async () => {
      const response = await request(app)
        .get('/api/trade-requests?usuarioId=2')
        .expect(200);

      expect(response.body.sucesso).toBe(true);
      expect(response.body.solicitacoes.length).toBe(0);
    });

    test('Deve retornar erro quando usuarioId está faltando', async () => {
      const response = await request(app)
        .get('/api/trade-requests')
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toContain('usuarioId');
    });
  });

  // ============================================
  // TESTES DE INTEGRAÇÃO
  // ============================================

  describe('Testes de Integração - Fluxo Completo', () => {

    test('Deve executar fluxo completo: registrar, login, cadastrar livro, solicitar troca', async () => {
      // 1. Registrar novo usuário
      const novoUsuario = {
        nome: 'Lucas Oliveira',
        email: 'lucas@example.com',
        senha: 'senha123',
        confirmacaoSenha: 'senha123',
        cidade: 'São Paulo',
        bairro: 'Consolação'
      };

      const registroResponse = await request(app)
        .post('/api/register')
        .send(novoUsuario)
        .expect(201);

      const novoUsuarioId = registroResponse.body.usuario.id;

      // 2. Fazer login com o novo usuário
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'lucas@example.com',
          senha: 'senha123'
        })
        .expect(200);

      expect(loginResponse.body.usuario.id).toBe(novoUsuarioId);

      // 3. Cadastrar um livro para o novo usuário
      const novoLivro = {
        titulo: 'O Alienista',
        autor: 'Machado de Assis',
        descricao: 'Novela de Machado de Assis',
        donoid: novoUsuarioId
      };

      const livroResponse = await request(app)
        .post('/api/books')
        .send(novoLivro)
        .expect(201);

      const novoLivroId = livroResponse.body.livro.id;

      // 4. Outro usuário solicita troca do livro
      const solicitacaoResponse = await request(app)
        .post('/api/request-trade')
        .send({
          livroId: novoLivroId,
          usuarioId: 1
        })
        .expect(201);

      expect(solicitacaoResponse.body.solicitacao.status).toBe('pendente');

      // 5. Verificar se o proprietário recebeu a solicitação
      const solicitacoesResponse = await request(app)
        .get(`/api/trade-requests?usuarioId=${novoUsuarioId}`)
        .expect(200);

      expect(solicitacoesResponse.body.solicitacoes.length).toBeGreaterThan(0);
    });
  });
});