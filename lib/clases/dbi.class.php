<?php
//----------------------------------------------------------
// NOMBRE: dbi.class.php
// DESCRIPCION: Manejador de base de datos.
//----------------------------------------------------------
//----------------------------------------------------------

//----------------------------------------------------------
// 						LIBRERIAS USADAS
//----------------------------------------------------------
require_once("dbi.result.class.php");

class db extends MySQLi
{
	public $mensaje;
	public $msgTipo;
	public $msgTitle;
	public $estatus;
	public function __construct($dbhost=DB_HOST, $dbport=DB_PORT, $dbname=DB_NAME, $dbuser=DB_USER, $dbpass=DB_PASS)
	{
		@parent::connect($dbhost, $dbuser, $dbpass, $dbname, $dbport);
		if(!$this->connect_error)
		{
			$this->set_charset(DB_CHARSET);
			$this->mensaje = "Se ha conectado a \"$dbhost\" con la BD: \"$dbname\" correctamente...";
			$this->msgTipo = "ok";
			$this->estatus = true;
			return $this->estatus;
		}
		
		$this->mensaje = "No se pudo conectar a \"$dbhost\" en este momento, intente nuevamente mas tarde. Disculpe las molestias causadas... Error: (".$this->errno.") ".$this->error;
		$this->msgTipo = "error";
		$this->estatus = false;
		return $this->estatus;
	}
	public function query($query)
	{
		if($this->real_query($query))
		{			
			$this->mensaje = "El query: \"$query\", se ha realizado correctamente...";
			$this->msgTipo = "ok";
			$this->estatus = true;
			return new result($this);
		}
		if($this->errno == 1064)
		{
			$this->mensaje = "Error de sintaxis $query";
			$this->msgTipo = "error";
			$this->estatus = false;
			return new result($this);
		}
		if($this->errno == 1146)
		{
			$this->mensaje = "La tabla no extiste $query";
			$this->msgTipo = "error";
			$this->estatus = false;
			return new result($this);
		}
		$this->mensaje = "No se pudo realizar el query \"$query\" en este momento, intente nuevamente mas tarde. Disculpe las molestias causadas... Error: (".$this->errno.") ".$this->error;
		$this->msgTipo = "error";
		$this->estatus = false;
		return new result($this);
	}
	public function nuevo($tabla,$datos)
	{
		$this->msgTitle = "Nuevo";
		$campos = $valores = "";
		
		foreach($datos as $campo => $valor)
		{
			if(!$campos)
			{
				$campos .= $campo;
				$valores .= "'".$valor."'";
			}
			else
			{
				$campos .= ",".$campo;
				$valores .= ",'".$valor."'";
			}
		}
		$query = $this->query("INSERT INTO $tabla ($campos) VALUES ($valores)");
		if($this->errno == 1062)
		{
			$this->mensaje = "El registro ya se encuentra en la base de datos.";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			return $query;
		}
		if(!$this->errno)
		{
			$this->mensaje = "Se han guardado los datos correctamente.";
			$this->msgTipo = "ok";
			$this->estatus = true;
			return $query;
		}
		$this->mensaje = "No se pudo procesar su solicitud, por favor intente de nuevo mas tarde. Disculpe las molestias causadas. Error: ".$this->errno;
		$this->msgTipo = "error";
		$this->estatus = false;
		return $query;
	}
	public function guardar($tabla,$datos,$where)
	{
		$this->msgTitle = "Guardar";
		
		if(!$where)
		{
			$this->mensaje = "Debe especificar el WHERE.";
			$this->msgTipo = "error";
			$this->estatus = false;
			return $this->estatus;
		}
		$campos = "";
		foreach($datos as $campo => $valor)
		{
			if(!$campos)
				$campos .= $campo."='".$valor."'";
			else
				$campos .= ",".$campo."='".$valor."'";
		}
		
		$awhere = "";
		foreach($where as $campo => $valor)
		{
			if(!$awhere)
				$awhere .= "$campo='$valor'";
			else
				$awhere .= " AND $campo='$valor'";
		}
		
		$query = $this->query("UPDATE $tabla SET $campos WHERE $awhere");
		if($this->errno == 1062)
		{
			$this->mensaje = "El registro ya se encuentra en la base de datos.";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			return $query;
		}
		if(!$this->errno)
		{
			$this->mensaje = "Se han guardado los datos correctamente.";
			$this->msgTipo = "ok";
			$this->estatus = true;
			return $query;
		}
		$this->mensaje = "No se pudo procesar su solicitud, por favor intente de nuevo mas tarde. Disculpe las molestias causadas. Error: ".$this->errno;
		$this->msgTipo = "error";
		$this->estatus = false;
		return $query;
	}
	public function borrar($tabla,$where)
	{
		$this->msgTitle = "Borrar";
		
		if(!$where)
		{
			$this->mensaje = "Debe especificar el WHERE.";
			$this->msgTipo = "error";
			$this->estatus = false;
			return $this->estatus;
		}
		
		$awhere = "";
		foreach($where as $campo => $valor)
		{
			if(!$awhere)
				$awhere .= "$campo='$valor'";
			else
				$awhere .= " AND $campo='$valor'";
		}
		
		$query = $this->query("DELETE FROM $tabla WHERE $awhere");
		if($this->affected_rows)
		{
			$this->mensaje = "Se han borrado los datos correctamente.";
			$this->msgTipo = "ok";
			$this->estatus = true;
			return $query;
		}
		$this->mensaje = "No se pudo procesar su solicitud, por favor intente de nuevo mas tarde. Disculpe las molestias causadas. Error: ".$this->errno;
		$this->msgTipo = "error";
		$this->estatus = false;
		return $query;
	}
	public function listar($tabla,$where = "")
	{
		$this->msgTitle = "Listar";
		
		if($where)
		{
			$awhere = "";
			foreach($where as $campo => $valor)
			{
				if(!$awhere)
					$awhere .= "$campo='$valor'";
				else
					$awhere .= " AND $campo='$valor'";
			}
			$query = $this->query("SELECT * FROM $tabla WHERE $awhere");
		}
		else
			$query = $this->query("SELECT * FROM $tabla");
		
		
		if(!$query->num_rows)
		{
			$this->mensaje = "No se encontraron registros.";
			$this->msgTipo = "ok";
			$this->estatus = false;
			return $query;
		}
		else
		{
			$this->mensaje = "Se listo la información solicitada.";
			$this->msgTipo = "ok";
			$this->estatus = true;
			return $query;
		}
		$this->mensaje = "No se pudo procesar su solicitud, por favor intente de nuevo mas tarde. Disculpe las molestias causadas. Error: ".$this->errno;
		$this->msgTipo = "error";
		$this->estatus = false;
		return $query;
	}
	public function __destruct()
	{
		$this->close();
	}
}
?>