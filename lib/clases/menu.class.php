<?php
//require_once('../../config.php');
require_once('dbi.class.php');
require_once("dbi.result.class.php");
class menu
{
	private $db;
	public $mensaje;
	public $msgTipo;
	public $msgTitle;
	public $datos;
	public $json;
	public $estatus;
	public function __construct()
	{
		$this->cargar();
	}
	public function iniciar($id_grupo)
	{
		$this->db = new db;
		$menu = $this->db->query("SELECT * FROM vmenu WHERE id_grupo='$id_grupo' AND tipo='0' ");
		if($menu->num_rows==0)
		{
			$this->mensaje = "No hay ningun item en el menu...";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
		}
		$_SESSION['menus']=array();
		
		while($item = $menu->fetch_assoc())
		{
			$_SESSION['menus'][$item['id_menu']] = $item;
			$sumenus = $this->db->query("SELECT * FROM vmenu WHERE id_grupo='$id_grupo' AND tipo='$item[id_menu]' ORDER BY orden");
			while($submenu=$sumenus->fetch_assoc())
				$_SESSION['menus'][$item['id_menu']]['submenu'][]=$submenu;
		}
		$this->datos = $_SESSION['menus'];
		$this->mensaje = "se han mostrado los items del menu correctamente...";
		$this->msgTipo = "ok";
		$this->estatus = true;
		$this->json = json_encode($this);
		return $this->estatus;
	}
	public function cargar()
	{
		if(!isset($_SESSION['menus']))
		{
			$this->mensaje = "No hay menu de sesion para cargar...";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
			
		}
		$this->datos = $_SESSION['menus'];
		$this->mensaje = "Se cargo el menu desde la session...";
		$this->msgTipo = "ok";
		$this->estatus = false;
		$this->json = json_encode($this);
		return $this->estatus;
	}
	public function __destruct()
	{
	}
}
//----------------------------------------------------------
// 						PRUEBAS DE LA CLASE

//$menu = new menu;
//$menu->iniciar('1');
//echo "<br><textarea>".print_r($menu->datos,true)."</textarea>";

//----------------------------------------------------------
?>