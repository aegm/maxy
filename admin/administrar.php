<?php
	session_start();
	/************************************** LIBRERIAS LOCALES *****************************************/
        require_once '../config.php';
        require_once '../lib/clases/formulario.class.php';
        require_once '../lib/funciones.php';
	
	/*************************************** OJEBTOS LOCALES ******************************************/
	
	
	
	/**************************************************************************************************/	
	
	include_once('head.php');
	
	/**************************************** VARIABLES DE MATRIZ **************************************/
	
	$matriz['TITULO'].="Inicio";
	$matriz['TITULO_PAGINA']="Washington School Admin";
	$matriz['SUBTITULO_PAGINA']="Inicia sesión entrar en el panel administrativo...";
	$matriz['KEYWORDS']="";
	$matriz['DESCRIPTION']="";
	$matriz['BODY']="inicio";
	$matriz['JS'].="";
	
	/********************************************* CONTENIDO *******************************************/	
	//formulario de busqueda
        $array['FORMULARIO'] = formulario_html("filtro_productos");
        
        
        $matriz['CONTENIDO'] = $html->html("html/$archivo.html",$array);
	
	/***************************************** MATRIZ **************************************************/
	
        //print_r($menu->datos);
	echo $html->html("../html/matriz.html",$matriz);
?>