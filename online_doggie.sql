-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-03-2026 a las 02:33:50
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `online_doggie`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio`) VALUES
(1, 1, 1, 1, 25000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuario_id`, `total`, `fecha`) VALUES
(1, 1, 25000.00, '2026-03-10 01:17:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `categoria`, `imagen`, `stock`, `creado_en`) VALUES
(1, 'Collar para perro ', 'Ideal para perros medianos y grandes', 25000.00, 'perros', 'collar para perros.webp', 10, '2026-03-05 20:19:10'),
(2, 'Juguete para gato pelota de tela', 'Ideal para tu mascota', 20000.00, 'gatos', 'juguete para gato pelota de tela.webp', 10, '2026-03-05 20:19:10'),
(3, 'Correa resistente para perro', 'Ideal para perros medianos y grandes', 40000.00, 'perros', 'Correa resistente para perro.webp', 10, '2026-03-05 20:19:10'),
(4, 'Arnés ajustable', 'Arnés acolchado con ajuste regulable para mayor control y comodidad.', 55000.00, 'perros', 'Arnés ajustable.webp', 10, '2026-03-05 20:19:10'),
(5, 'Collar con placa', 'Collar resistente con placa metálica para identificación segura.', 25000.00, 'perros', 'collar con placa.webp', 10, '2026-03-05 20:19:10'),
(6, 'Comedero antideslizante', 'Plato con base antideslizante que evita derrames al comer.', 30000.00, 'accesorios', 'Comedero antideslizante.webp', 10, '2026-03-05 20:19:10'),
(7, 'Cama acolchada', 'Cama suave y cómoda para el descanso perfecto de tu mascota.', 120000.00, 'accesorios', 'Cama acolchada.webp', 10, '2026-03-05 20:19:10'),
(8, 'Shampoo antipulgas', 'Limpieza profunda que protege contra pulgas y malos olores.', 35000.00, 'accesorios', 'Shampoo antipulgas.webp', 10, '2026-03-05 20:19:10'),
(9, 'Juguete mordedor', 'Mordedor resistente que fortalece los dientes y reduce el estrés.', 28000.00, 'perros', 'Juguete mordedor.webp', 10, '2026-03-05 20:19:10'),
(10, 'Pelota resistente', 'Pelota duradera ideal para juegos al aire libre.', 20000.00, 'perros', 'Pelota resistente.webp', 10, '2026-03-05 20:19:10'),
(11, 'Hueso de goma', 'Juguete flexible y seguro para entretener a tu perro.', 18000.00, 'perros', 'Hueso de goma.webp', 10, '2026-03-05 20:19:10'),
(12, 'Alimento premium (10kg)', 'Nutrición balanceada para una vida sana y activa.', 180000.00, 'perros', 'Alimento premium (10kg).webp', 10, '2026-03-05 20:19:10'),
(13, 'Snacks naturales', 'Premios saludables ideales para entrenamiento.', 22000.00, 'perros', 'Snacks naturales.webp', 10, '2026-03-05 20:19:10'),
(14, 'Transportadora', 'Transportadora segura y cómoda para viajes.', 150000.00, 'accesorios', 'Transportadora.webp', 10, '2026-03-05 20:19:10'),
(15, 'Arena para gato (5kg)', 'Arena absorbente que controla olores y facilita la limpieza.', 32000.00, 'gatos', 'Arena para gato (5kg).jpg', 10, '2026-03-05 20:19:10'),
(16, 'Arenero cerrado', 'Arenero con tapa que brinda mayor higiene y privacidad.', 85000.00, 'gatos', 'Arenero cerrado.webp', 10, '2026-03-05 20:19:10'),
(17, 'Rascador', 'Rascador resistente que protege tus muebles y entretiene a tu gato.', 95000.00, 'gatos', 'Rascador.webp', 10, '2026-03-05 20:19:10'),
(18, 'Juguete pluma', 'Juguete interactivo que estimula el instinto natural de caza.', 15000.00, 'gatos', 'Juguete pluma.webp', 10, '2026-03-05 20:19:10'),
(19, 'Collar con cascabel', 'Collar ligero con cascabel para mayor seguridad.', 18000.00, 'gatos', 'Collar con cascabel.webp', 10, '2026-03-05 20:19:10'),
(20, 'Cama tipo cueva', 'Espacio cómodo y cálido para el descanso de tu gato.', 90000.00, 'gatos', 'Cama tipo cueva.webp', 10, '2026-03-05 20:19:10'),
(21, 'Fuente de agua automática', 'Fuente con flujo constante que mantiene el agua fresca.', 140000.00, 'accesorios', 'Fuente de agua automática.webp', 10, '2026-03-05 20:19:10'),
(22, 'Comida para gato adulto (7kg)', 'Alimento balanceado para mantener su salud y energía.', 160000.00, 'gatos', 'Comida para gato adulto (7kg).webp', 10, '2026-03-05 20:19:10'),
(23, 'Comida para gatito (3kg)', 'Fórmula especial para un crecimiento fuerte y saludable.', 85000.00, 'gatos', 'Comida para gatito (3kg).webp', 10, '2026-03-05 20:19:10'),
(25, 'Juguete para gato pelota de tela', 'Ideal para tu mascota', 18000.00, 'gatos', 'juguete para gato pelota de tela.webp', 10, '2026-03-05 20:33:05'),
(26, 'Correa resistente para perro', 'Ideal para perros medianos y grandes', 40000.00, 'perros', 'Correa resistente para perro.webp', 10, '2026-03-05 20:33:05'),
(27, 'Arnés ajustable', 'Arnés acolchado con ajuste regulable para mayor control y comodidad.', 55000.00, 'perros', 'Arnés ajustable.webp', 10, '2026-03-05 20:33:05'),
(28, 'Collar con placa', 'Collar resistente con placa metálica para identificación segura.', 25000.00, 'perros', 'collar con placa.webp', 10, '2026-03-05 20:33:05'),
(29, 'Comedero antideslizante', 'Plato con base antideslizante que evita derrames al comer.', 30000.00, 'accesorios', 'Comedero antideslizante.webp', 10, '2026-03-05 20:33:05'),
(30, 'Cama acolchada', 'Cama suave y cómoda para el descanso perfecto de tu mascota.', 120000.00, 'accesorios', 'Cama acolchada.webp', 10, '2026-03-05 20:33:05'),
(31, 'Shampoo antipulgas', 'Limpieza profunda que protege contra pulgas y malos olores.', 35000.00, 'accesorios', 'Shampoo antipulgas.webp', 10, '2026-03-05 20:33:05'),
(32, 'Juguete mordedor', 'Mordedor resistente que fortalece los dientes y reduce el estrés.', 28000.00, 'perros', 'Juguete mordedor.webp', 10, '2026-03-05 20:33:05'),
(33, 'Pelota resistente', 'Pelota duradera ideal para juegos al aire libre.', 20000.00, 'perros', 'Pelota resistente.webp', 10, '2026-03-05 20:33:05'),
(34, 'Hueso de goma', 'Juguete flexible y seguro para entretener a tu perro.', 18000.00, 'perros', 'Hueso de goma.webp', 10, '2026-03-05 20:33:05'),
(35, 'Alimento premium (10kg)', 'Nutrición balanceada para una vida sana y activa.', 180000.00, 'perros', 'Alimento premium (10kg).webp', 10, '2026-03-05 20:33:05'),
(36, 'Snacks naturales', 'Premios saludables ideales para entrenamiento.', 22000.00, 'perros', 'Snacks naturales.webp', 10, '2026-03-05 20:33:05'),
(37, 'Transportadora', 'Transportadora segura y cómoda para viajes.', 150000.00, 'accesorios', 'Transportadora.webp', 10, '2026-03-05 20:33:05'),
(38, 'Arena para gato (5kg)', 'Arena absorbente que controla olores y facilita la limpieza.', 32000.00, 'gatos', 'Arena para gato (5kg).jpg', 10, '2026-03-05 20:33:05'),
(39, 'Arenero cerrado', 'Arenero con tapa que brinda mayor higiene y privacidad.', 85000.00, 'gatos', 'Arenero cerrado.webp', 10, '2026-03-05 20:33:05'),
(40, 'Rascador', 'Rascador resistente que protege tus muebles y entretiene a tu gato.', 95000.00, 'gatos', 'Rascador.webp', 10, '2026-03-05 20:33:05'),
(41, 'Juguete pluma', 'Juguete interactivo que estimula el instinto natural de caza.', 15000.00, 'gatos', 'Juguete pluma.webp', 10, '2026-03-05 20:33:05'),
(42, 'Collar con cascabel', 'Collar ligero con cascabel para mayor seguridad.', 18000.00, 'gatos', 'Collar con cascabel.webp', 10, '2026-03-05 20:33:05'),
(43, 'Cama tipo cueva', 'Espacio cómodo y cálido para el descanso de tu gato.', 90000.00, 'gatos', 'Cama tipo cueva.webp', 10, '2026-03-05 20:33:05'),
(44, 'Fuente de agua automática', 'Fuente con flujo constante que mantiene el agua fresca.', 140000.00, 'accesorios', 'Fuente de agua automática.webp', 10, '2026-03-05 20:33:05'),
(45, 'Comida para gato adulto (7kg)', 'Alimento balanceado para mantener su salud y energía.', 160000.00, 'gatos', 'Comida para gato adulto (7kg).webp', 10, '2026-03-05 20:33:05'),
(46, 'Comida para gatito (3kg)', 'Fórmula especial para un crecimiento fuerte y saludable.', 85000.00, 'gatos', 'Comida para gatito (3kg).webp', 10, '2026-03-05 20:33:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(20) DEFAULT 'usuario',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `creado_en`) VALUES
(1, 'Emmanuel', 'Emma@gmail.com', '$2b$10$BaYEUXw/OpYGKBaQR7d5ruxydx9KyXL30MObVBdryqIbh29lGsGcG', 'usuario', '2026-03-09 23:10:42'),
(2, 'Admin', 'Admin@gmail.com', '$2b$10$8FeSpr7WRoVobVhAe0UKCe2EObJqWScFSHZrahiRkWHiFsAXyo.1u', 'admin', '2026-03-09 23:49:54');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
