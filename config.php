<?php
/****************************************** CONFIGURACION DEL SISTEMA ************************************************/
//define('GRUPO_SUPERADMIN','1');
//define('GRUPO_CLIENTE','2');

/****************************************** CONFIGURACION GENERAL DEL SITIO *******************************************/
/** cambia el root del apache. **/
define('ROOT_DIR',dirname(__FILE__).'/');
define('ROOT_URL','http://localhost/maxy/');

/** activa los tipos de erroes del servidor **/
ini_set('error_report', E_ALL);
error_reporting(E_ALL);

/** SMTP **/
define("SMTP","localhost");

/** determina la zona horaria del servidor web para el manejo de fecha y hora **/
ini_set("date.timezone", "America/Caracas");

/** variable de session **/
define("SISTEMA","MX");


/** Nombre del sistema **/
define("NOMBRE","Maxy Boutique");

/** Titulo que antepone el titulo en todas las paginas **/
define("PRE_TITULO","Sistema para el apoyo a la toma de decisisones en la eleccion de vestuarios.");

/*********************************************** MYSQL BASE DE DATOS ***************************************************/

/** El nombre de tu base de datos 
define("DB_NAME","");**/
define("DB_NAME","maxy");

//Tu nombre de usuario de MySQL 
//define('DB_USER', '');
define('DB_USER', 'root');

/** Tu contraseña de MySQL
define('DB_PASS', ''); **/
define('DB_PASS', '1234');

/** Host de MySQL (es muy probable que no necesites cambiarlo)
define('DB_HOST', ''); **/
define('DB_HOST', 'localhost');

/** Puerto de conexión del servidor Mysql. **/
define("DB_PORT","3306");

/** Codificación de caracteres para la base de datos. **/
define('DB_CHARSET', 'utf8');

/****************************************************** URLS **********************************************************/
?>