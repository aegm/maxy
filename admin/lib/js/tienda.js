/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(function(){
   $(function(){
       
      $('#imagenes').perfectScrollbar(0);
      //LISTANDO LAS CATEGORIAS 
      $.post("ajax.php",{a: "listar-categorias"}, function(data){
		if(data.estatus)
		{
			var html ='<option value="">Seleccione</option>';
					$.each(data.datos, function(i,item){
						html+='<option value="'+item.id_categoria+'">'+item.nombre+'</option>';
					});
				html +=  '</select>';
			 html;	
			 $('#slt-categoria').html(html);
			 //$(id_campo).val(selected);
			
		}
		else
			$(".mensaje").html(data.mensaje).dialog('open');
	},"json"); 
   });
   
   $('#slt-categoria').change(function(){
      productos($(this).val(),'#slt_producto');   
   });
   
   $('#btn-buscar').click(function(){
       var cat = $('#slt-categoria').val();
       var pro = $('#slt_producto').val();
       $.post("ajax.php",{a: "listar-imagen", cat:cat,pro:pro}, function(data){
            if (data.estatus){
                    var html ='';
                    $.each(data.imgFile, function(i,item){
                            html+='<a class="grid_itemContainer">';
                            html+='<div class="grid_imageContainer">';
                            html+='<img src=http://localhost/maxy/img/ropa/'+cat+'/'+pro+'/'+item+' class="grid_imagencarrusel">'; 
                            html+='<div class="grid_name">ABRIGO MILITAR JACQUARD</div>';
                            html+='<div class="grid_price"><span class="currency">VEF&nbsp;</span><span class="integer">1.299</span><span class="decimals">,00</span></div>';
                            html+='</a>';
                    });

                    $('#imagenes').html(html);
           }
       },"json");
   });
});
