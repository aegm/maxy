<?php
require_once('dbi.class.php');
require_once('dbi.result.class.php');
class producto
{
	private $db;
	public $mensaje;
	public $msgTipo;
	public $msgTitle;
	public $datos="";
	public $json="";
	public $estatus;
	public function __construct()
	{
		$this->db = new db;
	}
	//*****************************************************
	
        public function guardar($slt_categoria,$txt_producto,$txt_costo,$slt_talla,$txt_color,$txt_cod_pro)
        {
            
            $sql = $this->db->query("INSERT INTO productos (id_categoria, cod_producto, nombre, id_costo) 
                                                 VALUES('$slt_categoria','$txt_cod_pro','$txt_producto','$txt_costo')")or die($this->db->errno);
            
            if(!$this->db->errno)//si no hay errores
            {
                        $this->mensaje = "se almaceno correctamente el Producto...";
			$this->msgTipo = "aviso";
			$this->estatus = true;
			$this->msgTitle = "Agregar Productos";
	
            }else{
                $this->mensaje = "no se puedo almacenar el prodcucto Correctamente...";
		$this->msgTipo = "alerta";
		$this->estatus = false;
                $this->msgTitle = "Agregar Productos";
            }
            return $this->estatus;
                
        }  
         public function listar($id_categoria)
         {
             if($id_categoria)
                 $completa_sql = "where id_categoria = '$id_categoria'";
             
             $sql = $this->db->query("select * from productos");
             if($sql->num_rows==0)
             {
                        $this->mensaje = "No se encontraron Producto...";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
             }
             while($cursos=$sql->fetch_assoc())
		{
		 $cursos['Fecha De Inicio'] = fecha($cursos['Fecha De Inicio']);
                 $cursos['Fecha Fin'] = fecha($cursos['Fecha Fin']);	
                 
                 $this->datos[]=array_map("utf8_decode",$cursos);
		}
             //$this->datos = $sql->all();
		$this->mensaje = "Se ha listado los registros correctamente...";
		$this->msgTipo = "ok";
		$this->estatus = true;
		$this->json = json_encode($this);
		return $this->estatus;
         }
         
         public function generaOrden($curso,$persona)
         {
             $sql = "select * from ordenes_compra where id_persona = '$persona'";
             $verificar = $this->db->query($sql);
             if($verificar->num_rows==0)
             {
                 $fecha_actual = date("d/m/Y");
                 $fecha_unix = fecha($fecha_actual);
                 $insert = $this->db->query("INSERT INTO ordenes_compra (id_persona,id_estatus, fecha_creacion)VALUES('$persona','1','$fecha_unix')");
                 if(!$this->db->errno)//si no hay errores
                 {   
                 //obteniendo el ultimo id
                    $orden=$this->db->query("SELECT LAST_INSERT_ID() as 'id_orden' FROM ordenes_compra");
                    $orden=$orden->fetch_assoc();
                    $orden=$orden['id_orden'];
                    
                    $query = $this->db->query("insert into cursos_ordenes values ('$curso', '$orden')");
                     if($this->db->errno)//si no hay errores
                    {
                        $this->mensaje = "Ocurrio un error no se pudo generar la orden...";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
                     }
                 }
             }
         }
         
         public function listarOrden($id_persona){
             
              $sql = $this->db->query("select * from vordenes_pendienrtes where id_persona = '$id_persona'");
             if($sql->num_rows==0)
             {
                        $this->mensaje = "No se encontraron Cursos...";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
             }
             while($cursos=$sql->fetch_assoc())
		{
		 
                 $this->datos[]=$cursos;
		}
             //$this->datos = $sql->all();
		$this->mensaje = "Se ha listado los registros correctamente...";
		$this->msgTipo = "ok";
		$this->estatus = true;
		$this->json = json_encode($this);
		return $this->estatus;
         }
         
         public function inscribirCurso($curso,$persona){
             
             //VERIFICAMOS NO ESTAR INSCRITOS 
             $verficar = $this->db->query("select * from inscripcion_curso where id_persona = '$persona' and id_curso = '$curso'");
             if(!$verficar->num_rows==0){
                        $this->mensaje = "Ya te Encuentras inscripto en el curso...";
			$this->msgTipo = "aviso";
                        $this->msgTitle = "Inscripcion Curso Online";
			$this->estatus = false;
			$this->json = json_encode($this);
			
             }else{
                $fecha_actual = date("d/m/Y");
                $fecha_unix = fecha($fecha_actual);
                $sql = $this->db->query("INSERT INTO inscripcion_curso (id_persona,id_curso, fecha_inscripcion)VALUES('$persona','$curso','$fecha_unix')");
                $this->mensaje = "Inscripcion Exitosa";
		$this->msgTipo = "ok";
                $this->msgTitle = "Inscripcion Curso Online";
		$this->estatus = true;
		$this->json = json_encode($this);
             }
		return $this->estatus;
         }
         
         public function alumnosInscritos(){
              $sql = $this->db->query("select * from vinscripciones");
             if($sql->num_rows==0)
             {
                        $this->mensaje = "No se encontraron Cursos...";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
             }
             while($cursos=$sql->fetch_assoc())
		{
		 $cursos['Fecha de Inscripcion'] = fecha($cursos['Fecha de Inscripcion']);
                 $this->datos[]=$cursos;
		}
             //$this->datos = $sql->all();
		$this->mensaje = "Se ha listado los registros correctamente...";
		$this->msgTipo = "ok";
		$this->estatus = true;
		$this->json = json_encode($this);
		return $this->estatus;
         }


         //************************************************************************
}
?>