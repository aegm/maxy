<?php
 //session_start();
require_once('dbi.class.php');
require_once('dbi.result.class.php');

class usuario
{
	private $db;
	private $session = false;
	private $id_persona;
	public $identificacion;
	public $id_grupo;
	public $usuario;
	public $grupo;
	public $nombre;
	public $apellido;
	public $ultima;
	public $grado;
	public $datos_actualizados;
	public $leccion_actual;
	public $mensaje;
	public $msgTipo;
	public $msgTitle;
	public $datos="";
	public $json="";
	public $estatus;      
	public function __construct()
	{
		$this->cargar();
	}
	public function id_persona()
	{
		return $this->id_persona;
	}
	//***********************************************************************************************************
	public function registrar($id_grupo,$identificacion,$nombre,$apellido,$usuario,$clave)
	{
		if(!$id_grupo || !$identificacion || !$nombre || !$apellido || !$usuario)
		{
			$this->mensaje="Los campos con (*) son obligatorios...";
			$this->msgTipo="aviso";
			$this->estatus = false;
			$this->json=json_encode($this);
			return $this->estatus;
		}
		if(!preg_match("/^[a-z]([0-9a-z_])+$/i",$usuario)){
			$this->mensaje="El nombre de usuario puede contener solo letras, numeros y _";
			$this->msgTipo="aviso";
			$this->estatus = false;
			$this->json=json_encode($this);
			return $this->estatus;
		}
		if(!$clave)
		{
			$this->mensaje="Indique una clave, por favor...";
			$this->msgTipo="aviso";
			$this->estatus = false;
			$this->json=json_encode($this);
			return $this->estatus;
		}
		if(!is_numeric($identificacion))
		{
			$this->mensaje="La cedula tiene que ser numerica";
			$this->msgTipo="aviso";
			$this->estatus = false;
			$this->json=json_encode($this);
			return $this->estatus;
		}
		$this->db = new db;
		
		$this->db->query("LOCK TABLES personas WRITE, usuarios WRITE");
		$this->db->autocommit(FALSE);
		
		$this->db->query("INSERT INTO personas(
									identificacion,
									nombre,
									apellido
									)VALUES(
									'$identificacion',
									'$nombre',
									'$apellido')");
									
		if($this->db->errno==0)
		{
			$id_persona=$this->db->query("SELECT LAST_INSERT_ID() as 'id_persona' FROM personas");
			$id_persona=$id_persona->fetch_assoc();
			$id_persona=$id_persona['id_persona'];
			
			$pass=md5($clave);
			$now=strtotime("now");
		
			$this->db->query("INSERT INTO usuarios(
									id_persona,
									id_grupo,
									usuario,
									clave,
									ultima_entrada
									)VALUES(
									'$id_persona',
									'$id_grupo',
									'$usuario',
									'$pass',
									'$now')");
			if(!$this->db->errno)
			{
				$this->db->commit();
				$this->db->query("UNLOCK TABLES");
				$this->msgTipo="ok";
				$this->mensaje="Se ha registrado el usuario correctamente...";
				$this->estatus = true;
				$this->json=json_encode($this);
				return $this->estatus;
			}
			$this->msgTipo="ok";
			$this->mensaje="No se puedo registrar el usuario en este momento, por favor intenta mas tarde... Disculpe las molestias causadas.";
			$this->estatus = false;
			$this->json=json_encode($this);
			$this->db->rollback();
			$this->db->query("UNLOCK TABLES");
			return $this->estatus;
		}
		if($this->db->errno==1062)
		{
			$this->msgTipo="error";
			$this->mensaje="El usuario o la cedula ya existe, por favor elija otro";
			$this->estatus = false;
			$this->json=json_encode($this);
			return $this->estatus;
		}
		else
		{
			$this->mensaje="No te pudimos registrar en este momento, por favor intenta mas tarde... Disculpe las molestias causadas.";
			$this->msgTipo="error";
			$this->estatus = false;
			$this->json=json_encode($this);
			$nofiticar=new notifica;
			$narray['Class']="usuario.class.php";
			$narray['Metodo']="Registrar";
			$narray['datos']=array($id_nivel,$cedula,$usuario,$clave,$acepto);
			$narray['N° Error']=$this->db->errno;
			$narray['Error Mysql']=$this->db->error;
			$narray['Session']=$_SESSION;
			$nofiticar->enviar($narray);
			return $this->estatus;
		}
	}
	//***********************************************************************************************************
	public function perfil($id_persona)
	{
		if(!$id_persona)
		{
			$this->mensaje="es requerido el id de la persona...";
			$this->msgTipo="aviso";
			$this->estatus = false;
			$this->json=json_encode($this);
			return $this->estatus;
		}
		$this->db = new db;
		$datos_persona=$this->db->query("SELECT * FROM vpersonas WHERE id_persona='$id_persona'");
		if($datos_persona->num_rows)
		{
			$this->msgTipo="ok";
			$this->mensaje="Se han mostrado los datos del perfil correctamente...";
			$this->estatus = true;
			$this->datos=$datos_persona->fetch_assoc();
			$this->json=json_encode($this);
			return $this->estatus;
		}
		$this->msgTipo="ok";
		$this->mensaje="Error al tratar de mostrar el perfil del usuario...";
		$this->estatus = false;
		$this->json=json_encode($this);
		return $this->estatus;
	}
	//***********************************************************************************************************
	public function notificar($titulo,$datos)
	{	
		$para      = '@';
		$asunto = "Teresita - $this->msgTipo";
				
		$cabeceras  = 'MIME-Version: 1.0' . "\r\n";
		$cabeceras .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
		$cabeceras .= 'From: nombre (Webmaster) <webmaster@.com>' . "\r\n";
		//$headers .= 'Cc: birthdayarchive@example.com' . "\r\n";
		//$headers .= 'Bcc: birthdaycheck@example.com' . "\r\n";
		
		$comentario="<pre>".$this->mensaje."<br><br>";
		$comentario.=$titulo."<br><br>";
		$comentario.=print_r($datos,true)."<br><br>";
		$comentario.=print_r($this->db,true)."<br><br></pre>";
				
		mail($para, $asunto, $comentario, $cabeceras);
	}
	//***********************************************************************************************************
	public function cambiar_clave($clave_actual, $nueva_clave, $repita_clave)
	{
		$this->msgTitle = "Cambio de clave de usuario";
		if(!$this->session)
		{
			$this->mensaje = "Debe iniciar sesión...";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
		}
		if($nueva_clave != $repita_clave)
		{
			$this->mensaje = "Las claves nuevas son diferentes...";
			$this->msgTipo = "aviso";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
		}
		$clave_actual = md5($clave_actual);
		$nueva_clave = md5($nueva_clave);
		$this->db = new db;
		$usuarios = $this->db->query("SELECT * FROM usuarios WHERE id_persona='$this->id_persona' AND clave='$clave_actual'");
		if($usuarios->num_rows)
		{
			$this->db->query("UPDATE usuarios SET clave='$nueva_clave' WHERE id_persona='$this->id_persona'");
			$this->mensaje = "Su clave ha sido cambiada correctamente...";
			$this->msgTipo = "ok";
			$this->estatus = true;
			$this->json = json_encode($this);
			//mandar correo.
			return $this->estatus;
		}
		else
		{
			$this->mensaje = "La contraseña actual es incorrecta...";
			$this->msgTipo = "error";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
		}
	}
	//***********************************************************************************************************
	public function modificar($correo)
	{
		if(!PHPMailer::ValidateAddress($correo))
		{
			$this->mensaje="El correo es inválido...";
			$this->msgTipo="error";
			$this->estatus = false;
			$this->json=json_encode($this);
			return $this->estatus;
		}
		$this->db->query("UPDATE usuarios set correo='$correo' WHERE id_usuario='$this->id_usuario'");
		if($this->db->num_error==0)
		{
			$this->msgTipo="ok";
			$this->mensaje="Se han actualizado los datos con éxito...";
			$this->estatus = true;
			$this->json=json_encode($this);
			return $this->estatus;
		}
		else
		{
			$this->mensaje="No te pudimos cambiar el correo en este momento, por favor intenta mas tarde... Disculpe las molestias causadas.";
			$this->msgTipo="error";
			$this->estatus = false;
			$this->json=json_encode($this);
			$this->notificar("Cambio de correo del usuario",array($correo));
			return $this->estatus;
		}
	}
	
	//***********************************************************************************************************
	public function activar($id_persona)
	{
		$this->db = new db;
		$this->db->query("UPDATE usuarios SET estatus='1' WHERE id_persona='$id_persona'");
		$this->mensaje="El usuario ha sido activado";
		$this->msgTipo="ok";
		$this->estatus = true;
		$this->json=json_encode($this);
		return $this->estatus;
	}
	//***********************************************************************************************************
	public function inactivar($id_persona,$estatus)//el estatus que se desea colocar
	{
		$this->db = new db;
			$cambiar = $this->db->query("UPDATE user SET estatus='$estatus' WHERE id_historia='$id_persona'");
			$this->mensaje="El usuario ha sido Inactivado";
			$this->msgTipo="ok";
			$this->estatus = true;
			$this->json=json_encode($this);
			return $this->estatus;
	}
	//***********************************************************************************************************
	
	public function login($id, $clave)
	{
		$this->msgTitle="Usuario - iniciar sesión";
		
		$this->db = new db;
		$usuarios = $this->db->query("SELECT * FROM vusuarios WHERE usuario='$id' AND clave='$clave'");
		if($usuario =$usuarios->fetch_assoc())
		{	
			$this->id=$_SESSION[SISTEMA]['id_persona']=$usuario['id'];
			$this->identificacion=$_SESSION[SISTEMA]['identificacion']=$usuario['usr_cod'];
			$this->id_grupo=$_SESSION[SISTEMA]['id_grupo']=$usuario['id_grupo'];
			$this->usuario=$_SESSION[SISTEMA]['usuario']=$usuario['usr'];
			$this->grupo=$_SESSION[SISTEMA]['grupo']=$usuario['grupo'];
			$this->nombre=$_SESSION[SISTEMA]['nombre']=$usuario['nombre'];
			$this->session=$_SESSION[SISTEMA]['session'] = true;
			
			$this->mensaje="Se ha iniciado session correctamente...";
			$this->msgTipo="ok";
			$this->estatus = true;
			$this->json=json_encode($this);
			return $this->estatus;
		}
		else
		{
			$this->msgTipo="error";
			$this->mensaje="El usuario y la contraseña son incorrectos...";
			$this->estatus = false;
			$this->json=json_encode($this);
			return $this->estatus;
		}
	}
	//***********************************************************************************************************
	public function cargar()
	{
		if(!isset($_SESSION[SISTEMA]['usuario']))
		{
			$this->session=FALSE;
			$this->mensaje="No hay session de usuario...";
			$this->msgTipo="aviso";
			$this->estatus = false;
			$this->json=json_encode($this);
			return $this->estatus;
		}
		$this->id_persona=$_SESSION[SISTEMA]['id_persona'];
		$this->identificacion=$_SESSION[SISTEMA]['identificacion'];
		$this->id_grupo=$_SESSION[SISTEMA]['id_grupo'];
		$this->usuario=$_SESSION[SISTEMA]['usuario'];
		$this->grupo=$_SESSION[SISTEMA]['grupo'];
		$this->nombre=$_SESSION[SISTEMA]['nombre'];
                $this->session=$_SESSION[SISTEMA]['session'];	
		$this->mensaje="Se cargo el usuario desde la session...";
		$this->msgTipo="ok";
		$this->estatus = true;
		$this->json=json_encode($this);
		return $this->estatus;
	}
	//***********************************************************************************************************
	public function nivel($id_nivel,$id_usuario="")
	{
		if(!$id_usuario)
			$id_usuario=$this->id_usuario;
		$this->db = new db;
		$this->db->query("UPDATE usuarios SET id_nivel='$id_nivel' WHERE id_usuario='$id_usuario'");
		if($this->db->num_error==0)
		{
			$this->mensaje="Se ha cambiado el nivel de usuario con exito...";
			return $this->estatus;
		}
		else
		{
			$this->mensaje="No se pudo cambiado el nivel de usuario con exito...";
			return $this->estatus;
		}
	}
        public function editar($id_persona,$correo,$clave_anterior,$clave_nueva)
        {
            if(!$id_persona)
		{
			$this->mensaje="es requerido el id de la persona...";
			$this->msgTipo="aviso";
			$this->estatus = false;
			$this->json=json_encode($this);
			return $this->estatus;
		}
                
                $this->db = new db;
		//-------confirmacion del usuario
                $verificar = $this->db->query("select * from user where id_historia = '$id_persona' and clave = '$clave_anterior'");
                
                if($verificar->num_rows)
		{
		$datos_persona=$this->db->query("UPDATE persona_historia p, user u SET p.correo = '$correo', u.clave = '$clave_nueva' where p.id = u.id_historia and p.id = '$id_persona'");
		
                    $this->msgTipo="ok";
			$this->mensaje="Se han actualizado los datos del perfil correctamente....";
			$this->estatus = true;
			$this->datos=$datos_persona->fetch_assoc();
			$this->json=json_encode($this);
			return $this->estatus;
		}
		$this->msgTipo="ok";
		$this->mensaje="Error al tratar de actualizar los datos de usuario...";
		$this->estatus = false;
		$this->json=json_encode($this);
		return $this->estatus;
        }
	//***********************************************************************************************************
	public function recuperar_clave($correo)
	{
		$this->db = new db;
		$usuarios = $this->db->query("SELECT * FROM vusuarios WHERE usuario='$correo' OR correo='$correo'");
		if($usuario = $usuarios->fetch_array())
		{	
			$usuario['clave'] = RandomString(8);
			$para = $usuario['correo'];
			$usuario['codigo'] = md5($usuario['usuario']);
			$usuario['base'] = $_SERVER['HTTP_HOST']."";
			$usuario['nombre_sistema'] = NOMBRE;
			
			$asunto = "Solicitud de cambio de clave.";
			
			$cabeceras  = 'MIME-Version: 1.0' . "\r\n";
			$cabeceras .= 'Content-type: text/html; charset=utf-8' . "\r\n";
			$cabeceras .= 'From: '.NOMBRE.' <webmaster@'.$_SERVER['HTTP_HOST'].'>' . "\r\n";
			
			$html = new plantilla;
			$message = $html->html(ROOT_DIR."html/plantilla_clave.html",$usuario);
			
			$clave = md5($usuario['clave']);
			$this->db->query("UPDATE usuarios SET clave='$clave' WHERE id_persona = '$usuario[id_persona]'");
			if($this->db->errno != 0)
			{
				$this->mensaje = "No se pudo actualizar la información en este momento. Por favor, inténtelo de nuevo más tarde.";
				$this->msgTipo = "ok";
				$this->estatus = false;
				$this->json = json_encode($this);
				return $this->estatus;
			}
			$mail = new PHPMailer();

			$mail->IsSMTP();  // telling the class to use SMTP
			$mail->Host     = SMTP;
			$mail->IsHTML(true);

			$mail->FromName = NOMBRE;
			$mail->From     = "webmaster@".$_SERVER['HTTP_HOST'];
			$mail->AddAddress($para);

			$mail->Subject  = $asunto;
			$mail->Body     = $message;
			$mail->WordWrap = 50;
			
			if($mail->Send())
			{
				$this->mensaje = "Se ha enviado un correo con las instrucciones...";
				$this->msgTipo = "ok";
				$this->estatus = true;
				$this->json = json_encode($this);
				return $this->estatus;
			}
			else
			{
				$this->mensaje = "Error inesperado al intentar procesar su solicitud. Por favor, inténtelo de nuevo más tarde.";
				$this->msgTipo = "error";
				$this->estatus = false;
				$this->json = json_encode($this);
				return $this->estatus;
			}
		}
		else
		{
			$this->mensaje = "No se encontro ningun usuario o correo registrado con: '$correo'";
			$this->msgTipo = "error";
			$this->estatus = false;
			$this->json = json_encode($this);
			return $this->estatus;
		}
	}
        //***********************************************************************************************************
	public function valida_codigo($codigo)
	{
		$this->db = new db;
		$usr_cods = $this->db->query("CALL valida_codigo('".$codigo."',@cod_libro, @cod_grado)");
                $usr_cod = $this->db->query("SELECT @cod_libro cod_libro, @cod_grado cod_grado");

                $item=$usr_cod->fetch_assoc();
                
                if($item['cod_libro']!=null){	
                    $usr_cod->data_seek(0);
                    
                    while($item=$usr_cod->fetch_assoc()){
                        $this->datos[]=$item;
                    }

                    $this->estatus = true;
                    $this->mensaje = "El codigo existe ";
                    $this->msgTipo = "ok";					
		}
		else
		{
			$this->mensaje = "El código no existe...";
			$this->msgTipo = "error";
			$this->estatus = false;			
		}
                $this->json = json_encode($this);
		return $this->estatus;
	}
        public function listar()
        {
            $this->db = new db;
            $listado = $this->db->query("select * from vuser");
            if ($listado->num_rows)
            {
                while($listar = $listado->fetch_assoc())
                {
                $this->datos['usuarios'][] = $listar;
                $this->mensaje = "se han listado los usuarios";
                $this->estatus = true;
                return $this->estatus;
                }
            }
        }
	//***********************************************************************************************************
	public function session()
	{
		return $this->session;
	}
	//***********************************************************************************************************
	public function standby()
	{
 		$standby=(strtotime("now") - $this->standby);
 		if($standby>=STANDBY*60)
 		{
			$this->mensaje="Se ha cerrado la session, por inactivad";
			$this->msgTipo="info";
			$this->cerrar_session();
 		}
 		else
			$_SESSION[SISTEMA]['standby']=strtotime("now");
	}
	//***********************************************************************************************************
	public function cerrar_session()
	{
		session_unset();
	}
	//***********************************************************************************************************
	public function __destruct()
	{
		
	}
}