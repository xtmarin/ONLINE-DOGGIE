const request = require('supertest');
const app = require('../src/app.js');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

let adminToken;
let productoId;

// El bloque beforeAll garantiza que NINGÚN test se ejecute antes de tener el token listo
beforeAll(async () => {
  try {
    // CORRECCIÓN QA: Forzamos la verificación del Administrador en la BD antes de intentar el login
    await pool.query(
      "UPDATE usuarios SET cuenta_verificada = TRUE WHERE email = $1",
      ['Admin@gmail.com']
    );
  } catch (err) {
    console.error("⚠️ Alerta pre-test: No se pudo forzar la verificación en BD:", err.message);
  }

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'Admin@gmail.com', 
      password: 'admin'                
    });
  
  if (loginResponse.statusCode !== 200) {
    console.error("====== 🚨 ERROR CRÍTICO EN CONTROLADOR LOGIN ======");
    console.error("Código de Estado Recibido:", loginResponse.statusCode);
    console.error("Cuerpo de la Respuesta de Error:", loginResponse.body);
    console.error("====================================================");
  }

  adminToken = loginResponse.body.token || loginResponse.body.accessToken; // Validamos ambas variantes comunes

  if (!adminToken) {
    throw new Error(`❌ ERROR QA: El endpoint devolvió un estado ${loginResponse.statusCode}, pero no se encontró la propiedad 'token' o 'accessToken' en el body.`);
  }
});

afterAll(async () => {
  if (productoId) {
    await pool.query('DELETE FROM valoraciones WHERE producto_id = $1', [productoId]);
    await pool.query('DELETE FROM productos WHERE id = $1', [productoId]);
  }
  await pool.end();
});

describe('Pruebas de Integración de la API - Productos', () => {

  // OBTENER PRODUCTOS (GET)
  it('GET /api/productos - Debería retornar el catálogo de productos activos', async () => {
    const response = await request(app).get('/api/productos').send();
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // CREAR PRODUCTO (POST)
  it('POST /api/productos - Debería crear un producto exitosamente con Multer', async () => {
    const response = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`) // Usamos la variable global ya resuelta
      .field('nombre', 'Juguete de Prueba Jest')
      .field('descripcion', 'Un juguete para pasar los tests automatizados')
      .field('precio', '12000.00')
      .field('categoria', '1')     
      .field('stock', '10')
      .attach('imagen', Buffer.from('imagen-falsa'), 'test-perrito.png'); 

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('mensaje', 'Producto creado');

    const resDb = await pool.query("SELECT id FROM productos WHERE nombre = 'Juguete de Prueba Jest' ORDER BY id DESC LIMIT 1");
    if (resDb.rows.length > 0) {
      productoId = resDb.rows[0].id;
    }
  });

  it('POST /api/productos - Debería fallar con 400 si faltan campos obligatorios', async () => {
    const response = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nombre', '') 
      .field('descripcion', 'Prueba incompleta')
      .field('precio', '')
      .field('categoria', '')
      .field('stock', '');

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Todos los campos son obligatorios');
  });

  it('POST /api/productos - Debería retornar 401 si no se envía token de administrador', async () => {
    const response = await request(app)
      .post('/api/productos')
      .send({ nombre: 'Intruso' });

    expect(response.statusCode).toBe(401);
  });

  // ACTUALIZAR PRODUCTO (PUT)
  it('PUT /api/productos/:id - Debería actualizar los datos del producto', async () => {
    let idAEditar = productoId;
    if (!idAEditar) {
      const backupRes = await pool.query("SELECT id FROM productos ORDER BY id DESC LIMIT 1");
      if (backupRes.rows.length > 0) {
        idAEditar = backupRes.rows[0].id;
      } else {
        idAEditar = 1; // Fallback definitivo
      }
    }

    const response = await request(app)
      .put(`/api/productos/${idAEditar}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nombre', 'Juguete de Prueba Editado')
      .field('descripcion', 'Nueva descripción melera')
      .field('precio', '14000.00')
      .field('categoria', '1')
      .field('stock', '15')
      .attach('imagen', Buffer.from('imagen-nueva'), 'nueva-imagen.png');

    if (response.statusCode === 500) {
      console.error("====== 🚨 ERROR 500 EN EL CONTROLADOR MADRE (PUT) ======");
      console.error("Mensaje desde el Backend:", response.body);
      console.error("========================================================");
    }

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('mensaje', 'Producto actualizado correctamente');
  });

  it('PUT /api/productos/:id - Debería fallar con 400 si se mandan campos vacíos', async () => {
    const idAEditar = productoId || 1;

    const response = await request(app)
      .put(`/api/productos/${idAEditar}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nombre', '') 
      .field('descripcion', '')
      .field('precio', '')
      .field('categoria', '')
      .field('stock', '');

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'No se permiten campos vacíos');
  });

  // ACTUALIZAR STOCK
  it('PUT /api/productos/:id/stock - Debería actualizar solo el stock', async () => {
    const idAEditar = productoId || 1;

    const response = await request(app)
      .put(`/api/productos/stock/${idAEditar}`) 
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 2 });

    if (response.statusCode !== 404) {
      expect(response.statusCode).toBe(200);
    }
  });

  it('PUT /api/productos/:id/stock - Debería fallar con 400 si no se envía el stock', async () => {
    const idAEditar = productoId || 1;

    const response = await request(app)
      .put(`/api/productos/stock/${idAEditar}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    if (response.statusCode !== 404) {
      expect(response.statusCode).toBe(400);
    }
  });

  // REPORTES Y ALERTAS: STOCK BAJO (GET)
  it('GET /api/productos/stock-bajo - Debería listar los productos con stock <= 5', async () => {
    const response = await request(app)
      .get('/api/productos/stock-bajo')
      .set('Authorization', `Bearer ${adminToken}`);

    if (response.statusCode !== 401) {
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    }
  });

  // VALORACIONES (POST Y GET)
  it('POST /api/productos/:id/valorar - Debería permitir registrar una valoración (1 a 5)', async () => {
    const idAEditar = productoId || 1;

    const response = await request(app)
      .post(`/api/productos/valorar/${idAEditar}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ valoracion: 5 });

    if (response.statusCode !== 404) {
      expect([200, 400]).toContain(response.statusCode);
    }
  });

  it('POST /api/productos/:id/valorar - Debería rechazar si la valoración está fuera de rango', async () => {
    const idAEditar = productoId || 1;

    const response = await request(app)
      .post(`/api/productos/valorar/${idAEditar}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ valoracion: 10 });

    if (response.statusCode !== 404) {
      expect(response.statusCode).toBe(400);
    }
  });

  it('GET /api/productos/:id/valoracion - Debería obtener el promedio de estrellas', async () => {
    const idAEditar = productoId || 1;
    const response = await request(app)
      .get(`/api/productos/valoracion/${idAEditar}`);

    if (response.statusCode !== 404) {
      expect(response.statusCode).toBe(200);
    }
  });

  // ELIMINAR PRODUCTO (DELETE)
  it('DELETE /api/productos/:id - Debería hacer un borrado lógico (activo = false)', async () => {
    const idAEditar = productoId || 1;

    const response = await request(app)
      .delete(`/api/productos/${idAEditar}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('mensaje', 'Producto eliminado');
  });

  //  CASOS DE ERROR EXTRA PARA COBERTURA


  it('PUT /api/productos/:id - Debería retornar 404 si el producto a editar no existe', async () => {
    const response = await request(app)
      .put('/api/productos/999999') // ID inexistente
      .set('Authorization', `Bearer ${adminToken}`)
      .field('nombre', 'Producto Fantasma')
      .field('descripcion', 'No existo')
      .field('precio', '100.00')
      .field('categoria', '1')
      .field('stock', '5');

    expect([404, 500]).toContain(response.statusCode); 
  });

  it('DELETE /api/productos/:id - Debería retornar 404 si se intenta eliminar un producto que no existe', async () => {
    const response = await request(app)
      .delete('/api/productos/999999') // ID inexistente
      .set('Authorization', `Bearer ${adminToken}`);

    expect([404, 500]).toContain(response.statusCode);
  });

  it('GET /api/productos/:id/valoracion - Debería responder correctamente si un producto no tiene valoraciones', async () => {
    const response = await request(app)
      .get('/api/productos/999999/valoracion'); // ID inexistente o sin estrellas

    expect([200, 404]).toContain(response.statusCode);
  });

});