<?php
	session_start();
	/************************************** LIBRERIAS LOCALES *****************************************/
	
	/*************************************** OJEBTOS LOCALES ******************************************/
	

	
	/**************************************************************************************************/	
	
	include_once('head.php');
	
	/**************************************** VARIABLES DE MATRIZ **************************************/
	
	$matriz['TITULO'] = "MAXY - ";
        $matriz['TITULO_PAGINA'] = "BIENVENDOS";
	$matriz['KEYWORDS'] = "";
	$matriz['KEYWORDS'] = "";
	$matriz['DESCRIPTION'] = "";
	$matriz['BODY'] = "Inicio";
	$matriz['ROOT_URL'] = ROOT_URL;
	$matriz['CSS'] .= $html->html("html/css.html",array("href"=>"css/form.css","media"=>"all"));
	
	
	/********************************************* CONTENIDO *******************************************/	
	$array['ROOT_URL'] = ROOT_URL;
        $matriz['FORMULARIOS'] = $html->html("html/login.html");
        $matriz['CONTENIDO'] = $html->html("html/$archivo.html",$array);
	/***************************************** MATRIZ **************************************************/

	echo $html->html("html/matriz.html",$matriz);        
?>