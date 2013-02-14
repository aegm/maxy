/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50527
Source Host           : localhost:3306
Source Database       : maxy

Target Server Type    : MYSQL
Target Server Version : 50527
File Encoding         : 65001

Date: 2013-02-14 16:25:35
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
-- Table structure for `codigo_productos`
-- ----------------------------
DROP TABLE IF EXISTS `codigo_productos`;
CREATE TABLE `codigo_productos` (
  `codigo_producto` varchar(5) DEFAULT NULL,
  `id_item` int(10) NOT NULL,
  PRIMARY KEY (`id_item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of codigo_productos
-- ----------------------------
INSERT INTO `codigo_productos` VALUES ('00011', '11');
INSERT INTO `codigo_productos` VALUES ('00012', '12');

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
INSERT INTO `formularios` VALUES ('frm_producto_item', 'Busqueda de Productos', 'form_process.php', 'post', 'application/x-www-form-urlencoded', 'form', 'producto-item');

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of formularios_botones
-- ----------------------------
INSERT INTO `formularios_botones` VALUES ('1', 'frm_filtro', 'Filtrar', 'button', 'Buscar', 'gg-button', '0', '1');
INSERT INTO `formularios_botones` VALUES ('2', 'frm_filtro', 'agregar', 'button', 'Agregar Nuevo', 'gg-button', '0', '2');
INSERT INTO `formularios_botones` VALUES ('3', 'frm_filtro', 'limpiar', 'reset', 'Limpiar', 'gg-button', '0', '4');
INSERT INTO `formularios_botones` VALUES ('4', 'frm_agregar', 'btn_agregar', 'submit', 'Agregar Nuevo', 'gg-button', '0', '1');
INSERT INTO `formularios_botones` VALUES ('5', 'frm_filtro', 'btn_item', 'button', 'Agregar Item', 'gg-button', '0', '3');
INSERT INTO `formularios_botones` VALUES ('6', 'frm_producto_item', 'btn_agregar', 'submit', 'Guardar', 'gg-button', '0', '1');
INSERT INTO `formularios_botones` VALUES ('7', 'frm_producto_item', 'btn_agregar', 'reset', 'Limpiar', 'gg-button', '0', '1');

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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of formularios_campos
-- ----------------------------
INSERT INTO `formularios_campos` VALUES ('1', 'frm_filtro', 'select', 'FILTRO DE BUSQUEDA', 'slt_categoria', 'slt_categoria', 'categoria', ' ', 'text vobli', ' ', '1', '0', '0', '1', 'categoria_productos', 'id_categoria');
INSERT INTO `formularios_campos` VALUES ('2', 'frm_filtro', 'select', 'FILTRO DE BUSQUEDA', 'slt_producto', 'slt_producto', 'Productos', ' ', 'text vobli', ' ', '1', '0', '0', '2', '', '');
INSERT INTO `formularios_campos` VALUES ('4', 'frm_agregar', 'text', 'DATOS DEL  PRODUCTO', 'txt_producto', 'txt_producto', 'producto', '', 'text vobli', 'Nombre del Producto', '1', '0', '0', '2', 'categoria_productos', 'id_categoria');
INSERT INTO `formularios_campos` VALUES ('8', 'frm_agregar', 'hidden', 'DATOS DEL  PRODUCTO', 'form', 'form', '', 'agregar-producto', 'text vobli', ' ', '1', '0', '0', '5', '', '');
INSERT INTO `formularios_campos` VALUES ('10', 'frm_agregar', 'hidden', 'DATOS DEL  PRODUCTO', 'hdd_categoria', 'hdd_categoria', '', '', 'text vobli', ' ', '1', '0', '0', '2', '', '');
INSERT INTO `formularios_campos` VALUES ('19', 'frm_producto_item', 'text', 'DATOS DEL  PRODUCTO', 'txt_producto', 'txt_producto', 'producto', '', 'text vobli', 'Nombre del Producto', '1', '0', '0', '1', '', '');
INSERT INTO `formularios_campos` VALUES ('20', 'frm_producto_item', 'text', 'DATOS DEL  PRODUCTO', 'txt_color', 'txt_color', 'Color', '', 'text vobli', 'Color del Producto', '1', '0', '0', '1', '', '');
INSERT INTO `formularios_campos` VALUES ('21', 'frm_producto_item', 'select', 'DATOS DEL  PRODUCTO', 'txt_talla', 'txt_talla', 'Talla', '', 'text vobli', 'Talla del Producto', '1', '0', '0', '3', 'tallas', 'id_talla');
INSERT INTO `formularios_campos` VALUES ('22', 'frm_producto_item', 'select', 'DATOS DEL  PRODUCTO', 'txt_promocion', 'txt_promocion', 'Promocion', '', 'text vobli', 'Promocion del Producto', '1', '0', '0', '4', 'promociones', 'id_promocion');
INSERT INTO `formularios_campos` VALUES ('23', 'frm_producto_item', 'text', 'DATOS DEL  PRODUCTO', 'txt_costo', 'txt_costo', 'Costo', '', 'text vobli', 'Cosoto del Producto', '1', '0', '0', '4', '', '');
INSERT INTO `formularios_campos` VALUES ('24', 'frm_producto_item', 'hidden', 'DATOS DEL  PRODUCTO', 'hdd_categorias', 'hdd_categorias', '', '', 'text vobli', '', '1', '0', '0', '1', '', '');
INSERT INTO `formularios_campos` VALUES ('25', 'frm_producto_item', 'hidden', 'DATOS DEL  PRODUCTO', 'hdd_producto', 'hdd_producto', '', '', 'text vobli', '', '1', '0', '0', '2', '', '');
INSERT INTO `formularios_campos` VALUES ('26', 'frm_producto_item', 'hidden', 'DATOS DEL  PRODUCTO', 'form', 'form', '', 'agregar-item', 'text vobli', '', '1', '0', '0', '3', '', '');

-- ----------------------------
-- Table structure for `imagen_producto`
-- ----------------------------
DROP TABLE IF EXISTS `imagen_producto`;
CREATE TABLE `imagen_producto` (
  `id_imagen` int(10) NOT NULL AUTO_INCREMENT,
  `imagen` varchar(50) NOT NULL,
  `id_item` int(10) DEFAULT NULL,
  PRIMARY KEY (`id_imagen`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of imagen_producto
-- ----------------------------
INSERT INTO `imagen_producto` VALUES ('3', 'imagen/productos/00011', '11');
INSERT INTO `imagen_producto` VALUES ('4', 'imagen/productos/00012', '12');

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
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `categoria_producto` (`id_categoria`),
  CONSTRAINT `categoria_producto` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_productos` (`id_categoria`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of productos
-- ----------------------------
INSERT INTO `productos` VALUES ('3', '1', 'JEANS');

-- ----------------------------
-- Table structure for `producto_item`
-- ----------------------------
DROP TABLE IF EXISTS `producto_item`;
CREATE TABLE `producto_item` (
  `id_item` int(10) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `id_producto` int(10) DEFAULT NULL,
  `color` char(20) DEFAULT NULL,
  `id_talla` int(10) DEFAULT NULL,
  `id_promocion` int(10) DEFAULT NULL,
  `costo` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_item`),
  KEY `talla_producto` (`id_talla`),
  KEY `item_promocion` (`id_promocion`),
  CONSTRAINT `item_promocion` FOREIGN KEY (`id_promocion`) REFERENCES `promociones` (`id_promocion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `talla_producto` FOREIGN KEY (`id_talla`) REFERENCES `tallas` (`id_talla`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of producto_item
-- ----------------------------
INSERT INTO `producto_item` VALUES ('11', 'LEGGIN EFECTO TEJANO', '3', '0f040f', '2', '1', '2000');
INSERT INTO `producto_item` VALUES ('12', 'LEGGING CINTURA GOMA', '3', '0a050a', '1', '1', '2500');

-- ----------------------------
-- Table structure for `promociones`
-- ----------------------------
DROP TABLE IF EXISTS `promociones`;
CREATE TABLE `promociones` (
  `id_promocion` int(10) NOT NULL AUTO_INCREMENT,
  `nombre` int(2) NOT NULL,
  PRIMARY KEY (`id_promocion`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of promociones
-- ----------------------------
INSERT INTO `promociones` VALUES ('1', '10');
INSERT INTO `promociones` VALUES ('2', '20');
INSERT INTO `promociones` VALUES ('3', '30');
INSERT INTO `promociones` VALUES ('4', '40');
INSERT INTO `promociones` VALUES ('5', '50');

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
INSERT INTO `usuario` VALUES ('1', '2', '16595338', '1234', '2012-11-29', '1');

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
DROP TRIGGER IF EXISTS `item_productos`;
DELIMITER ;;
CREATE TRIGGER `item_productos` AFTER INSERT ON `producto_item` FOR EACH ROW BEGIN
SET @PRUEBA = NEW.id_item;
insert into codigo_productos (id_item,codigo_producto) values(@PRUEBA,LPAD(@PRUEBA,'5','0'));
insert into imagen_producto (imagen,id_item) values (CONCAT('imagen/productos/',LPAD(@PRUEBA, '5', '0')),@PRUEBA);
END
;;
DELIMITER ;
