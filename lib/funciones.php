<?php
	function paginado($pag_actual,$total_items,$cantidad_items=100,$cantidad_botones=9)
	{
		$siguiente = $pag_actual+1;
		$anterior = $pag_actual-1;
		$paginado = "";
		$n = ceil($total_items/$cantidad_items);
		$cant = floor($cantidad_botones/2);
		$inicio_pagina = $pag_actual-$cant;
		
		if($inicio_pagina < 1)
			$inicio_pagina = 1;
		
		if(($inicio_pagina > $n-$cantidad_botones+1) && $n > $cantidad_botones)
			$inicio_pagina = $n-$cantidad_botones+1;
		
		$fin_pagina = $inicio_pagina + $cantidad_botones-1;
		
		if($fin_pagina > $n)
			$fin_pagina = $n;
			
		if($pag_actual != 1)
			$paginado['primera'] = $paginado['paginas']['primera'] = 1;
		
		if($pag_actual>1)
			 $paginado['anterior'] = $paginado['paginas']['anterior'] = $anterior;
			
		/*if($pag_actual > $cant+2)
			$paginado['paginas']['separador_inicial'] = $paginado['separador_inicial'] = "...";
		else
			$paginado['separador_inicial'] = "";*/
			
		for($i=$inicio_pagina;$i<=$fin_pagina;$i++)
			$paginado['paginas'][] = $i;
		
		$paginado['actual'] = $pag_actual;
		$paginado['total'] = $total_items;
		
		/*if($pag_actual < $n-$cant-1)
			$paginado['paginas']['separador_final'] = $paginado['separador_final'] = "...";
		else
			$paginado['separador_final'] = "";*/
			
		if($pag_actual<$n)
			$paginado['paginas']['siguiente'] = $paginado['siguiente'] = $siguiente;
		
		if($pag_actual != $n)
			$paginado['paginas']['ultima'] = $paginado['ultima'] = $n;
			
		if($n==1)
			return false;
		else
			return $paginado;
	}
	function consola($valores,$nombre,$resetear=1)
	{
		if(CONSOLA && $_SERVER['REMOTE_ADDR'] == gethostbyname(DNS_DESARROLLO))
		{
			global $consola;
			global $matriz;
			$html = new plantilla;
			
			if($resetear)
				$consola['CONSOLA'] = "******************* VECTOR DE ".strtoupper($nombre)." ********************\n\n".print_r($valores,true);
			else
				$consola['CONSOLA'] .= "******************* VECTOR DE ".strtoupper($nombre)." ********************\n\n".print_r($valores,true);
			
			$matriz['CONSOLA'] = $html->html(ROOT_DIR.'html/consola.html',$consola);
		}
	}
	function no_index()
	{
		global $matriz;
		global $html;
		if($_SERVER['HTTP_HOST'] == DNS_NO_INDEX)
			$matriz['NO_INDEX'] = $html->html(ROOT_DIR.'html/no_index.html');
		else
			$matriz['NO_INDEX'] = "";
	}
	function formato($formato,$valor)
	{
		if($formato == "fecha_hora")
			$valor = fecha_hora($valor);
		if($formato == "bs")
			$valor = bs($valor);
		if($formato == "edad")
			$valor = edad($valor);
		if($formato == "estatus")
			$valor = estatus($valor);
		if($formato == "cedula")
			$valor = cedula($valor);
		if($formato == "sino")
			$valor = sino($valor);
		return $valor;
	}
	function mensaje($mensaje,$tipo)
	{
		$html = new plantilla;
		if($tipo == "aviso")
			$i['icon']="ui-icon-alert";
		if($tipo == "error")
			$i['icon']="ui-icon-circle-close";
		if($tipo == "ok")
			$i['icon']="ui-icon-circle-check";
		if($tipo == "info")
			$i['icon']="ui-icon-info";
		return $html->html(ROOT_DIR.'html/i.html',$i).$mensaje;
	}
	function mantenimiento()
	{
		global $usuario;
		if($_SERVER['REMOTE_ADDR'] != gethostbyname(DNS_MANTENIMIENTO))
		{
			$usuario->cerrar_session();
			header("Location: ".ROOT_URL."mantenimiento.php");
		}
	}
	function sino($numero)
	{
		if($numero == 1)
			return "Si";
		else
			return "No";
	}
	function bs($numero)
	{
		return "Bs. ".number_format($numero,"2",",",".");
	}
	function cedula($numero)
	{
		if($numero && is_numeric($numero))
			return number_format($numero,0,",",".");
		else
			return $numero;
	}
	function edad($strtotime_nac)
	{
		list($dia_nacimiento, $mes_nacimiento, $ano_nacimiento) = explode("/",date("j/n/Y",$strtotime_nac));
		list($dia_actual, $mes_actual, $ano_actual) = explode("/",date("j/n/Y"));
		
		$anos = $ano_actual - $ano_nacimiento -1;
		if($anos)
			if($mes_actual >= $mes_nacimiento)
			{
				if($mes_actual == $mes_nacimiento)
				{
					if($dia_actual >= $dia_nacimiento)
						$anos++;
				}
				else
					$anos++;
			}
		
		return $anos." Años. "; //.date("d/m/Y",$strtotime_nac);
	}
	function estatus($estatus)
	{
		if($estatus == 0)
			return "Cto. Anulado";
		if($estatus == 1)
			return "Activo";
		if($estatus == 2)
			return "Inactivo";
		if($estatus == 3)
			return "Cto. Vencido";
	}
	function extension($archivo)
	{
		return substr(strrchr($archivo, '.'), 1);
	}
	function incluir_lib($archivo,$tipo="")
	{
            if(!$tipo)
			$tipo = extension($archivo);
			
		$ht =  new plantilla;
		if($tipo == "css")
			return $ht->html(ROOT_DIR."html/css.html",array("href"=>$archivo,"media"=>"all"));
		if($tipo == "js")
			return $ht->html(ROOT_DIR."html/js.html",array("src"=>$archivo));
	}
	function fecha($fecha,$o = "")
	{
		if(!$fecha)
			return "";
		if(is_numeric($fecha))
			return date("d/m/Y",$fecha);
		else
		{
			$fecha = explode("/",$fecha);
			$fecha = $fecha[2]."-".$fecha[1]."-".$fecha[0];
			return strtotime($fecha);
		}
	}
	function hora($fecha_hora,$o = "")
	{
		if(is_numeric($fecha_hora))
			return date("g:i:s a",$fecha_hora);
		else
		{
			$fecha_hora = explode(" ",$fecha_hora);
			$fecha = $fecha_hora[0];
			$hora = $fecha_hora[1]." ".$fecha_hora[2];
			$fecha = explode("/",$fecha);
			$fecha = $fecha[2]."-".$fecha[1]."-".$fecha[0];
			return strtotime($hora);
		}
	}
	function fecha_hora($fecha_hora)
	{
		if(is_numeric($fecha_hora))
			return date("d/m/Y - g:i:s a",$fecha_hora);
		else
		{
			$fecha_hora = explode(" ",$fecha_hora);
			$fecha = $fecha_hora[0];
			$hora = $fecha_hora[1]." ".$fecha_hora[2];
			$fecha = explode("/",$fecha);
			$fecha = $fecha[2]."-".$fecha[1]."-".$fecha[0];
			return strtotime($fecha." ".$hora);
		}
	}
	function arbol($vector,$html,$i=0)
	{
		$ht =  new plantilla;
		$lista = "";
		
		foreach($vector as $campo => $valor)
		{
			//echo "<textarea>Valor: ".print_r($valor,true)."</textarea><br>";
			//echo "<textarea>pregunto por if(is_array(".$valor[$html[$i+1]]."))\n vuelta: $i</textarea><br>";
			if(isset($html[$i+1]) && is_array($valor[$html[$i+1]]))
			{
				//echo "<textarea>Rec. vuelta: $i\n\n arbol(Valor[".$html[$i+1]."],".$html.",".($i+1).")</textarea><br>";
				$valor[$html[$i+1]] = arbol($valor[$html[$i+1]],$html,$i+1);
			}
			$lista .= $ht->html("html/".$html[$i]."_lista.html",$valor);
		}
		$r=$i;
		$i++;
		return $ht->html("html/".$html[$r].".html",array($html[$r]=>$lista));
	}
	function escapar($valores)
	{
		if(is_array($valores))
		{
			foreach($valores as $campo => $valor)
				$valores[$campo] = escapar($valor);
			return $valores;
		}
		else
			return addslashes($valores); 
	}
	function RandomString($length=10,$uc=FALSE,$n=TRUE,$sc=FALSE)
	{
		$source = "abcdefghijklmnopqrstuvwxyz";
		if($uc==1) $source .= "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		if($n==1) $source .= "1234567890";
		if($sc==1) $source .= "|@#~$%()=^*+[]{}-_";
		if($length>0)
		{
			$rstr = "";
			$source = str_split($source,1);
			for($i=1;$i<=$length;$i++)
			{
				mt_srand((double)microtime() * 1000000);
				$num = mt_rand(1,count($source));
				$rstr .= $source[$num-1];
			}
		}
		return $rstr;
	}
	function formulario_html($id,$datos="",$direccion)
	{
            	$html_form = "";
		$html = new plantilla;
		$form = new formulario;
		if(!$form->mostrar($id))
		{
			global $matriz;
			$matriz['MENSAJE'] = $form->mensaje;
			$matriz['MSGTIPO'] = $form->msgTipo;
			$matriz['MSGTITLE'] = $form->msgTitle;
			return false;
		}
		//consola($form->datos,"formulario");
		foreach($form->datos as $formulario)
		{
			$html_fieldset = "";
			foreach($formulario['fieldsets'] as $fieldset)
			{
                            $html_campos = "";
                            $fieldset['LEGEND'] = "";
                            
                            
                            foreach($fieldset['campos'] as $campo)
				{
					if(isset($datos[$campo['id']]))
						$campo['value'] = $datos[$campo['id']];
						
					$campo['LABEL'] = ucfirst($campo['LABEL']);
					$campo['SOLO_LECTURA'] = $campo['SOLO_LECTURA']?" readonly":"";
					$campo['OBLIGATORIO'] = $campo['OBLIGATORIO']?" required":"";
                                        $campo['MARCAR'] = $campo['OBLIGATORIO']?"(*)":"";
					$campo['DESHABILITADO'] = $campo['DESHABILITADO']?" disabled":"";
                                        $fieldset['LEGEND'] = $campo['LEGEND'];
                                        
                                        
                                        if ($campo['TIPO'] == "text"){
                                        $campo['ESTYLE'] =   $campo['ESTYLE']="add-on";
                                        }else
                                            if ($campo['TIPO'] == "radio"){
                                        $campo['ESTYLE'] =   $campo['ESTYLE']="label label-important";
                                        }
                                        
                                        if ($campo['TIPO'] == "radio" && isset ($campo['INFO']))
                                        $campo['ETIQUETA'] = $html->html(ROOT_DIR."html/etiqueta.html",array("ETIQUETA"=>$campo['INFO']));
					//************************adicionales***********************/
					
                                        $adicionales_html = "";
						foreach($campo['adicionales'] as $adicional)
						{
                                                    if (!empty($adicional)){
                                                    $adicional['DESHABILITADO'] = $adicional['DESHABILITADO']?" disabled":"";
							$adicionales_html .= $html->html(ROOT_DIR."html/".$adicional['TYPE_CAMPO'].".html",$adicional);
                                                    }
						}
					$campo['ADICIONALES'] = $adicionales_html;
					//**************************en el caso de que sea Una Etiqueta Lateral***********************************/
					
                                        
                                        if($campo['TIPO']=="textarea")
					{
						$html_campos .= $html->html(ROOT_DIR."html/form_textarea.html",$campo);
                                        }
                                        else
                                            if($campo['TIPO']=="select")
					{	
						$campo['options'] = "";
						if($campo['DATOS'])
						{
                                                    $campo['options'] = $html->html(ROOT_DIR."html/form_option.html",array("UADMIN"=>"","UADMIN_DES"=>"Seleccione","selected"=>""));
							foreach($campo['datos'] as $dato)
							{							
                                                               $dato['selected'] = "";
								if(isset($dato[$campo['DATOS_VALUE']]) && $dato[$campo['DATOS_VALUE']] == $direccion)
									$dato['selected'] = "selected";
								$campo['options'] .= $html->html(ROOT_DIR."html/form_option.html",$dato);
							}
						}
                                                	
						if(isset($dato['select'][$campo['UADMIN']]))
						{	
                                                    $campo['options'] .= $html->html(ROOT_DIR."html/form_option.html",array("UADMIN"=>"","UADMIN_DES"=>"Seleccione","selected"=>""));
						
                                                        foreach($dato['select'][$campo['UADMIN']] as $dato)
								$campo['options'] .= $html->html(ROOT_DIR."html/form_option.html",$dato);
						}
                                                
						$html_campos .= $html->html(ROOT_DIR."html/form_select.html",$campo);
					}
					else
					    $html_campos .= $html->html(ROOT_DIR."html/form_campo.html",$campo);
                                        
				}
				
                                $fieldset['campos'] = $html_campos;
				$html_fieldset .= $html->html(ROOT_DIR."html/form_fieldset.html",$fieldset);
                                
			}
			/************************* Hiddens ***********************/
                        $formulario['campos_ocultos'] = "";
			if(isset($formulario['hiddens']) && $formulario['hiddens'])
				foreach($formulario['hiddens'] as $campo_hidden)
					$formulario['campos_ocultos'] .= $html->html(ROOT_DIR."html/form_hidden.html",$campo_hidden);

			/************************ botones ***********************/
			
			$html_boton = "";
			if($formulario['botones'])
				foreach($formulario['botones'] as $boton)
				{
					
                                        $boton['deshabilitado'] = $boton['deshabilitado']?" disabled":"";
					$html_boton .= $html->html(ROOT_DIR."html/form_boton.html",$boton);
				}
			$formulario['botones'] = $html_boton;
                      
			/**********************************************************/
			$formulario['fieldsets'] = $html_fieldset;
			$html_form .= $html->html(ROOT_DIR."html/form.html",$formulario);
                        }
		return $html_form;
	}
?>