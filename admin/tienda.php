<?php
	session_start();
	/************************************** LIBRERIAS LOCALES *****************************************/
	
	/*************************************** OJEBTOS LOCALES ******************************************/
	

	
	/**************************************************************************************************/	
	
	include_once('head.php');
	
	/**************************************** VARIABLES DE MATRIZ **************************************/
	
	$matriz['TITULO'].="Inicio";
	$matriz['SUBTITULO_PAGINA']="Inicia sesión entrar en el panel administrativo...";
	$matriz['KEYWORDS']="";
	$matriz['DESCRIPTION']="";
	$matriz['BODY']="inicio";
        $matriz['CSS'] .= $html->html("../html/css.html",array("href"=>"../css/form.css","media"=>"all"));
      
        
	
	
	/********************************************* CONTENIDO *******************************************/	
        
        $matriz['CONTENIDO'] = $html->html("html/$archivo.html",$array);
	/***************************************** MATRIZ **************************************************/

	echo $html->html("../html/matriz.html",$matriz);        
?>