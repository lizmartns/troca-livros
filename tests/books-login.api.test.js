// tests/api/books-login.api.test.js

const request = require('supertest');
const app = require('../../server'); // ajuste o caminho se seu arquivo tiver outro nome

describe('API - /api/login e /api/books', () => {
  // IMPORTANTE:
  // Esses testes assumem que você tem usuários seedados,
  // como joao@example.com / 123456 na memória.

  describe('POST /api/login', () => {
    test('deve fazer login com sucesso com credenciais válidas', async () => {
      const credenciais = {
        email: 'joao@example.com',
        senha: '123456'
      };

      const res = await request(app)
        .post('/api/login')
        .send(credenciais)
        .expect(200);

      expect(res.body.sucesso).toBe(true);
      expect(res.body.usuario).toBeDefined();
      expect(res.body.usuario.email).toBe('joao@example.com');
    });

    test('deve retornar 401 para credenciais inválidas', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'joao@example.com',
          senha: 'senha-errada'
        })
        .expect(401);

      expect(res.body.sucesso).toBe(false);
      expect(res.body.mensagem).toMatch(/Email ou senha incorretos/i);
    });

    test('deve retornar 400 quando faltar email ou senha', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: 'joao@example.com' }) // sem senha
        .expect(400);

      expect(res.body.sucesso).toBe(false);
      expect(res.body.mensagem).toMatch(/obrigatórios/i);
    });
  });

  describe('GET /api/books', () => {
    test('deve listar livros da cidade informada', async () => {
      const res = await request(app)
        .get('/api/books')
        .query({ cidade: 'São Paulo' })
        .expect(200);

      expect(res.body.sucesso).toBe(true);
      expect(Array.isArray(res.body.livros)).toBe(true);

      if (res.body.livros.length > 0) {
        expect(res.body.livros[0]).toHaveProperty('titulo');
        expect(res.body.livros[0]).toHaveProperty('cidade', 'São Paulo');
      }
    });

    test('deve retornar lista vazia para cidade sem livros', async () => {
      const res = await request(app)
        .get('/api/books')
        .query({ cidade: 'CidadeQueNaoExiste' })
        .expect(200);

      expect(res.body.sucesso).toBe(true);
      expect(res.body.livros.length).toBe(0);
    });

    test('deve retornar 400 se o parâmetro cidade não for enviado', async () => {
      const res = await request(app)
        .get('/api/books')
        .expect(400);

      expect(res.body.sucesso).toBe(false);
      expect(res.body.mensagem).toMatch(/cidade/i);
    });
  });
});
