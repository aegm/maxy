<?php
//----------------------------------------------------------
// NOMBRE: plantilla.class.php
// DESCRIPCION: Manejador de plantillas html.
//----------------------------------------------------------
// AUTOR: Gilberto López A.
// CORREO: gilberto.amb@gmail.com
// FECHA: 12/01/2012 -=- Versión 1.0
//----------------------------------------------------------

//----------------------------------------------------------
// 						LIBRERIAS USADAS
//----------------------------------------------------------

// Ninguna

//----------------------------------------------------------
define("PATH","");
class plantilla
{
	private $path;
	private $html;
	private $ext;
	private $archivo;
	public $archivo_html;
	public $mensaje;
	public $msgTipo;
	public $msgTitle;
	public $datos = "";
	public $json = "";
	public $estatus;
	
	public function __construct($html="",$path=PATH)
	{
		$this->path = $path;
		$this->html = $html;
	}
	public function leer($archivo)
	{
		$this->archivo_html = $archivo;
		$this->archivo = $this->path.$archivo;
		
		if(!file_exists($this->archivo))
		{
			$this->mensaje = "No se encuentra el archivo: ".$this->archivo.", que se intenta abrir desde: ".$_SERVER['PHP_SELF'];
			$this->msgTipo = "aviso";
			$this->estatus = false;
			//$this->json = json_encode($this);
			return $this->estatus;
		}
		
		$this->html = fopen($this->archivo,'r');
		$this->html = fread($this->html,filesize($this->archivo));
		if (!$this->html)
		{
			$this->mensaje="No se pudo leer el archivo: ".$this->archivo_html;
			$this->msgTipo = "error";
			$this->estatus = false;
			//$this->json = json_encode($this);
			return $this->estatus;
		}
		$this->mensaje = "Se ha leido el archivo: ".$this->archivo_html." con exito...";
		$this->msgTipo = "ok";
		$this->estatus = true;
		//$this->json = json_encode($this);
		return $this->estatus;
	}
	public function vars($vars)
	{
		if(!$this->html)
		{
			$this->mensaje = "No se ha leido ninguna plantilla todavia...";
			$this->msgTipo = "error";
			$this->estatus = false;
			//$this->json = json_encode($this);
			return $this->estatus;
		}
		
		$this->vars = $vars;
		$this->html = preg_replace('#\{([a-z0-9\-_]*?)\}#is', "' . $\\1 . '", $this->html);

		reset($this->vars);
		
		while (list($key, $val) = each($this->vars))
			$$key = $val;

		eval("\$this->html= '$this->html';");
		/*if(isset($$key))
		{
			$this->mensaje = "<br /><br />ERROR: ($$key = $val) No se pudieron llenar todas las variables: <br /><textarea style='margin: 30px; padding: 10px; height: 300px; width: 60%;'>".print_r($vars,true)."</textarea><br />En la plantilla: ".$this->archivo_html;
			$this->msgTipo = "error";
			$this->estatus = false;
			//$this->json = json_encode($this);
			return $this->estatus;
		}*/
		reset ($this->vars);

		while (list($key, $val) = each($this->vars))
			unset($$key);
		$this->html = str_replace ("\'", "'", $this->html);
		
		$this->mensaje = "Se ha llenado la plantilla: ".$this->archivo_html." con variables...";
		$this->msgTipo = "ok";
		$this->estatus = true;
		//$this->json = json_encode($this);
		return $this->estatus;
	}
	public function mostrar()
	{
		if(!$this->html)
		{
			$this->mensaje="No hay ningun archivo plantilla cargado...";
			$this->msgTipo = "ok";
			$this->estatus = false;
			//$this->json = json_encode($this);	
			return $this->estatus;	
		}
		$this->mensaje="Se ha mostrado la plantilla correctamente...";
		$this->msgTipo = "ok";
		$this->estatus = true;
		//$this->json = json_encode($this);
		return $this->html;
	}
	public function html($html,$vars="")
	{
		if(!$this->leer($html))
			die($this->mensaje);
		if($vars)
			if(!$this->vars($vars))
				die($this->mensaje);
		return $this->mostrar();
	}
}
?>