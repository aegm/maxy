<?php
@session_start();
require_once("../config.php");
require_once("../lib/clases/usuario.class.php");
require_once("../lib/funciones.php"); 
require_once '../lib/clases/producto.class.php';
error_reporting(1);

$user_sesion = new usuario;
if(!$user_sesion->session())
	header("location: index.php");

if(isset($_POST)&&count($_POST)){
	$form_error = false;
	
	foreach($_POST as $i => $valor)
		$$i = escapar($valor);
	
	switch($_POST['form']){
            case 'agregar-producto':
                $productos = new producto;
                $productos->guardar($slt_categoria,$txt_producto,$txt_costo,$slt_talla,$txt_color,$txt_cod_pro);
                $_SESSION['mensaje']=$productos->mensaje;
                $_SESSION['msgTipo']=$productos->msgTipo;
                $_SESSION['msgTitle']=$productos->msgTitle;

                $error_redirect_to = 'administrar.php';
                $ty_redirect_to = 'administrar.php';
                break;
            default:
			$_SESSION['mensaje'] = 'Formulario especificado no es válido. Póngase en contacto con nosotros si tiene alguna pregunta.';
			$_SESSION['msgTipo']="error";
			$_SESSION['msgTitle']="Manejador de formularios.";
			header("Location: index.php");
			exit();
		break;
	}
	$lang_dir = '';
	
	if($form_error)
	{
		$_SESSION[$_POST['form']] = $_POST;
		header("Location: ".$lang_dir.$error_redirect_to);
		exit();
	}
	try
	{
		//$user = UserFactory::getUserType($_POST);
		//$user->email();
		
		//$admin = AdminFactory::getAdminType($_POST);
		//$admin->notify();

		//$subscriber = SubscriberFactory::getSubscriberType($_POST);
		//$subscriber->subscribe();

		unset($_SESSION[$_POST['form']]);
		header("Location: ".$lang_dir.$ty_redirect_to);

	}
	catch(Exception $e)
	{
		$_SESSION['active_form'] = $_POST['form'];
		$_SESSION[$_POST['form']] = $_POST;
		$_SESSION['mensaje'] = 'Error inesperado al intentar procesar su solicitud. Por favor, inténtelo de nuevo más tarde.';
		header("Location: ".$lang_dir.$error_redirect_to);
	}
}
?>
