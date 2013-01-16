<?php
@session_start();
	error_reporting(0);
	require_once("../config.php");
	require_once("../lib/funciones.php");
	require_once("../lib/clases/dbi.class.php");
        require_once("../lib/clases/usuario.class.php");
        require_once("../lib/clases/producto.class.php");
        $user = new usuario;
	if(!$user->session())
	{
		$array['msgTitle'] = "Sesión de usuario";
		$array['mensaje'] = "Debe iniciar sesión nuevamente.";
		$array['msgTipo'] = "error";
		$array['estatus'] = false;
		echo json_encode($array);
		exit();
	}
        foreach($_POST as $i => $valor)
		$$i = escapar($valor);
	
	switch($a)
	{
            case "listar-producutos":
                    $prod = new producto;
                    $prod->listar($cat);
                    echo $prod->json;
		break;
            case "listar-categorias":
                    $prod = new producto;
                    $prod->listarCategoria($cat);
                    echo $prod->json;
                break;
        }
?>
