<?php
//----------------------------------------------------------
// NOMBRE: formulario.class.php
// DESCRIPCION: Generador de formularios por base de datos.
//----------------------------------------------------------
// AUTOR: yo mismo
// CORREO: el mismo
// FECHA: 
//----------------------------------------------------------

//----------------------------------------------------------
// 						LIBRERIAS USADAS
//----------------------------------------------------------
require_once('dbi.class.php');
require_once('dbi.result.class.php');
//require_once('../../config.php');

//----------------------------------------------------------
// 						DEFINICIÓN DE LA CLASE
//
//	ATRIBUTOS: 	db (Objeto base de datos)
//					mensaje (mensajes de la clase)
//					msgTipo (tipo del mensaje: ok, error, aviso, info)
//					msgTitle (Título del mensaje)
//					datos (datos devueltos por cualquier método)
//					json (Atributos de la clase en formato json)
//					estatus (Estado del proceso: true, false)
//----------------------------------------------------------
class formulario
{
	private $db;
	public $mensaje;
	public $msgTipo;
	public $msgTitle;
	public $datos="";
	public $json="";
	public $estatus;
	//--------------------------------------------------------
	// NOMBRE: constructor.
	// DESCRIPCION: Se ejecuta al instanciar el objeto.
	// PARÁMETROS: Ninguno.
	// PROCESO: crea un nuevo objeto de base de datos, para usarlo en los métodos.
	//--------------------------------------------------------
	public function __construct()
	{
		$this->db = new db;
	}
	//--------------------------------------------------------
	// NOMBRE: mostrar.
	// DESCRIPCION: Muestra todos los datos del formulario $id solicitado.
	// PARÁMETROS: $id del formulario.
	// PROCESO: Buscar en la base de datos el formulario y despues sus respectivos campos..
	//--------------------------------------------------------
	public function mostrar($id)
	{
		$this->msgTitle = "Mostrar Formulario";
		
		$formularios = $this->db->query("SELECT * FROM formularios_web WHERE id='$id'");
		if(!$formularios->num_rows)
		{
			$this->mensaje = "No se encontraron registros...";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
		}
		$this->datos="";
		$i = 0;
		while($formulario = $formularios->fetch_assoc())
		{
			$i++;
			$this->datos[$i] = $formulario;
			$campos = $this->db->query("SELECT * FROM formularios_campos 
                                                    WHERE id_formulario='$formulario[id]'
                                                    ORDER BY  legend, orden");
			$legend_anterior = ""; 
			$j = 0;
					
			while($campo = $campos->fetch_assoc())
			{
				if($campo['datos'])
				{
					$datos = $this->db->query("SELECT * FROM $campo[datos]");
					$campo['datos']="";
					while($dato = $datos->fetch_assoc())
					{
						$dato['value'] = $dato[$campo['datos_value']];
						$campo['datos'][]=array_map("utf8_decode",$dato);
					}
				}
								
				$adicionales = $this->db->query("SELECT * FROM formularios_adicional WHERE id_campo='$campo[id_campo]' ORDER BY orden");
				if($adicionales->num_rows)
					$campo['adicionales'] = $adicionales->all();
				else
					$campo['adicionales'] = "";
				
				if($legend_anterior != $campo['legend'])
					$j++;
					
				if($campo['tipo'] != "hidden")
				{
					$this->datos[$i]['fieldsets'][$j]['legend'] = $campo['legend'];
					$this->datos[$i]['fieldsets'][$j]['campos'][] = $campo;
					$legend_anterior = $campo['legend'];
				}
				else
					$this->datos[$i]['hiddens'][] = $campo;
			}
			
		
			$botones = $this->db->query("SELECT * FROM formularios_botones WHERE id_formulario='$formulario[id]' ORDER BY orden");
			$this->datos[$i]['botones']="";
			if($botones->num_rows)		 
				while($boton = $botones->fetch_assoc())
					$this->datos[$i]['botones'][] = $boton;
			
		}
		$this->mensaje = "Se ha listado el formularo correctamente...";
		$this->msgTipo = "ok";
		$this->estatus = true;
		$this->json = json_encode($this);
		return $this->estatus;
	}
}
//----------------------------------------------------------
// 						PRUEBAS DE LA CLASE

//$form = new formulario;
//$form->mostrar("frm_registrar_usuario");
//echo "<br><textarea>".print_r($form->datos,true)."</textarea>";

//----------------------------------------------------------
?>