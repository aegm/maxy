<?php
//----------------------------------------------------------
// NOMBRE: imgage.class.php
// DESCRIPCION: Objeto creado para el almacenado de Imagenes
//----------------------------------------------------------
// AUTOR: Ing. Angel Gonzalez
// CORREO: angeledugo@gmail.com
// FECHA: 12/07/2012 -=- Versión 1.0
//----------------------------------------------------------

//----------------------------------------------------------
// 						LIBRERIAS USADAS
//----------------------------------------------------------
//include_once("resizeimage.inc.php");

//----------------------------------------------------------
// 						DEFINICIÓN DE LA CLASE
//
//	ATRIBUTOS: 	dbs (Objeto base de datos)
//					
//----------------------------------------------------------
require_once '../config.php';
class image {
                public $imgFile="";
		public $imgWidth=0;
		public $imgHeight=0;
		public $imgType="";
		public $imgAttr="";
		public $type=NULL;
		public $_img=NULL;
                public $msg = "";
		public $error="";
               	public $estatus;
                public $json="";
                public $mensaje;


                public function temporal($conv)
     {
        
        $error = "";
	$msg = "";
	$fileElementName = 'imagen';
	$folder = "tmp/";
	$maxlimit = 1; // limite de la imagen
	$allowed_ext = "jpg,gif,png,bmp"; // extenciones
	$overwrite = "no"; // no permita reescribir
	$match = "";
        
        // verficando el tamaño del archivo en bytes
        $filesize = $_FILES[$fileElementName]['size'];
        // verficando el nombre del arhivo y pasandola a minusculas
        $filename = strtolower($_FILES[$fileElementName]['name']);
        // separando el nombre del archivo de su extencion
        $file_ext = preg_split("/\./",$filename); // Separa el nombre del archivo y su extension
        // toma las extension definida
        $allowed_ext = preg_split("/\,/",$allowed_ext);
       
        //verficamos si exsite algun error
        if(!empty($_FILES[$fileElementName]['error']))
	{
		switch($_FILES[$fileElementName]['error'])
		{

			case '1':
				$error = 'Error! Puede que el tama�o supere el maximo permitido por el servidor.';
				break;
			case '2':
				if($filesize > $maxlimit) // el archivo supera el maximo
					$error = 'Error! Puede que el tama�o supere el maximo permitido por el servidor. Intentelo de nuevo.';
				break;
			case '3':
				$error = 'Error! El archivo fue cargado parcialmente';
				break;
			case '4':
				if($filesize < 1)
					$error = 'NO ha adjuntado ninguna imagen.';
				break;

			case '6':
				$error = 'Falta la carpeta temporal';
				break;
			case '7':
				$error = 'Fallo al escribir sobre el disco';
				break;
			case '8':
				foreach($allowed_ext as $ext){
				   if($ext==$file_ext[1]) 
					$match = "1"; // Permite el archivo
				   elseif(!$match)
					$error = 'Extension no permitida';
				}
				break;
			case '999':
			default:
				$error = 'Error desconocido';
		}
               
        }elseif(empty($_FILES[$fileElementName]['tmp_name']) || $_FILES[$fileElementName]['tmp_name'] == 'none'){
		$error = 'El archivo no fue cargado..';
        }else{
           if(move_uploaded_file($_FILES[$fileElementName]['tmp_name'], $folder.$filename)){
			$msg .= " El archivo: " . $filename . ", ";
			$msg .= " de tama&ntilde;o: " . $filesize ." se ha subido correctamente!";
			//RENOMBRANDO EL ARCHIVO Y ALMACENANDOLO EN UNA VARIABLE DE SESSION
                        
                        
                        if(isset($_SESSION['cant_images']))
                            $_SESSION['cant_images']+=1;
                        else 
                            $_SESSION['cant_images']=1;
                        
                        rename($folder.$filename, $folder.$_SESSION['archivo']."_".$_SESSION['cant_images'].".".$file_ext[1]);
                        @unlink($_FILES[$fileElementName]);               
           }
        }
     }
     public function almacenar($obra, $año, $nro_conver,$archivo)
     {
        //DIRECTORIOS PARA EL ALMACENADO DE TEMPORAL A FIJA
         $folder_tmp = "tmp/"; //temporal 
         $folder = $archivo; // final
         
        //SUBDIRECTORIOS
         // vericamos que sea un direcctorio
         if (is_dir($folder_tmp)){
         $folder_tmp = opendir($folder_tmp); // se abre el directorio
         $i=0;
             while($img = readdir($folder_tmp))
             {
                 if($img != "." && $img !=".." && $pic != "thumbs.db" && rtrim($img,' ')!='')
                 {
                     $tmp = explode("_",$img);
                     if($tmp[0]==$_SESSION['archivo']){
                       
                         rename("tmp/".$img, $folder.$obra."_".$tmp[0].$tmp[0][$i].$tmp[1]);
                       //@unlink("tmp/".$img);
                       
                     } 
                 }
                 $i++;
             }
          closedir($folder_tmp);    // se cierra el directorio
         }   
     }
     public function directorio($dat)
     {
        
        //RAIZ DEL DIRECTORIO
         $conv = $dat[1];
         //DIRECCTORIO O SUBRAIZ FECHA
         $fecha = explode("/", $dat[0]);
         $fecha = $fecha[2];
         //SERVICIO 
         $ser = $dat[2];
         //ARCHIVOS BUSCADOS 

        //VALIDANDO LA EXISTENCIA DE LOS DIRECCTORIOS
         $raiz = "adjunto/".$conv."/".$fecha."/".$ser."/";
             if(is_dir($raiz))
             {
                        //verificamos que tenga archivos
                        $archivos = opendir($raiz);
                        $allowed_ext = "jpg,gif,png,bmp";  
                        $allowed_ext = preg_split("/\,/",$allowed_ext);
                         while ($img = readdir($archivos)){
                         //validando la extencion
                             $exten = explode(".", $img);
                             foreach($allowed_ext as $ext)
                             {
                                   if($ext==$exten[1])
                                   {
                                                $image = explode("_", $img);
                                                $image = $image[0];
                                                 if ($image == $dat[2])
                                                 {
                                                     $this->mensaje = "Si Posee Imagenes En la Galeria";
                                                     $this->estatus = true;
                                                 }else{
                                                     $this->mensaje = "No Posee Imagenes En la Galeria";
                                                     $this->estatus = false;
                                                 }
                                   }else{
                                                $this->mensaje = "Extencion no permitida";
                                   }
                             }
                                 
                         }
             }
             $this->json = json_encode($this);
             return $this->estatus;
     }
     public function listar($cat, $pro,$item)
     {
       $cat = 'ropa';
       $pro = 'jeans';
         //raiz de apertura
         $raiz = $_SERVER['DOCUMENT_ROOT']."/maxy/img/ropa/";
         if(is_dir($raiz.$cat."/".$pro."/"))
         {
             $archivo = opendir($raiz.$cat."/".$pro."/");
             $allowed_ext = "jpg,gif,png,bmp";  
             $allowed_ext = preg_split("/\,/",$allowed_ext);
             while($img = readdir($archivo)){
                    //comprobando la extencion
                 $exten = explode(".", $img);
                    foreach($allowed_ext as $ext){
			   if($ext==$exten[1]){ 
                              
					$this->imgFile[] = $img;
                                        $this->estatus = true;
                           }else{
					$this->mensaje = "Extencion no permitida";
                           }
		     }
             }  
         }
          $this->json = json_encode($this);
          return $this->estatus;
     }
     public function eliminar($conv, $ano,$serv)
     {
      
         if($conv && $ano && $serv)
         {
            $raiz = "adjunto/";
            $dir = $raiz.$conv."/".$ano."/".$serv."/";
              if(is_dir($dir))
            {
                $archivos = opendir($dir);
                while($img = readdir($archivos))
                {
                    unlink($dir.$img);
                }
                closedir($dir);
                $this->estatus = true;
            }else{
                $this->estatus  = true;
            }
            return $this->estatus;
         }    
     }
                
}