const productosController = require('../src/controllers/productos.controller');
const pool = require('../src/config/db');

jest.mock('../src/config/db', () => ({
    query: jest.fn()
}));

describe('Productos Controller Extra', () => {

    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    describe('crearProducto', () => {

        it('debe retornar 400 si faltan campos', async () => {

            req.body = {
                nombre: '',
                precio: 100
            };

            await productosController.crearProducto(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('debe crear producto correctamente', async () => {

            pool.query.mockResolvedValue({
                rows: [{ id: 1 }]
            });

            req.body = {
                nombre: 'Dog Food',
                descripcion: 'Premium',
                precio: 100,
                stock: 10,
                imagen_url: 'img.jpg'
            };

            await productosController.crearProducto(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('debe manejar error del servidor', async () => {

    pool.query.mockRejectedValue(new Error('DB Error'));

    req.body = {
        nombre: 'Dog Food',
        descripcion: 'Premium',
        precio: 100,
        stock: 10,
        imagen_url: 'img.jpg',
        categoria: 'Comida'
    };

    await productosController.crearProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
});
    });

    describe('obtenerProductos', () => {

        it('debe obtener productos', async () => {

            pool.query.mockResolvedValue({
                rows: [
                    { id: 1, nombre: 'Dog Food' }
                ]
            });

            await productosController.obtenerProductos(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('debe manejar errores al obtener productos', async () => {

            pool.query.mockRejectedValue(new Error('DB Error'));

            await productosController.obtenerProductos(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('eliminarProducto', () => {

        it('debe retornar 404 si producto no existe', async () => {

            pool.query.mockResolvedValue({
                rowCount: 0
            });

            req.params.id = 1;

            await productosController.eliminarProducto(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('debe eliminar producto correctamente', async () => {

            pool.query.mockResolvedValue({
                rowCount: 1
            });

            req.params.id = 1;

            await productosController.eliminarProducto(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        it('debe manejar errores al eliminar', async () => {

            pool.query.mockRejectedValue(new Error('DB Error'));

            req.params.id = 1;

            await productosController.eliminarProducto(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

});