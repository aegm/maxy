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
        /*  var nodo = $('.mo'); 
          if ($(nodo).is(":visible")){
               //$(nodo).hide();
               //$('.oculto').show();
               $(nodo).fadeToggle( "slow" );
               $('.oculto').fadeToggle( "slow" );
               return false;
          }*/
        $( "#frm_agregar" ).dialog({
            height: 'auto',
            title:'Agregar Producto',
            width: 600,
            modal: true
        });
    });

  
  
  
  
  $('#slt_categoria').change(function(){
     productos($(this).val());  
  });
  
 
})
