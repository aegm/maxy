$(document).ready(function(){
    /**************quitando el espacio en blanco *******************/
    $('input[type=text]').click(function() {
        if(this.value == ' ') {
            this.value = '';
        }
    });
      
	$( ".tabs" ).tabs();
	$('.accordion').accordion({collapsible: true,active: false});
	$('.gg-button').button();
	$('.gg-button-ok').button({icons:{primary: 'ui-icon-check'}});
	$('.gg-button-eliminar').button({icons:{primary: 'ui-icon-cancel'}});
	$('.gg-button-print').button({icons:{primary: 'ui-icon-print'}});
	$('.gg-icon-ok').button({text:false,icons:{primary: 'ui-icon-circle-check'}});
	$('.gg-icon-agregar').button({text:false,icons:{primary: 'ui-icon-circle-plus'}});
	$('.gg-icon-editar').button({text:false,icons:{primary: 'ui-icon-pencil'}});
	$('.gg-icon-cancel').button({text:false,icons:{primary: 'ui-icon-circle-close'}});
	$('.gg-icon-eliminar').button({text:false,icons:{primary: 'ui-icon-closethick'}});
	$('.gg-icon-ver').button({text:false,icons:{primary: 'ui-icon-folder-open'}});
	$('.gg-icon-buscar').button({height:30,text:false,icons:{primary: 'ui-icon-search'}});
	$('.dialogo').dialog({
		autoOpen: false,
		hide: 'blind',
		resizable: true,
		modal: true,
		width: 'auto',
		buttons: {
			Cerrar: function(){
				$(this).dialog('close');
			}
		}
	});
	$('.mensaje').dialog({
		autoOpen: false,
		show: 'blind',
		hide: 'blind',
		resizable: false,
		modal: true,
		buttons: {
			OK: function(){
				$(this).dialog('close');
			}
		}
	});
	if($('div.mensaje').html())
	{
		$('.mensaje').show();
		$('.mensaje').dialog('open');
	}
	$('#btn-consola').button({text:false,icons:{primary: 'ui-icon-triangle-1-s'}}).click(function(){
		$("#consola").removeClass('invisible');
	});
	$('#btn-consola-s').button({text:false,icons:{primary: 'ui-icon-triangle-1-n'}}).click(function(){
		$("#consola").addClass('invisible');
	});
	$('#prueba').click(function(){
		
	});
	
	$('#user_info').click(function(){
		var options = {};
		//$('#menu_usuario').toggleClass("abierto");
		$('#menu_usuario').toggle("blind",options,300,callback());
		function callback() {
			setTimeout(function() {
				$('#menu_usuario').toggleClass("abierto");
			}, 300 );
		};
		
	});
	$('body').click(function(){
		if($('#menu_usuario').hasClass("abierto"))
		{
			var options = {};
			$('#menu_usuario').toggle("blind",options,300,callback());
		}
		function callback(){
				setTimeout(function() {
					$('#menu_usuario').toggleClass("abierto");
				}, 305 );
			};
	});
	$( ".progressbar" ).progressbar({
		value: 0
	});
	/*************************************  FUNCIONES ******************************************/
	var maxfecha=new Date();
	var hasta=(new Date()).getFullYear();
	var Rdesde=hasta-150;
	var desde=new Date(Rdesde,1);
	$.datepicker.setDefaults($.datepicker.regional['es']);
	
	$(".fecha").datepicker({
		disabled: true,
		changeMonth: true,
		changeYear: true,
		minDate: desde,
		maxDate: maxfecha,
		yearRange: Rdesde+':'+hasta
	});
	$.fn.validarForm = function(){
		var valido = true;
		var reg_correo = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
		var reg_telefono = /^0(2|4)[1-9]{2}\-[0-9]{7}$/;
		var reg_fecha = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
		
		
		var id = $(this).selector;
		$(id+' .vobli').each(function(index){
			$(this).removeClass( "ui-state-error" );
			if($(this).val()=='')
			{
				valido = false;
				$(this).addClass( "ui-state-error" );
			}
		});
		$(id+' .vcorreo').each(function(index){
			$(this).removeClass( "ui-state-error" );
			if($(this).val()!='')
			{
				if(!(reg_correo.test($(this).val())))
				{
					valido = false;
					$(this).addClass( "ui-state-error" );
				}
			}
		});
		$(id+' .vtelefono').each(function(index){
			$(this).removeClass( "ui-state-error" );
			if($(this).val()!='')
			{
				if(!(reg_telefono.test($(this).val())))
				{
					valido = false;
					$(this).addClass( "ui-state-error" );
				}
			}
		});
		$(id+' .fecha').each(function(index){
			$(this).removeClass( "ui-state-error" );
			if($(this).val()!='')
			{
				if(!(reg_fecha.test($(this).val())))
				{
					valido = false;
					$(this).addClass( "ui-state-error" );
				}
			}
		});
		if(valido)
		{
			$('.on-valid-disable').each(function(index, item){
            $(this).button("disable");
         });
		}
		return valido;
	};
      
       
});
function validar(){
	var valido = true;
	var reg_correo = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
	var reg_telefono = /^0(2|4)[1-9]{2}\-[0-9]{7}$/;
	var reg_fecha = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
	
	$('.vobli').each(function(index){
		$(this).removeClass( "ui-state-error" );
		if($(this).val()=='')
		{
			valido = false;
			$(this).addClass( "ui-state-error" );
		}
	});
	$('.vcorreo').each(function(index){
		$(this).removeClass( "ui-state-error" );
		if($(this).val()!='')
		{
			if(!(reg_correo.test($(this).val())))
			{
				valido = false;
				$(this).addClass( "ui-state-error" );
			}
		}
	});
	$('.vtelefono').each(function(index){
		$(this).removeClass( "ui-state-error" );
		if($(this).val()!='')
		{
			if(!(reg_telefono.test($(this).val())))
			{
				valido = false;
				$(this).addClass( "ui-state-error" );
			}
		}
	});
	$('.fecha').each(function(index){
		$(this).removeClass( "ui-state-error" );
		if($(this).val()!='')
		{
			if(!(reg_fecha.test($(this).val())))
			{
				valido = false;
				$(this).addClass( "ui-state-error" );
			}
		}
	});
	return valido;
}
function productos(categoria){
	$.post("ajax.php",{a: "listar-producutos",cat:categoria}, function(data){
		if(data.estatus)
		{
			var html ='<option value="">Seleccione</option>';
					$.each(data.datos, function(i,item){
						html+='<option value="'+item.id_estado+'">'+item.nombre+'</option>';
					});
				html +=  '</select>';
			 html;	
			 $(id_campo).html(html);
			 $(id_campo).val(selected);
			
		}
		else
			$(".mensaje").html(data.mensaje).dialog('open');
	},"json");
	
}
function ciudades(id_estado,id_campo,selected){
	$.post("ajax.php",{a: "listar-ciudades", id_estado: id_estado}, function(data){
		if(data.estatus)
		{
			var html='<option value="">Seleccione</option>';
			$.each(data.datos, function(i,item){
				html+='<option value="'+item.id_ciudad+'">'+item.nombre+'</option>';
			});
			$(id_campo).html(html);
			$(id_campo).val(selected);
		}
		else
			$(".mensaje").html(data.mensaje).dialog('open');
	},"json");
}

function updateTips(t,tips){
		tips
			.text(t)
			.addClass( "ui-state-highlight" );
		setTimeout(function(){
			tips.removeClass( "ui-state-highlight", 1500 );
		}, 500 );
	}
	function checkLength( o, n, min, max,tips){
		if (o.val().length > max || o.val().length < min ){
			o.addClass( "ui-state-error" );
			updateTips( "El tamaño de " + n + " debe ser entre " +
				min + " y " + max + "." ,tips);
			return false;
		} else {
			return true;
		}
	}
	function checkNumber( o, n,tips){
		valor = o.val();
		if(isNaN(valor))
		{
			updateTips( n ,tips);
			return false;
		}
		else
			return true;
	}
	function checkRegexp( o, regexp, n ,tips) {
		if ( !( regexp.test( o.val() ) ) ) {
			o.addClass( "ui-state-error" );
			updateTips( n ,tips);
			return false;
		} else {
			return true;
		}
	}
	function vacio(o,n,tips)
	{
		var valid=true;
		var act_valid
		$.each(o, function(i,item){
			//alert("valid: "+valid+" Item: "+i+" Val: "+item.value);
			if(item.value!="")
				valid = valid && true;
			else
			{
				$(item).addClass( "ui-state-error" );
				updateTips( n ,tips);
				valid=false;
			}
			
		});
		return valid;
	}
	function checkEmail(email,n,tips){
		return checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,n,tips);
					
	}
	
	
	
	
	/******************************* popup ******************************************/
	
	function popup(nombre,direccion, pantallacompleta, herramientas, direcciones, estado, barramenu, barrascroll, cambiatamano, ancho, alto, izquierda, arriba, sustituir){
  var opciones = "fullscreen=" + pantallacompleta +
      ",toolbar=" + herramientas +
      ",location=" + direcciones +
      ",status=" + estado +
      ",menubar=" + barramenu +
      ",scrollbars=" + barrascroll +
      ",resizable=" + cambiatamano +
      ",width=" + ancho +
      ",height=" + alto +
      ",left=" + izquierda +
      ",top=" + arriba;
      
 window.open(direccion,nombre,opciones,sustituir);
}
function ventana(nombre,pagina,ancho,largo,scrol,sustituir)
{
 popup(nombre,pagina,0,0,0,0,0,scrol,0,ancho,largo,0,0,sustituir);
}