/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(function(){
   $(function(){
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
               alert(data.imgFile);
           }
       },"json");
   });
});
