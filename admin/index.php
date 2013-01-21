<?php
	session_start();
	/************************************** LIBRERIAS LOCALES *****************************************/
	
	
	
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
        $array['ROOT_URL'] = ROOT_URL;
	
	/********************************************* CONTENIDO *******************************************/	
	
	 $matriz['CONTENIDO'] = $html->html("html/$archivo.html",$array);
	/***************************************** MATRIZ **************************************************/
	
        //print_r($menu->datos);
	echo $html->html("../html/matriz.html",$matriz);
?>