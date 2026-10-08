import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/setup.js';

const valid = { sku: 'TALADRO-01', name: 'Taladro 1/2"', price: 499.99, stock: 5, category: 'herramientas' };

describe('Products API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /products → 200 con la colección', async () => {
    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(res.body).toHaveLength(3);
  });

  it('GET /products/1 → 200; /999 → 404; /abc → 400', async () => {
    await request(app.getHttpServer()).get('/products/1').expect(200);
    const notFound = await request(app.getHttpServer()).get('/products/999').expect(404);
    expect(notFound.body.message).toEqual(['No existe un producto con id 999']);
    await request(app.getHttpServer()).get('/products/abc').expect(400);
  });

  it('POST válido → 201 y SKU repetido → 409', async () => {
    const res = await request(app.getHttpServer()).post('/products').send(valid).expect(201);
    expect(res.body).toMatchObject({ id: 4, ...valid });
    await request(app.getHttpServer()).post('/products').send(valid).expect(409);
  });

  it('POST inválido → 400 con mensajes y forma consistente', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .send({ ...valid, price: -5, stock: '3', extra: true })
      .expect(400);
    expect(res.body).toMatchObject({ statusCode: 400, error: 'Bad Request', path: '/products' });
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        'property extra should not exist',
        'price debe ser mayor que 0',
        'stock debe ser un número entero',
      ]),
    );
  });

  it('POST sin campos requeridos → 400', async () => {
    const res = await request(app.getHttpServer()).post('/products').send({}).expect(400);
    expect(res.body.message).toEqual(expect.arrayContaining(['name es obligatorio']));
  });

  it('PATCH parcial → 200 y conserva los demás campos', async () => {
    const res = await request(app.getHttpServer()).patch('/products/1').send({ stock: 7 }).expect(200);
    expect(res.body).toMatchObject({ id: 1, sku: 'MART-016', name: 'Martillo de uña 16 oz', stock: 7 });
  });

  it('PATCH vacío → 400; SKU de otro → 409; inexistente → 404', async () => {
    await request(app.getHttpServer()).patch('/products/1').send({}).expect(400);
    await request(app.getHttpServer()).patch('/products/1').send({ sku: 'CABLE-12' }).expect(409);
    await request(app.getHttpServer()).patch('/products/999').send({ stock: 1 }).expect(404);
  });

  it('DELETE → 204 sin cuerpo y luego 404', async () => {
    const res = await request(app.getHttpServer()).delete('/products/2').expect(204);
    expect(res.text).toBe('');
    await request(app.getHttpServer()).delete('/products/2').expect(404);
  });

  it('CORS solo permite el origen del frontend', async () => {
    const res = await request(app.getHttpServer())
      .get('/products')
      .set('Origin', 'http://localhost:5173')
      .expect(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
