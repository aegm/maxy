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
        $matriz['CSS'] .= $html->html("../html/css.html",array("href"=>"../css/form.css","media"=>"all"));
	
	/********************************************* CONTENIDO *******************************************/	
	//formulario de busqueda
        $array['ROOT_URL'] = ROOT_URL;  
        $array['FORMULARIO'] = formulario_html("frm_filtro");
        //FORMULARIO PARA AGREGAR PRODUCTO
        $array['FORMULARIO_AGREGAR'] = formulario_html("frm_agregar");
        
        
        $matriz['CONTENIDO'] = $html->html("html/$archivo.html",$array);
	
	/***************************************** MATRIZ **************************************************/
	
        //print_r($menu->datos);
	echo $html->html("../html/matriz.html",$matriz);
?>