/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50527
Source Host           : localhost:3306
Source Database       : maxy

Target Server Type    : MYSQL
Target Server Version : 50527
File Encoding         : 65001

Date: 2013-01-10 16:07:38
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `activador`
-- ----------------------------
DROP TABLE IF EXISTS `activador`;
CREATE TABLE `activador` (
  `activador` varchar(2) NOT NULL,
  `id_entrada_persona` int(4) NOT NULL,
  `id_entrada_producto` int(10) NOT NULL,
  `id_entrada_conexion` int(10) NOT NULL,
  PRIMARY KEY (`id_entrada_persona`,`id_entrada_producto`,`id_entrada_conexion`),
  KEY `Relationship47` (`id_entrada_producto`),
  KEY `Relationship48` (`id_entrada_conexion`),
  CONSTRAINT `Relationship46` FOREIGN KEY (`id_entrada_persona`) REFERENCES `entrada_persona` (`id_entrada_persona`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship47` FOREIGN KEY (`id_entrada_producto`) REFERENCES `entrada_producto` (`id_entrada_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship48` FOREIGN KEY (`id_entrada_conexion`) REFERENCES `entrada_conexion` (`id_entrada_conexion`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of activador
-- ----------------------------

-- ----------------------------
-- Table structure for `categoria_productos`
-- ----------------------------
DROP TABLE IF EXISTS `categoria_productos`;
CREATE TABLE `categoria_productos` (
  `id_categoria` int(10) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of categoria_productos
-- ----------------------------

-- ----------------------------
-- Table structure for `ciudad`
-- ----------------------------
DROP TABLE IF EXISTS `ciudad`;
CREATE TABLE `ciudad` (
  `id_ciudad` int(10) NOT NULL,
  `id_estado` int(10) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_ciudad`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_ciudad_estado` (`id_estado`),
  CONSTRAINT `estados_ciudades` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of ciudad
-- ----------------------------
INSERT INTO `ciudad` VALUES ('1', '1', 'Valencia');

-- ----------------------------
-- Table structure for `colores`
-- ----------------------------
DROP TABLE IF EXISTS `colores`;
CREATE TABLE `colores` (
  `id_color` int(10) NOT NULL AUTO_INCREMENT,
  `color_rgb` varchar(20) DEFAULT NULL,
  `color_web` varchar(20) NOT NULL,
  `id_producto` int(10) DEFAULT NULL,
  PRIMARY KEY (`id_color`),
  KEY `Relationship28` (`id_producto`),
  CONSTRAINT `Relationship28` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of colores
-- ----------------------------

-- ----------------------------
-- Table structure for `costos`
-- ----------------------------
DROP TABLE IF EXISTS `costos`;
CREATE TABLE `costos` (
  `id_costo` int(10) NOT NULL AUTO_INCREMENT,
  `costo` decimal(20,2) NOT NULL,
  PRIMARY KEY (`id_costo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of costos
-- ----------------------------

-- ----------------------------
-- Table structure for `entrada_conexion`
-- ----------------------------
DROP TABLE IF EXISTS `entrada_conexion`;
CREATE TABLE `entrada_conexion` (
  `id_persona` int(10) DEFAULT NULL,
  `id_entrada_conexion` int(10) NOT NULL,
  `ip` char(20) NOT NULL,
  PRIMARY KEY (`id_entrada_conexion`),
  KEY `Relationship38` (`id_persona`),
  CONSTRAINT `Relationship38` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of entrada_conexion
-- ----------------------------

-- ----------------------------
-- Table structure for `entrada_persona`
-- ----------------------------
DROP TABLE IF EXISTS `entrada_persona`;
CREATE TABLE `entrada_persona` (
  `id_entrada_persona` int(4) NOT NULL,
  `id_persona` int(10) DEFAULT NULL,
  `usuario` int(15) DEFAULT NULL,
  `id_color` int(10) DEFAULT NULL,
  `fecha_entrada` date NOT NULL,
  PRIMARY KEY (`id_entrada_persona`),
  KEY `Relationship30` (`id_persona`,`usuario`),
  KEY `Relationship31` (`id_color`),
  CONSTRAINT `Relationship30` FOREIGN KEY (`id_persona`, `usuario`) REFERENCES `usuario` (`id_persona`, `usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship31` FOREIGN KEY (`id_color`) REFERENCES `colores` (`id_color`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of entrada_persona
-- ----------------------------

-- ----------------------------
-- Table structure for `entrada_producto`
-- ----------------------------
DROP TABLE IF EXISTS `entrada_producto`;
CREATE TABLE `entrada_producto` (
  `id_entrada_producto` int(10) NOT NULL,
  `id_producto` int(10) DEFAULT NULL,
  `id_categoria` int(10) DEFAULT NULL,
  `id_marca` int(10) DEFAULT NULL,
  `id_talla` int(10) DEFAULT NULL,
  `id_color` int(10) DEFAULT NULL,
  `id_persona` int(10) DEFAULT NULL,
  PRIMARY KEY (`id_entrada_producto`),
  KEY `Relationship32` (`id_producto`),
  KEY `Relationship33` (`id_categoria`),
  KEY `Relationship34` (`id_marca`),
  KEY `Relationship35` (`id_talla`),
  KEY `Relationship36` (`id_color`),
  KEY `Relationship37` (`id_persona`),
  CONSTRAINT `Relationship32` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship33` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_productos` (`id_categoria`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship34` FOREIGN KEY (`id_marca`) REFERENCES `marcas` (`id_marca`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship35` FOREIGN KEY (`id_talla`) REFERENCES `tallas` (`id_talla`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship36` FOREIGN KEY (`id_color`) REFERENCES `colores` (`id_color`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship37` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of entrada_producto
-- ----------------------------

-- ----------------------------
-- Table structure for `estado`
-- ----------------------------
DROP TABLE IF EXISTS `estado`;
CREATE TABLE `estado` (
  `id_estado` int(10) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `idx_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of estado
-- ----------------------------
INSERT INTO `estado` VALUES ('1', 'Carabobo');

-- ----------------------------
-- Table structure for `marcas`
-- ----------------------------
DROP TABLE IF EXISTS `marcas`;
CREATE TABLE `marcas` (
  `id_marca` int(10) NOT NULL,
  `nombre` varchar(40) NOT NULL,
  PRIMARY KEY (`id_marca`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of marcas
-- ----------------------------

-- ----------------------------
-- Table structure for `menu`
-- ----------------------------
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `id_menu` int(10) NOT NULL AUTO_INCREMENT,
  `id_acceso` int(10) DEFAULT NULL,
  `id` varchar(20) DEFAULT NULL,
  `clase` varchar(20) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `url` varchar(100) DEFAULT NULL,
  `target` varchar(20) DEFAULT NULL,
  `orden` int(2) DEFAULT NULL,
  `tipo` int(1) DEFAULT NULL,
  `session` int(1) DEFAULT NULL,
  PRIMARY KEY (`id_menu`),
  KEY `idx_orden_tipo` (`orden`,`tipo`),
  KEY `idx_menu_acceso` (`id_acceso`),
  CONSTRAINT `Relationship8` FOREIGN KEY (`id_acceso`) REFERENCES `usuarios_accesos` (`id_acceso`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of menu
-- ----------------------------
INSERT INTO `menu` VALUES ('2', '3', 'menu_bienvenidos', '', 'ADMINISTRADOR', 'admin/administrar.php', '', '1', '0', '1');

-- ----------------------------
-- Table structure for `persona`
-- ----------------------------
DROP TABLE IF EXISTS `persona`;
CREATE TABLE `persona` (
  `id_persona` int(10) NOT NULL AUTO_INCREMENT,
  `id_estado` int(10) DEFAULT NULL,
  `id_ciudad` int(10) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) NOT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `fecha_creacion` date NOT NULL,
  `identificacion` varchar(20) DEFAULT NULL,
  `id_grupo` int(10) DEFAULT NULL,
  PRIMARY KEY (`id_persona`),
  KEY `idx_identificacion` (`identificacion`),
  KEY `idx_persona_ciudad` (`id_ciudad`),
  KEY `idx_persona_estado` (`id_estado`),
  KEY `idx_persona_grupo` (`id_grupo`),
  CONSTRAINT `fk_persona_ciudad` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudad` (`id_ciudad`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_persona_estado` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship9` FOREIGN KEY (`id_grupo`) REFERENCES `usuarios_grupos` (`id_grupo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of persona
-- ----------------------------
INSERT INTO `persona` VALUES ('1', '1', null, 'Yatzeli', 'Camacho', null, 'yasury_c@hotmail.com', '2012-11-29', '17030621', '2');

-- ----------------------------
-- Table structure for `pesos`
-- ----------------------------
DROP TABLE IF EXISTS `pesos`;
CREATE TABLE `pesos` (
  `id_entrada_persona` int(4) NOT NULL,
  `id_entrada_producto` int(10) NOT NULL,
  `id_entrada_conexion` int(10) NOT NULL,
  `peso_persona` int(3) NOT NULL DEFAULT '0',
  `peso_producto` int(3) NOT NULL DEFAULT '0',
  `peso_categoria` int(3) NOT NULL DEFAULT '0',
  `peso_marca` int(3) NOT NULL DEFAULT '0',
  `peso_talla` int(3) NOT NULL DEFAULT '0',
  `peso_color` int(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_entrada_persona`,`id_entrada_producto`,`id_entrada_conexion`),
  KEY `Relationship41` (`id_entrada_producto`),
  KEY `Relationship42` (`id_entrada_conexion`),
  CONSTRAINT `Relationship39` FOREIGN KEY (`id_entrada_persona`) REFERENCES `entrada_persona` (`id_entrada_persona`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship41` FOREIGN KEY (`id_entrada_producto`) REFERENCES `entrada_producto` (`id_entrada_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship42` FOREIGN KEY (`id_entrada_conexion`) REFERENCES `entrada_conexion` (`id_entrada_conexion`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of pesos
-- ----------------------------

-- ----------------------------
-- Table structure for `productos`
-- ----------------------------
DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `id_producto` int(10) NOT NULL AUTO_INCREMENT,
  `id_categoria` int(10) DEFAULT NULL,
  `cod_producto` int(20) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `id_marca` int(10) DEFAULT NULL,
  `id_costo` int(10) DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `Relationship10` (`id_categoria`),
  KEY `Relationship18` (`id_marca`),
  KEY `Relationship20` (`id_costo`),
  CONSTRAINT `Relationship10` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_productos` (`id_categoria`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship18` FOREIGN KEY (`id_marca`) REFERENCES `marcas` (`id_marca`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship20` FOREIGN KEY (`id_costo`) REFERENCES `costos` (`id_costo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of productos
-- ----------------------------

-- ----------------------------
-- Table structure for `promociones`
-- ----------------------------
DROP TABLE IF EXISTS `promociones`;
CREATE TABLE `promociones` (
  `id_promocion` int(10) NOT NULL AUTO_INCREMENT,
  `id_producto` int(10) DEFAULT NULL,
  `promocion` int(2) NOT NULL,
  PRIMARY KEY (`id_promocion`),
  KEY `Relationship23` (`id_producto`),
  CONSTRAINT `Relationship23` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of promociones
-- ----------------------------

-- ----------------------------
-- Table structure for `tallas`
-- ----------------------------
DROP TABLE IF EXISTS `tallas`;
CREATE TABLE `tallas` (
  `id_talla` int(10) NOT NULL AUTO_INCREMENT,
  `nombre` int(2) NOT NULL,
  `id_producto` int(10) DEFAULT NULL,
  PRIMARY KEY (`id_talla`),
  KEY `Relationship27` (`id_producto`),
  CONSTRAINT `Relationship27` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tallas
-- ----------------------------

-- ----------------------------
-- Table structure for `usuario`
-- ----------------------------
DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_persona` int(10) NOT NULL,
  `id_grupo` int(10) DEFAULT NULL,
  `usuario` int(15) NOT NULL,
  `clave` varchar(20) DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL,
  `estatus` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id_persona`,`usuario`),
  UNIQUE KEY `idx_usuario` (`usuario`),
  KEY `idx_usuario_grupo` (`id_grupo`),
  KEY `idx_usuario_persona` (`id_persona`),
  CONSTRAINT `Relationship5` FOREIGN KEY (`id_grupo`) REFERENCES `usuarios_grupos` (`id_grupo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `usuarios_ibp` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of usuario
-- ----------------------------
INSERT INTO `usuario` VALUES ('1', '2', '17030621', '1234', '2012-11-29', '1');

-- ----------------------------
-- Table structure for `usuarios_accesos`
-- ----------------------------
DROP TABLE IF EXISTS `usuarios_accesos`;
CREATE TABLE `usuarios_accesos` (
  `id_acceso` int(10) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `seguridad` int(4) DEFAULT NULL,
  PRIMARY KEY (`id_acceso`),
  KEY `idx_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of usuarios_accesos
-- ----------------------------
INSERT INTO `usuarios_accesos` VALUES ('1', 'BIENVENIDOS', '2211');
INSERT INTO `usuarios_accesos` VALUES ('2', 'SALIR', '2211');
INSERT INTO `usuarios_accesos` VALUES ('3', 'PRODUCTOS', '2222');

-- ----------------------------
-- Table structure for `usuarios_config`
-- ----------------------------
DROP TABLE IF EXISTS `usuarios_config`;
CREATE TABLE `usuarios_config` (
  `id_persona` int(10) unsigned NOT NULL,
  `grado` int(2) NOT NULL,
  `leccion_actual` int(10) NOT NULL,
  `datos_actualizados` varchar(1) NOT NULL DEFAULT '0',
  `id_profesor_seleccionado` int(10) unsigned DEFAULT NULL,
  `id_escuela` int(10) unsigned DEFAULT NULL,
  `id_libro` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_persona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of usuarios_config
-- ----------------------------

-- ----------------------------
-- Table structure for `usuarios_grupos`
-- ----------------------------
DROP TABLE IF EXISTS `usuarios_grupos`;
CREATE TABLE `usuarios_grupos` (
  `id_grupo` int(10) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_grupo`),
  KEY `idx_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of usuarios_grupos
-- ----------------------------
INSERT INTO `usuarios_grupos` VALUES ('2', 'ADMINISTRADOR');
INSERT INTO `usuarios_grupos` VALUES ('1', 'INVITADO');

-- ----------------------------
-- Table structure for `usuarios_grupos_permisos`
-- ----------------------------
DROP TABLE IF EXISTS `usuarios_grupos_permisos`;
CREATE TABLE `usuarios_grupos_permisos` (
  `id_grupo` int(10) NOT NULL,
  `id_acceso` int(10) NOT NULL,
  `seguridad` int(4) DEFAULT NULL,
  PRIMARY KEY (`id_grupo`,`id_acceso`),
  KEY `idx_grupos_permisos_accesos` (`id_acceso`),
  CONSTRAINT `Relationship6` FOREIGN KEY (`id_grupo`) REFERENCES `usuarios_grupos` (`id_grupo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship7` FOREIGN KEY (`id_acceso`) REFERENCES `usuarios_accesos` (`id_acceso`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of usuarios_grupos_permisos
-- ----------------------------
INSERT INTO `usuarios_grupos_permisos` VALUES ('2', '1', '2211');
INSERT INTO `usuarios_grupos_permisos` VALUES ('2', '2', '2222');
INSERT INTO `usuarios_grupos_permisos` VALUES ('2', '3', '2222');

-- ----------------------------
-- View structure for `vmenu`
-- ----------------------------
DROP VIEW IF EXISTS `vmenu`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vmenu` AS select `menu`.`id_menu` AS `id_menu`,`usuarios_grupos`.`id_grupo` AS `id_grupo`,`usuarios_accesos`.`id_acceso` AS `id_acceso`,`usuarios_grupos`.`nombre` AS `grupo`,`usuarios_grupos_permisos`.`seguridad` AS `grupo_seguridad`,`usuarios_accesos`.`nombre` AS `acceso`,`usuarios_accesos`.`seguridad` AS `acceso_seguridad`,`menu`.`id` AS `id`,`menu`.`clase` AS `clase`,`menu`.`nombre` AS `nombre`,`menu`.`url` AS `url`,`menu`.`orden` AS `orden`,`menu`.`tipo` AS `tipo`,`menu`.`session` AS `session`,`menu`.`target` AS `target` from (((`menu` join `usuarios_grupos_permisos` on((`menu`.`id_acceso` = `usuarios_grupos_permisos`.`id_acceso`))) join `usuarios_grupos` on((`usuarios_grupos_permisos`.`id_grupo` = `usuarios_grupos`.`id_grupo`))) join `usuarios_accesos` on((`usuarios_grupos_permisos`.`id_acceso` = `usuarios_accesos`.`id_acceso`))) ;

-- ----------------------------
-- View structure for `vuser`
-- ----------------------------
DROP VIEW IF EXISTS `vuser`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vuser` AS (select `persona`.`id_persona` AS `id_persona`,`usuarios_grupos`.`id_grupo` AS `id_grupo`,`persona`.`id_grupo` AS `id_grupo_persona`,`persona`.`identificacion` AS `identificacion`,`persona`.`nombre` AS `nombre`,`persona`.`apellido` AS `apellido`,`usuarios_grupos`.`nombre` AS `grupo`,`usuario`.`usuario` AS `usuario`,`usuario`.`clave` AS `clave`,`usuarios_config`.`grado` AS `grado`,`usuarios_config`.`leccion_actual` AS `leccion_actual`,`usuarios_config`.`datos_actualizados` AS `datos_actualizados`,`usuario`.`estatus` AS `estatus`,`persona`.`correo` AS `correo` from (((`usuario` join `usuarios_grupos` on((`usuario`.`id_grupo` = `usuarios_grupos`.`id_grupo`))) join `persona` on((`usuario`.`id_persona` = `persona`.`id_persona`))) left join `usuarios_config` on((`persona`.`id_persona` = `usuarios_config`.`id_persona`)))) ;

-- ----------------------------
-- View structure for `vusuarios`
-- ----------------------------
DROP VIEW IF EXISTS `vusuarios`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vusuarios` AS select `u`.`id_persona` AS `id_persona`,`u`.`id_grupo` AS `id_grupo`,`p`.`identificacion` AS `identificacion`,`p`.`nombre` AS `nombre`,`p`.`apellido` AS `apellido`,`g`.`nombre` AS `grupo`,`u`.`usuario` AS `usuario`,`u`.`clave` AS `clave`,`p`.`correo` AS `correo` from ((`usuario` `u` join `persona` `p`) join `usuarios_grupos` `g`) where ((`p`.`id_persona` = `u`.`id_persona`) and (`u`.`id_grupo` = `g`.`id_grupo`)) ;
