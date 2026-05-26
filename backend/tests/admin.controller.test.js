// tests/auth.controller.test.js

const authController = require('../src/controllers/auth.controller');
const pool = require('../src/config/db');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/db');

jest.mock('../src/utils/security', () => ({
    hashPassword: jest.fn(() => Promise.resolve('hashedPassword')),
    verifyPassword: jest.fn(),
    createToken: jest.fn(() => 'token_generado')
}));

const {
    hashPassword,
    verifyPassword,
    createToken
} = require('../src/utils/security');

describe('Auth Controller', () => {

    let req;
    let res;

    beforeEach(() => {

        req = {
            body: {},
            usuario: {
                id: 1
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        process.env.JWT_SECRET = 'testsecret';
        process.env.NODE_ENV = 'test';

        jest.spyOn(console, 'error').mockImplementation(() => {});

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('registro', () => {

        it('debería retornar 400 si faltan campos', async () => {

            req.body = {};

            await authController.registro(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                mensaje: 'Todos los campos son obligatorios'
            });
        });

        it('debería retornar 400 si el email es inválido', async () => {

            req.body = {
                nombre: 'Emmanuel',
                email: 'correo_malo',
                password: '12345678',
                direccion: 'test'
            };

            await authController.registro(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                mensaje: 'Formato de correo inválido'
            });
        });

        it('debería retornar 400 si password es corta', async () => {

            req.body = {
                nombre: 'Emmanuel',
                email: 'test@test.com',
                password: '123',
                direccion: 'test'
            };

            await authController.registro(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('debería retornar 400 si usuario ya existe', async () => {

            req.body = {
                nombre: 'Emmanuel',
                email: 'test@test.com',
                password: '12345678',
                direccion: 'test'
            };

            pool.query.mockResolvedValue({
                rows: [{ id: 1 }]
            });

            await authController.registro(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                mensaje: 'El usuario ya existe'
            });
        });

        it('debería registrar usuario correctamente', async () => {

            req.body = {
                nombre: 'Emmanuel',
                email: 'test@test.com',
                password: '12345678',
                direccion: 'test'
            };

            pool.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({});

            await authController.registro(req, res);

            expect(hashPassword).toHaveBeenCalled();

            expect(res.json).toHaveBeenCalled();

        });

    });

    describe('verificarCuenta', () => {

        it('debería retornar 400 si faltan datos', async () => {

            req.body = {};

            await authController.verificarCuenta(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('debería retornar 404 si usuario no existe', async () => {

            req.body = {
                email: 'test@test.com',
                codigo: '123456'
            };

            pool.query.mockResolvedValue({
                rows: []
            });

            await authController.verificarCuenta(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('debería retornar 400 si cuenta ya verificada', async () => {

            req.body = {
                email: 'test@test.com',
                codigo: '123456'
            };

            pool.query.mockResolvedValue({
                rows: [{
                    cuenta_verificada: true
                }]
            });

            await authController.verificarCuenta(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('debería retornar 401 si código incorrecto', async () => {

            req.body = {
                email: 'test@test.com',
                codigo: '111111'
            };

            pool.query.mockResolvedValue({
                rows: [{
                    cuenta_verificada: false,
                    codigo_verificacion: '999999'
                }]
            });

            await authController.verificarCuenta(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('debería verificar cuenta correctamente', async () => {

            req.body = {
                email: 'test@test.com',
                codigo: '123456'
            };

            pool.query
                .mockResolvedValueOnce({
                    rows: [{
                        id: 1,
                        cuenta_verificada: false,
                        codigo_verificacion: '123456',
                        verificacion_expira: new Date(Date.now() + 50000)
                    }]
                })
                .mockResolvedValueOnce({});

            await authController.verificarCuenta(req, res);

            expect(res.json).toHaveBeenCalledWith({
                mensaje: 'Cuenta verificada exitosamente. ¡Ya puedes iniciar sesión!'
            });
        });

    });

    describe('login', () => {

        it('debería retornar 400 si faltan campos', async () => {

            req.body = {};

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('debería retornar 404 si usuario no existe', async () => {

            req.body = {
                email: 'test@test.com',
                password: '12345678'
            };

            pool.query.mockResolvedValue({
                rows: []
            });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('debería retornar 403 si cuenta no verificada', async () => {

            req.body = {
                email: 'test@test.com',
                password: '12345678'
            };

            pool.query.mockResolvedValue({
                rows: [{
                    cuenta_verificada: false
                }]
            });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('debería retornar 401 si password incorrecta', async () => {

            req.body = {
                email: 'test@test.com',
                password: '12345678'
            };

            pool.query.mockResolvedValue({
                rows: [{
                    cuenta_verificada: true,
                    password: 'hash'
                }]
            });

            verifyPassword.mockResolvedValue(false);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('debería hacer login correctamente', async () => {

            req.body = {
                email: 'test@test.com',
                password: '12345678'
            };

            pool.query.mockResolvedValue({
                rows: [{
                    id: 1,
                    nombre: 'Emmanuel',
                    rol: 'cliente',
                    cuenta_verificada: true,
                    dos_fa_activa: false,
                    password: 'hash'
                }]
            });

            verifyPassword.mockResolvedValue(true);

            await authController.login(req, res);

            expect(createToken).toHaveBeenCalled();

            expect(res.json).toHaveBeenCalledWith({
                mensaje: 'Login exitoso',
                token: 'token_generado',
                usuario: {
                    id: 1,
                    nombre: 'Emmanuel',
                    rol: 'cliente'
                }
            });
        });

    });

    describe('verificar2FA', () => {

        it('debería retornar 400 si faltan datos', async () => {

            req.body = {};

            await authController.verificar2FA(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('debería retornar 401 si token temporal inválido', async () => {

            req.body = {
                codigo: '123456',
                tokenTemporal: 'token_fake'
            };

            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                throw new Error('Token inválido');
            });

            await authController.verificar2FA(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });

    });

    describe('recuperarPassword', () => {

        it('debería retornar 400 si falta email', async () => {

            req.body = {};

            await authController.recuperarPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('debería retornar 404 si usuario no existe', async () => {

            req.body = {
                email: 'test@test.com'
            };

            pool.query.mockResolvedValue({
                rows: []
            });

            await authController.recuperarPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

    });

    describe('obtenerPerfil', () => {

        it('debería retornar 404 si usuario no existe', async () => {

            pool.query.mockResolvedValue({
                rows: []
            });

            await authController.obtenerPerfil(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

    });

    describe('editarPerfil', () => {

        it('debería retornar 400 si faltan datos', async () => {

            req.body = {};

            await authController.editarPerfil(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('debería actualizar perfil correctamente', async () => {

            req.body = {
                nombre: 'Nuevo',
                email: 'nuevo@test.com',
                direccion: 'direccion'
            };

            pool.query.mockResolvedValue({});

            await authController.editarPerfil(req, res);

            expect(res.json).toHaveBeenCalledWith({
                mensaje: 'Perfil actualizado correctamente'
            });
        });

    });

    describe('cambiarPassword', () => {

        it('debería retornar 400 si faltan datos', async () => {

            req.body = {};

            await authController.cambiarPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('debería retornar 401 si password actual incorrecta', async () => {

            req.body = {
                passwordActual: '12345678',
                passwordNueva: '87654321'
            };

            pool.query.mockResolvedValue({
                rows: [{
                    password: 'hash'
                }]
            });

            verifyPassword.mockResolvedValue(false);

            await authController.cambiarPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });

    });

});