/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function(){
 $(function(){
 
  $('#txt_color').ColorPicker({
	onSubmit: function(hsb, hex, rgb, el) {
		$(el).val(hex);
		$(el).ColorPickerHide();
	},
	onBeforeShow: function () {
		$(this).ColorPickerSetColor(this.value);
	}
})
.bind('keyup', function(){
	$(this).ColorPickerSetColor(this.value);
});
  $(".oculto").hide();        
 });
    $("#agregar").click(function(){
        $( "#frm_agregar" ).dialog({
            height: 'auto',
            title:'Agregar Producto',
            width: 600,
            modal: true
        });
    });

  
  
  
  
  $('#slt_categoria').change(function(){
     var cat = $(this).val();
     $("#hdd_categoria").val(cat);
     $("#hdd_categorias").val(cat);
     productos(cat,'#slt_producto');  
  });
  
  $('#slt_producto').change(function(){
     var pro = $(this).val();
     $("#hdd_producto").val(pro);
  });
  //AGREGANDO UN NUEVO ITEM
  $('#btn_item').click(function(){
     if($('#slt_categoria').val()== '' || $('#slt_producto').val()== '') {
         alert("Debes seleccionar un categoria y un producto");
     }else{ 
      var nodo = $('.mo'); 
          if ($(nodo).is(":visible")){
               //$(nodo).hide();
               //$('.oculto').show();
               $(nodo).fadeToggle( "slow" );
               $('#agregar_producto').fadeToggle( "slow" );
               return false;
          }
     }
  });
  
  //AGREGANDO NUEVO ITEMS
  $('btn_agregar').click(function(){
  if($('#'+$(this).parents("form").attr("id")).validarForm()){
  $('#'+$(this).parents("form").attr("id")).submit();
  }
  });
 
})
