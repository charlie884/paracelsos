(function (global) {
    var paracelsosViewModel,
        app = global.app = global.app || {};

    paracelsosViewModel = kendo.data.ObservableObject.extend({  
        //mostrar:function(){ 
            
        //    $('#textNosotros').html('');
        //     Pace.track(function(){
        //        $.ajax({
        //        method:'GET', 
        //        url: app.servidor+'obtener_nosotros',
        //        dataType: 'json'
        //        })
        //        .done(function( nosotros ) {
        //        	console.log(nosotros);
        //        	$('.textNosotros').html(nosotros);
        //        });
		//	});
            
        //    $('.contPatrocinadores').html('');
        //     Pace.track(function(){
        //        $.ajax({
        //        method:'GET', 
        //        url: app.servidor+'obtener_patrocinadores',
        //        dataType: 'json'
        //        })
        //        .done(function( patrocinadores ) {
        //        	console.log(patrocinadores);
        //            $('.contPatrocinadores').kendoMobileListView({
        //                dataSource: patrocinadores,
        //                template: $('#template-patrocinadores').html()
        //            }); 
        //        });
		//	});
            
        //    $('#textoTerminos').html('');
        //     Pace.track(function(){
        //        $.ajax({
        //        method:'GET', 
        //        url: app.servidor+'obtener_terminos',
        //        dataType: 'json'
        //        })
        //        .done(function( terms ) {
        //        	console.log(terms);
        //        	$('.textoTerminos').html(terms);
        //        });
		//	});
            
        //}, 
        //viewParacelsos: function(){
        //    console.log('Acerca de');    
        //    var pane = $("#paracelsos-pane").data("kendoMobilePane");
        //    pane.navigate('#view-acerca-paracelsos');            
        //},
        //viewPatrocinadores: function(){
        //    console.log('Patrocinadores');
        //    var pane = $("#paracelsos-pane").data("kendoMobilePane");
        //    pane.navigate('#view-patrocinadores'); 
        //},
        //viewTerminos: function(){
        //    console.log('Terminos');
        //    var pane = $("#paracelsos-pane").data("kendoMobilePane");
        //    pane.navigate('#view-terminos'); 
        //}
        mostrarAutoria: function(){      
            $('#navigation-container .km-button').removeClass('km-state-active');      
            $('#autoria').html('');
             Pace.track(function(){
                $.ajax({
                method:'POST', 
                url: app.servidor+'obtener_autoria_app',
                dataType: 'json'
                })
                .done(function( autoria ) {
                	console.log(autoria);
                	$('#autoria').html(autoria);
                });
			});
        },
        mostrarTerminos: function(){      
            $('#navigation-container .km-button').removeClass('km-state-active');      
            $('#terminos').html('');
             Pace.track(function(){
                $.ajax({
                method:'POST', 
                url: app.servidor+'obtener_terminos_app',
                dataType: 'json'
                })
                .done(function( terms ) {
                	console.log(terms);
                	$('#terminos').html(terms);
                });
			});
        },
        mostrarPoliticas: function(){      
            $('#navigation-container .km-button').removeClass('km-state-active');      
            $('#politicas').html('');
             Pace.track(function(){
                $.ajax({
                method:'POST', 
                url: app.servidor+'obtener_politicas_app',
                dataType: 'json'
                })
                .done(function( politicas ) {
                	console.log(politicas);
                	$('#politicas').html(politicas);
                });
			});
        },
        responderAdmin: function(){
            $('#responder_admin textarea').jqte(); 
        },
        enviarRespuesta: function(){  
			var respuesta = $(".jqte_editor").html();
			swal({
			  title: 'Paracelsos',
			  text: "¿Desea enviar esta respuesta?",
			  type: 'warning',
			  showCancelButton: true,
			  confirmButtonColor: '#1f3664',
			  confirmButtonText: 'Enviar',
			  cancelButtonText: 'Cancelar'
			}).then(function () {		
					$.ajax( {
						type: "POST",
						url: app.servidor+'enviar_pregunta',         
						dataType: "json",
						data: {
							respuesta: respuesta,
						},
						success: function(resultado) {
							if(resultado.status === 1){
								swal({
								  title: 'Pregunta recibida',
								  text: "Pronto será enviada la respuesta",
								  type: 'success',
								  showCancelButton: false,
								  confirmButtonColor: '#1f3664',
								  confirmButtonText: 'Aceptar'
								}).then(function () {
									$('#pregunta').val('');
								})
							} else {
				                app.mostrarMensaje(resultado.message, 'error');
							}
						}
					}); 
             })
        }
        
    });

    app.paracelsosService = {
        viewModel: new paracelsosViewModel()
    };
})(window);