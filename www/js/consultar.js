(function (global) {
    var consultasViewModel,
        app = global.app = global.app || {};

    consultasViewModel = kendo.data.ObservableObject.extend({
		mostrar:function(){  
            $('#contenedorConsulta').html('');
            if(!window.localStorage.getItem('usernameUsuario')){
                $('#contenedorConsulta').show(); 
                $('#contenedorConsultaLogin').hide();                
                $('#contenedorConsulta').append('<p>A través de esta herramienta virtual podrá hacer cualquier pregunta en salud, y recibirá respuesta con la mejor evidencia clínica disponible en un lenguaje sencillo y claro.<br><br> Solo deberá <a href="#view-no-login">registrarse</a> o <a href="#view-no-login">iniciar sesión</a> para poder hacer uso del servicio. </p>');  
            } else {
                $('#contenedorConsulta').hide(); 
                $('#contenedorConsultaLogin').show();            
                $('#historicoReducido').html('');
                $.ajax( {
    				type: "POST",
    				url: app.servidor+'preguntas_usuario_home_app',         
    				dataType: "json",
    				data: {
    					usuario: window.localStorage.getItem("idUsuario")
    				},
    				success: function(resultado) {
                        console.log(resultado);
                        $.each(resultado, function(index,value){
                            $('#historicoReducido').append('<p class="fecha">'+value.fecha+'</p>');
                            $('#historicoReducido').append('<p class="pregunta_u">'+value.pregunta+' - <span><a href="#view-preguntas-detalle?id='+value.id+'">Ver</a></span></p>');
                            if(value.respuesta){
                                $('#historicoReducido').append('<div class="respuesta_u_on">'+value.respuesta.substring(0,40)+'...</div>');
                            } else {
                                $('#historicoReducido').append('<div class="respuesta_u_off"><p>En espera de respuesta</p></div>');
                            }
                        });
    				}
    			}); 
             }
        },
        cuenta: function() {
			var l = $('#pregunta').val();
			if(l.length >= 0){
				$('#caracteres').text((199-l.length));
			} 
		},
        cuentaD: function() {
			var l = $('#preguntad').val();
			if(l.length >= 0){
				$('#caracteresd').text((199-l.length));
			} 
		},
        enviarPregunta: function(){        
			var pregunta = $('#pregunta').val();
			swal({
			  title: 'Paracelsos',
			  text: "¿Desea enviar esta consulta?",
			  type: 'warning',
			  showCancelButton: true,
			  confirmButtonColor: '#1f3664',
			  confirmButtonText: 'Enviar',
			  cancelButtonText: 'Cancelar'
			}).then(function () {				
				if(pregunta.length > 10 && pregunta.length <= 200){
					$.ajax( {
						type: "POST",
						url: app.servidor+'enviar_pregunta',         
						dataType: "json",
						data: {
							pregunta: pregunta,
							usuario: window.localStorage.getItem("idUsuario"),
							nombre: window.localStorage.getItem("nombreUsuario"),
							correo: window.localStorage.getItem("usernameUsuario")
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
				} else {	
				    app.mostrarMensaje('Escriba su pregunta de máximo 200 caracteres', 'error');	
				}
			})
        },
		mostrarPreguntas:function(){  
            $('#historico').html('');
            $('#historico').html('<ul id="lista_preg_conocimiento"></ul>');
            $.ajax( {
				type: "POST",
				url: app.servidor+'preguntas_usuario_app',         
				dataType: "json",
				data: {
					usuario: window.localStorage.getItem("idUsuario")
				},
				success: function(resultado) {
                    console.log(resultado);
                    $.each(resultado, function(index,value){
                        $('#historico').append('<p class="fecha">'+value.fecha+'</p>');
                        $('#historico').append('<p class="pregunta_u">'+value.pregunta+' - <span><a href="#view-preguntas-detalle?id='+value.id+'">Ver</a></span></p>');
                        if(value.respuesta){
                            $('#historico').append('<div class="respuesta_u_on">'+value.respuesta.substring(0,40)+'...</div>');
                        } else {
                            $('#historico').append('<div class="respuesta_u_off"><p>En espera de respuesta</p></div>');
                        }
                    });
                    
                             
				}
			}); 
    	},
        idActual: 0,
		mostrarDetalle:function(e){  
            e.view.scroller.scrollTo(0, 0);
            $('#navigation-container .km-button').removeClass('km-state-active');
            
            var id = e.view.params.id;
            app.consultasService.viewModel.idActual = id;
            $('.preguntad').html('');
            $('.respuestasd').html('');
            $('#pregunta_adicional').hide();
            $('.preguntad').val('');
            $.ajax( {
				type: "POST",
				url: app.servidor+'pregunta_detalle_app',         
				dataType: "json",
				data: {
					id: id
				},
				success: function(pregunta) {
                    console.log(pregunta);
                    $('.preguntad').append('<p class="fecha">'+pregunta.fecha+'</p>');
                    $('.preguntad').append('<p class="pregunta_u">'+pregunta.pregunta+'</p>');  
                    if(pregunta.habilitar){
                        $('#pregunta_adicional').show();
                    } else {
                        $('#pregunta_adicional').hide();
                    }                  
				}
			}); 
            $.ajax( {
				type: "POST",
				url: app.servidor+'respuestas_completas_app',         
				dataType: "json",
				data: {
					id: id
				},
				success: function(respuestas) {
                    console.log(respuestas);
                    if(respuestas.length > 0){
                        $.each(respuestas, function(index,vl){
                            if(vl.administrador === '0'){
                                var administrador = window.localStorage.getItem("nombreUsuario");
                            } else {
                                var administrador = 'Paracelsos';
                            }
                            $('.respuestasd').append('<div class="fecha_u">'+vl.fecha+' - '+administrador+'</div>');                            
                            $('.respuestasd').append('<div class="respuesta_u_on">'+vl.respuesta+'</div>');   
                        })                        
                    } else {
                        $('.respuestasd').append('<div class="respuesta_u_off"><p>En espera de respuesta</p></div>');      
                    }
				}
			}); 
    	},
        enviarPreguntaD: function(){        
			var pregunta = $('#preguntad').val();
			swal({
			  title: 'Paracelsos',
			  text: "¿Desea enviar esta consulta?",
			  type: 'warning',
			  showCancelButton: true,
			  confirmButtonColor: '#1f3664',
			  confirmButtonText: 'Enviar',
			  cancelButtonText: 'Cancelar'
			}).then(function () {				
				if(pregunta.length > 10 && pregunta.length <= 200){
					$.ajax( {
						type: "POST",
						url: app.servidor+'enviar_pregunta_adicional',         
						dataType: "json",
						data: {
							pregunta: pregunta,
							id: app.consultasService.viewModel.idActual,
							nombre: window.localStorage.getItem("nombreUsuario"),
							correo: window.localStorage.getItem("usernameUsuario")
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
									$('#preguntad').val('');
                                    app.application.navigate('#view-preguntas');
								})
							} else {
				                app.mostrarMensaje(resultado.message, 'error');
							}
						}
					}); 
				} else {	
				    app.mostrarMensaje('Escriba su pregunta de máximo 200 caracteres', 'error');	
				}
			})
        },
    });

    app.consultasService = {
        viewModel: new consultasViewModel()
    };
})(window);