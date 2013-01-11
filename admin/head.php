<?php
	ini_set('error_report', E_ALL);
	error_reporting(E_ALL);
	//error_reporting(0);
	ini_set("date.timezone", "America/Caracas");
	
	/**************************************** LIBRERIAS GLOBALES *********************************************/
	
	require_once("../config.php");
	require_once("../lib/funciones.php");
	require_once("../lib/clases/plantilla.class.php");
	require_once("../lib/clases/usuario.class.php");
	require_once("../lib/clases/menu.class.php");
	
	
	/***************************************** OJEBTOS GLOBALES **********************************************/
	
	$html = new plantilla;
	$usuario = new usuario;
	$menu = new menu;
	
	/******************************************* MANTENIMIENTO ***********************************************/
	
	
	/***************************************** PERMISO DE USUARIO ***********************************************/
	/*$activar_permiso = false;
	if($usuario->session() && $usuario->datos_actualizados && $usuario->id_grupo == GRUPO_ESTUDIANTE)//si el usuario es estudiante y tiene sus datos actualizados
			header("location: ../curso/");
	
	if($usuario->session() && !$usuario->datos_actualizados && $usuario->id_grupo == GRUPO_ESTUDIANTE)//si el usuario es estudiante y no tiene sus datos actualizados
			header("location: ../curso/configuracion.php");
	
	
	if(basename($_SERVER['PHP_SELF']) != "configuracion.php" && !$usuario->datos_actualizados)//si el usuario no tiene sus datos actualizados
	{
		header("location: ../admin/configuracion.php");
	}
	
		
	if($activar_permiso)	
		if(basename($_SERVER['PHP_SELF']) != "index.php")
		{
			$modulo = basename(str_ireplace("index.php", "", $_SERVER['PHP_SELF']));
			if(!$permiso->datos[$modulo]['ver'])
				header("location: index.php");
		}
	*/
	/***************************************** SESSION DE USUARIO ********************************************/
	/*$matriz['CHAT'] = ""; 
	$matriz['USER_INFO']="";
	if($usuario->session())
	{
		$matriz['CHAT']=$html->html("../html/chat_cliente.html");
		$vars=$_SESSION['wc'];
		$vars['ROOT_URL'] = ROOT_URL;
		$matriz['USER_INFO'] = $html->html("html/user_info.html",$vars);
	}else
		header("location: ../index.php");*/
	
	/***************************************** MENU DE USUARIO ***********************************************/
	$array['submenu_item']="";
	
	$nav['MENU']="";
	if($menu->datos)
		foreach($menu->datos as $item)
		{
			if($item['url'] != "#")
				$item['url'] =  ROOT_URL.$item['url'];
			if(isset($item['submenu']))
			{
                            $a_submenu="";
				foreach($item['submenu'] as $submenu)
				{
					if($submenu['url'] != "#")
						$submenu['url'] =  ROOT_URL.$submenu['url'];
					if($permiso->datos[basename($submenu['url'])]['ver'])
						if($submenu['id_acceso']!='5')
							$a_submenu .= $html->html("html/submenu_item.html",$submenu);
						else
							$a_submenu .= $html->html("html/boton_chat_cliente.html");//esto es en caso de tener acceso al chat para clientes
				}
				$item['submenu'] = $html->html("../html/submenu.html",array("submenus"=>$a_submenu));
				$nav['MENU'] .= $html->html("../html/menu.html",$item);
			}
			else
			{
                            $item['submenu']="";
				/*if($permiso->datos[basename($item['url'])]['ver'])*/
					$nav['MENU'] .= $html->html("../html/menu.html",$item);
			}
                         $matriz['MENU'] = $html->html("../html/menu.html",$item);
		}
	/*	$consola['CONSOLA']="";
	$consola['CONSOLA'].="*******************menu*******************\n\n".print_r($menu->datos,true);
	$matriz['CONSOLA']=$html->html('html/consola.html',$consola);*/
	
		
	/*************************************** VALIDACION DEL BROWSER *******************************************/
	
	/*$matriz['BROWSER']="";
	$agent=$_SERVER['HTTP_USER_AGENT'];
	
	
	$ie=strrpos($agent,"MSIE 6.0");
	if($ie)
	{
		$browser = "html/browser.html";
		$gestor = fopen($browser,"r");
		$contenido = fread($gestor, filesize($browser));
		$matriz['BROWSER']=$contenido;
	}*/
	/*$ie=strrpos($agent,"MSIE 7.0");
	if($ie)
	{
		$browser = "html/browser.html";
		$gestor = fopen($browser,"r");
		$contenido = fread($gestor, filesize($browser));
		$matriz['BROWSER']=$contenido;
	}*/
	
	/************************************** VARIABLES PREDEFINIDAS *********************************************/
	
	$matriz['TITULO']="Washington School - ";
	$matriz['MENSAJE']="";
	$matriz['MSGTIPO']="";
	$matriz['MSGTITLE']="";
	$matriz['CONTENIDO']="";
	$matriz['JS']="";
	$matriz['CSS']="";
	$matriz['DERECHO']="";
	$matriz['ROOT_URL']=ROOT_URL;
	/*if(GOOGLE_ANALYTICS)
		$matriz['GOOGLE_ANALYTICS'] = $html->html(ROOT_DIR.'html/google_analytics.html');
	else
		$matriz['GOOGLE_ANALYTICS'] = "";
	no_index();*/
	
	/***************************************** CONSOLA DEL SISTEMA *********************************************/
	
	
	
	/***************************************** MENSAJES GENERALES **********************************************/
	
	if(isset($_SESSION['mensaje']))
	{
		if($_SESSION['msgTipo']=="aviso")
			$i['icon']="ui-icon-alert";
		if($_SESSION['msgTipo']=="error")
			$i['icon']="ui-icon-circle-close";
		if($_SESSION['msgTipo']=="ok")
			$i['icon']="ui-icon-circle-check";
		if($_SESSION['msgTipo']=="info")
			$i['icon']="ui-icon-info";
		$matriz['MENSAJE']=$html->html('html/i.html',$i).$_SESSION['mensaje'];
		$matriz['MSGTIPO']=$_SESSION['msgTipo'];
		$matriz['MSGTITLE']=$_SESSION['msgTitle'];
		unset($_SESSION['mensaje']);
		unset($_SESSION['msgTipo']);
		unset($_SESSION['msgTitle']);
	}
	
	/***************************************** ARCHIVOS CSS y JS *************************************************/
	
	$archivo=basename($_SERVER['PHP_SELF']);
	$archivo=explode(".",$archivo);
	$archivo=$archivo[0];
	
	if(is_file("lib/js/$archivo".".js"))
		$matriz['JS']=$html->html("../html/js.html",array("src"=>"lib/js/".$archivo.".js"));
	if(is_file("css/$archivo".".css"))
		$matriz['CSS']=$html->html("../html/css.html",array("href"=>"css/".$archivo.".css","media"=>"all"));
	if(is_file("html/$archivo".".html"))
		$matriz['CONTENIDO']=$html->html("html/$archivo.html");
?>