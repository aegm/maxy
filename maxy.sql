/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50527
Source Host           : localhost:3306
Source Database       : maxy

Target Server Type    : MYSQL
Target Server Version : 50527
File Encoding         : 65001

Date: 2013-01-16 16:14:05
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `categoria_productos`
-- ----------------------------
DROP TABLE IF EXISTS `categoria_productos`;
CREATE TABLE `categoria_productos` (
  `id_categoria` int(10) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of categoria_productos
-- ----------------------------
INSERT INTO `categoria_productos` VALUES ('1', 'Ropa');
INSERT INTO `categoria_productos` VALUES ('2', 'Calzado');

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
  KEY `Relationship37` (`id_persona`)
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
-- Table structure for `formularios`
-- ----------------------------
DROP TABLE IF EXISTS `formularios`;
CREATE TABLE `formularios` (
  `id` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `accion` varchar(50) NOT NULL DEFAULT 'form_process.php',
  `metodo` varchar(4) NOT NULL DEFAULT 'post',
  `tipo` varchar(40) NOT NULL DEFAULT 'application/x-www-form-urlencoded',
  `clase` varchar(20) NOT NULL DEFAULT 'form',
  `form` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of formularios
-- ----------------------------
INSERT INTO `formularios` VALUES ('frm_agregar', 'Agregar de Productos', 'form_process.php', 'post', 'application/x-www-form-urlencoded', 'form', 'agregar-producto');
INSERT INTO `formularios` VALUES ('frm_filtro', 'Busqueda de Productos', 'form_process.php', 'post', 'application/x-www-form-urlencoded', 'form', 'filtro-producto');

-- ----------------------------
-- Table structure for `formularios_adicional`
-- ----------------------------
DROP TABLE IF EXISTS `formularios_adicional`;
CREATE TABLE `formularios_adicional` (
  `id_adicional` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_campo` int(10) unsigned NOT NULL,
  `id` varchar(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL,
  `class` varchar(100) NOT NULL,
  `value` varchar(50) NOT NULL,
  `deshabilitado` int(1) NOT NULL DEFAULT '0',
  `orden` int(2) NOT NULL,
  PRIMARY KEY (`id_adicional`),
  KEY `formularios_adicional_ibfk_1` (`id_campo`),
  CONSTRAINT `formularios_adicional_ibfk_1` FOREIGN KEY (`id_campo`) REFERENCES `formularios_campos` (`id_campo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of formularios_adicional
-- ----------------------------

-- ----------------------------
-- Table structure for `formularios_botones`
-- ----------------------------
DROP TABLE IF EXISTS `formularios_botones`;
CREATE TABLE `formularios_botones` (
  `id_boton` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_formulario` varchar(50) NOT NULL,
  `id` varchar(50) NOT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'submit',
  `nombre` varchar(50) NOT NULL,
  `class` varchar(50) NOT NULL DEFAULT 'gg-button',
  `deshabilitado` int(1) NOT NULL,
  `orden` int(2) NOT NULL,
  PRIMARY KEY (`id_boton`),
  KEY `formularios_botones_ibfk_1` (`id_formulario`),
  CONSTRAINT `formularios_botones_ibfk_1` FOREIGN KEY (`id_formulario`) REFERENCES `formularios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of formularios_botones
-- ----------------------------
INSERT INTO `formularios_botones` VALUES ('1', 'frm_filtro', 'Filtrar', 'button', 'Buscar', 'gg-button', '0', '1');
INSERT INTO `formularios_botones` VALUES ('2', 'frm_filtro', 'agregar', 'button', 'Agregar Nuevo', 'gg-button', '0', '2');
INSERT INTO `formularios_botones` VALUES ('3', 'frm_filtro', 'limpiar', 'reset', 'Limpiar', 'gg-button', '0', '3');
INSERT INTO `formularios_botones` VALUES ('4', 'frm_agregar', 'btn_agregar', 'submit', 'Agregar Nuevo', 'gg-button', '0', '1');

-- ----------------------------
-- Table structure for `formularios_campos`
-- ----------------------------
DROP TABLE IF EXISTS `formularios_campos`;
CREATE TABLE `formularios_campos` (
  `id_campo` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_formulario` varchar(50) NOT NULL,
  `tipo` varchar(20) NOT NULL DEFAULT 'text',
  `legend` varchar(50) NOT NULL,
  `id` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL,
  `label` varchar(50) NOT NULL,
  `value` varchar(100) NOT NULL,
  `clase` varchar(200) NOT NULL DEFAULT 'text',
  `info` varchar(50) NOT NULL,
  `obligatorio` int(1) NOT NULL,
  `deshabilitado` int(1) NOT NULL,
  `solo_lectura` int(1) NOT NULL,
  `orden` int(2) NOT NULL,
  `datos` varchar(50) NOT NULL,
  `datos_value` varchar(20) NOT NULL,
  PRIMARY KEY (`id_campo`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of formularios_campos
-- ----------------------------
INSERT INTO `formularios_campos` VALUES ('1', 'frm_filtro', 'select', 'FILTRO DE BUSQUEDA', 'slt_categoria', 'slt_categoria', 'categoria', ' ', 'text vobli', ' ', '1', '0', '0', '1', 'categoria_productos', 'id_categoria');
INSERT INTO `formularios_campos` VALUES ('2', 'frm_filtro', 'select', 'FILTRO DE BUSQUEDA', 'slt_producto', 'slt_producto', 'Productos', ' ', 'text vobli', ' ', '1', '0', '0', '2', '', '');
INSERT INTO `formularios_campos` VALUES ('3', 'frm_agregar', 'select', 'DATOS DEL  PRODUCTO', 'slt_categoria', 'slt_categoria', 'categoria', ' ', 'text vobli', ' ', '1', '0', '0', '1', 'categoria_productos', 'id_categoria');
INSERT INTO `formularios_campos` VALUES ('4', 'frm_agregar', 'text', 'DATOS DEL  PRODUCTO', 'txt_producto', 'txt_producto', 'producto', '', 'text vobli', 'Nombre del Producto', '1', '0', '0', '2', 'categoria_productos', 'id_categoria');
INSERT INTO `formularios_campos` VALUES ('5', 'frm_agregar', 'text', 'DATOS DEL  PRODUCTO', 'txt_costo', 'txt_costo', 'Costo', '', 'text vobli', 'Costo del Producto', '1', '0', '0', '3', '', '');
INSERT INTO `formularios_campos` VALUES ('6', 'frm_agregar', 'select', 'DATOS DEL  PRODUCTO', 'slt_talla', 'slt_talla', 'Talla', '', 'text vobli', 'Talla del Producto', '1', '0', '0', '4', 'tallas', 'id_talla');
INSERT INTO `formularios_campos` VALUES ('7', 'frm_agregar', 'text', 'DATOS DEL  PRODUCTO', 'txt_color', 'txt_color', 'Color', '', 'text vobli', 'Color del Producto ', '1', '0', '0', '5', '', '');
INSERT INTO `formularios_campos` VALUES ('8', 'frm_agregar', 'hidden', 'DATOS DEL  PRODUCTO', 'form', 'form', '', 'agregar-producto', 'text vobli', ' ', '1', '0', '0', '5', '', '');
INSERT INTO `formularios_campos` VALUES ('9', 'frm_agregar', 'text', 'DATOS DEL  PRODUCTO', 'txt_cod_pro', 'txt_cod_pro', 'Codigo', '', 'text vobli', 'Codigo del producto', '1', '0', '0', '5', '', '');

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of menu
-- ----------------------------
INSERT INTO `menu` VALUES ('2', '3', 'menu_bienvenidos', '', 'ADMINISTRADOR', 'admin/administrar.php', '', '2', '0', '1');
INSERT INTO `menu` VALUES ('3', '4', 'menu_tienda', '', 'TIENDA', 'admin/tienda.php', '', '1', '0', '1');

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
-- Table structure for `productos`
-- ----------------------------
DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `id_producto` int(10) NOT NULL AUTO_INCREMENT,
  `id_categoria` int(10) DEFAULT NULL,
  `cod_producto` int(20) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `id_costo` int(10) DEFAULT NULL,
  PRIMARY KEY (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of productos
-- ----------------------------
INSERT INTO `productos` VALUES ('20', '1', '2', 'asd', '1000');

-- ----------------------------
-- Table structure for `producto_talla`
-- ----------------------------
DROP TABLE IF EXISTS `producto_talla`;
CREATE TABLE `producto_talla` (
  `id_producto` int(10) NOT NULL,
  `id_talla` int(10) NOT NULL,
  PRIMARY KEY (`id_producto`,`id_talla`),
  KEY `Relationship16` (`id_talla`),
  CONSTRAINT `Relationship16` FOREIGN KEY (`id_talla`) REFERENCES `tallas` (`id_talla`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Relationship15` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of producto_talla
-- ----------------------------

-- ----------------------------
-- Table structure for `tallas`
-- ----------------------------
DROP TABLE IF EXISTS `tallas`;
CREATE TABLE `tallas` (
  `id_talla` int(10) NOT NULL AUTO_INCREMENT,
  `nombre` int(2) NOT NULL,
  PRIMARY KEY (`id_talla`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tallas
-- ----------------------------
INSERT INTO `tallas` VALUES ('1', '2');
INSERT INTO `tallas` VALUES ('2', '3');
INSERT INTO `tallas` VALUES ('3', '4');
INSERT INTO `tallas` VALUES ('4', '5');

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of usuarios_accesos
-- ----------------------------
INSERT INTO `usuarios_accesos` VALUES ('1', 'BIENVENIDOS', '2211');
INSERT INTO `usuarios_accesos` VALUES ('2', 'SALIR', '2211');
INSERT INTO `usuarios_accesos` VALUES ('3', 'PRODUCTOS', '2222');
INSERT INTO `usuarios_accesos` VALUES ('4', 'TIENDA', '2222');

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
INSERT INTO `usuarios_grupos_permisos` VALUES ('2', '4', '2222');

-- ----------------------------
-- View structure for `vmenu`
-- ----------------------------
DROP VIEW IF EXISTS `vmenu`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vmenu` AS select `menu`.`id_menu` AS `id_menu`,`usuarios_grupos`.`id_grupo` AS `id_grupo`,`usuarios_accesos`.`id_acceso` AS `id_acceso`,`usuarios_grupos`.`nombre` AS `grupo`,`usuarios_grupos_permisos`.`seguridad` AS `grupo_seguridad`,`usuarios_accesos`.`nombre` AS `acceso`,`usuarios_accesos`.`seguridad` AS `acceso_seguridad`,`menu`.`id` AS `id`,`menu`.`clase` AS `clase`,`menu`.`nombre` AS `nombre`,`menu`.`url` AS `url`,`menu`.`orden` AS `orden`,`menu`.`tipo` AS `tipo`,`menu`.`session` AS `session`,`menu`.`target` AS `target` from (((`menu` join `usuarios_grupos_permisos` on((`menu`.`id_acceso` = `usuarios_grupos_permisos`.`id_acceso`))) join `usuarios_grupos` on((`usuarios_grupos_permisos`.`id_grupo` = `usuarios_grupos`.`id_grupo`))) join `usuarios_accesos` on((`usuarios_grupos_permisos`.`id_acceso` = `usuarios_accesos`.`id_acceso`))) ;

-- ----------------------------
-- View structure for `vuser`
-- ----------------------------
DROP VIEW IF EXISTS `vuser`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vuser` AS (select `persona`.`id_persona` AS `id_persona`,`usuarios_grupos`.`id_grupo` AS `id_grupo`,`persona`.`id_grupo` AS `id_grupo_persona`,`persona`.`identificacion` AS `identificacion`,`persona`.`nombre` AS `nombre`,`persona`.`apellido` AS `apellido`,`usuarios_grupos`.`nombre` AS `grupo`,`usuario`.`usuario` AS `usuario`,`usuario`.`clave` AS `clave`,`usuario`.`estatus` AS `estatus`,`persona`.`correo` AS `correo` from ((`usuario` join `usuarios_grupos` on((`usuario`.`id_grupo` = `usuarios_grupos`.`id_grupo`))) join `persona` on((`usuario`.`id_persona` = `persona`.`id_persona`)))) ;

-- ----------------------------
-- View structure for `vusuarios`
-- ----------------------------
DROP VIEW IF EXISTS `vusuarios`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vusuarios` AS select `u`.`id_persona` AS `id_persona`,`u`.`id_grupo` AS `id_grupo`,`p`.`identificacion` AS `identificacion`,`p`.`nombre` AS `nombre`,`p`.`apellido` AS `apellido`,`g`.`nombre` AS `grupo`,`u`.`usuario` AS `usuario`,`u`.`clave` AS `clave`,`p`.`correo` AS `correo` from ((`usuario` `u` join `persona` `p`) join `usuarios_grupos` `g`) where ((`p`.`id_persona` = `u`.`id_persona`) and (`u`.`id_grupo` = `g`.`id_grupo`)) ;
