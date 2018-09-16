(function (global) {
    var perfilViewModel,
        app = global.app = global.app || {};

    perfilViewModel = kendo.data.ObservableObject.extend({
		validar:function(){
            //window.localStorage.setItem('idUsuario','');
            if(window.localStorage.getItem('idUsuario')){
                console.log('perfil');
                var tabstrip = app.application.view().footer.find(".km-tabstrip").data("kendoMobileTabStrip");
               tabstrip.switchTo("#view-editar-perfil"); //activate "bar" tab
                app.application.navigate('#view-editar-perfil');
            } else {
                console.log('login'); 
                app.application.navigate('#view-no-login');
            }
         },        
        viewLogin: function(){
            console.log('Login');
            $('#inputUser').val('');
            $('#inputPass').val('');
            var pane = $("#perfil-pane").data("kendoMobilePane");
            pane.navigate('#view-login');            
        },
        viewRegistro: function(){
            console.log('Registro');
            $('#inputNombre').val('');
            $('#inputCorreo').val('');
            $('#inputCiudad').val('');
            $('#inputPais').val('');
            $('#inputProfesion').val('');
            $('#inputContrasena').val('');
            var pane = $("#perfil-pane").data("kendoMobilePane");
            pane.navigate('#view-registro'); 
        },
        validarRegistro: function(e){
            e.preventDefault();
            $('.inputRegistro').blur();
            console.log('registrar');
            var nombres = jQuery('#inputNombres').val();
			var apellidos = jQuery('#inputApellidos').val();
			var fecha = jQuery('#fechaNacimiento').val();
			var correo = jQuery('#inputCorreo').val();
			var ciudad = jQuery('#inputCiudad').val();
			var pais = jQuery('#inputPais').val();
			var profesion = jQuery('#inputProfesion').val();
			var contrasena = jQuery('#inputContrasena').val();
			var contrasena2 = jQuery('#inputConfirmar').val();
			var expr = /^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/;

			if(!nombres){
               app.mostrarMensaje('Escriba su nombre', 'error');
			} else if(!apellidos){
               app.mostrarMensaje('Escriba sus apellidos', 'error');
			} else if(!fecha){
               app.mostrarMensaje('Indique su fecha de nacimiento', 'error');
			} else if(correo.length <= 0 || !expr.test(correo)){
               app.mostrarMensaje('Escriba un correo válido', 'error');
			} else if(!ciudad){
               app.mostrarMensaje('Escriba su ciudad', 'error');
			} else if(!pais){
               app.mostrarMensaje('Escriba su país', 'error');
			} else if(!profesion){
               app.mostrarMensaje('Escriba su profesión', 'error');
			} else if(!contrasena){
               app.mostrarMensaje('Escriba su contraseña', 'error');
			} else if(!contrasena2 || (contrasena2 != contrasena)){
               app.mostrarMensaje('Las contraseñas no coinciden', 'error');
			} else {
				console.log('Formulario completado correctamente');
				 jQuery.ajax( {
					type: "POST",
					url: app.servidor+'registrar_usuario_app',         
					dataType: "json",
					data: {
						nombres: nombres,
						apellidos: apellidos,
						fecha: fecha,
						correo: correo,
						ciudad: ciudad,
						pais: pais,
						profesion: profesion,
						contrasena: contrasena
					},
					success: function(resultado) {
						if(resultado.status === 1){
							swal({
							  title: '¡Bienvenido!',
							  text: "Su información ha sido recibida exitosamente y podrá hacer uso del servicio de educación en salud a partir de ahora",
							  type: 'success',
							  showCancelButton: false,
							  confirmButtonColor: '#1f3664',
							  confirmButtonText: 'Empezar'
							}).then(function () {
                                jQuery('#inputNombres').val('');
                    			jQuery('#inputApellidos').val('');
                    			jQuery('#fechaNacimiento').val('');
                    			jQuery('#inputCorreo').val('');
                    			jQuery('#inputCiudad').val('');
                    			jQuery('#inputPais').val('');
                    			jQuery('#inputProfesion').val('');
                    			jQuery('#inputContrasena').val('');
                    			jQuery('#inputConfirmar').val('');
                                app.perfilService.viewModel.iniciarSesion(correo,contrasena);
							})
						} else {
                           app.mostrarMensaje(resultado, 'error');
						}
					}
				}); 
			}
        },
        validarLogin: function(e){
            console.log('login');
            e.preventDefault();
            $('.inputLogin').blur();
            var usuario = $('#inputUser').val();
            var password = $('#inputPass').val();
            if(usuario.length < 5 || password.length <= 0){                
                // Campos incorrectos
                app.mostrarMensaje('Completa el formulario correctamente','error');
            } else {
                app.perfilService.viewModel.iniciarSesion(usuario,password);
            }
        },
        iniciarSesion: function(usuario,password){
            Pace.track(function(){
                $.ajax({
                   method:'POST',
                   url: app.servidor+'iniciar_sesion_app',
                   dataType: 'json',
                   data: {
                       username: usuario,
                       password: password
                   }
                }).
                done(function(respuesta){
                    console.log(JSON.stringify(respuesta));
                    if(respuesta.status === 1){
                        $('.mlogin').show();
                        if(respuesta.group[7]){
                            $('.madmin').show();
                        } else {
                            $('.madmin').hide();                            
                        }
                        window.localStorage.setItem('idUsuario',respuesta.id);
                        window.localStorage.setItem('nombreUsuario',respuesta.name);
                        window.localStorage.setItem('usernameUsuario',respuesta.username);
                        window.localStorage.setItem('passwordUsuario',password);
                        app.mostrarMensaje('Bienvenido(a) '+respuesta.name,'success');    
                        Pace.track(function(){
                            $.ajax({
                                method:'GET',
                                url: app.servidor+'obtener_foto_usuario', 
                                dataType: 'json', 
                                data:{
                                    id:respuesta.id,
                                }
                            }).
                            done(function(info){
                                console.log(info);
                                window.localStorage.setItem('fotoUsuario',info.foto);
                                if(window.localStorage.getItem('fotoUsuario') != app.server) {
                                    $('.datosFoto').attr(
                                        'src',window.localStorage.getItem('fotoUsuario')
                                    );
                                } else {
                                    $('.datosFoto').attr(
                                        'src','images/icon_no.png'
                                    );
                                }
                            })
                        });                     
                        $('.nombrePerfil').text(window.localStorage.getItem('nombreUsuario'));
                        app.application.navigate('#view-bienvenida');
                    } else {                        
                        app.mostrarMensaje(respuesta.message,'error'); 
                    }
                })
            });
        },
        iniciarSesionNoAPP: function(usuario,password){
            Pace.track(function(){
                $.ajax({
                   method:'POST',
                   url: app.servidor+'iniciar_sesion_app',
                   dataType: 'json',
                   data: {
                       username: usuario,
                       password: password
                   }
                }).
                done(function(respuesta){
                    console.log(JSON.stringify(respuesta));
                    if(respuesta.status === 1){
                        $('.mlogin').show();
                        if(respuesta.group[7]){
                            $('.madmin').show();
                        } else {
                            $('.madmin').hide();                            
                        }
                        window.localStorage.setItem('idUsuario',respuesta.id);
                        window.localStorage.setItem('nombreUsuario',respuesta.name);
                        window.localStorage.setItem('usernameUsuario',respuesta.username);
                        window.localStorage.setItem('passwordUsuario',password);
                        app.mostrarMensaje('Bienvenido(a) '+respuesta.name,'success');     
                        Pace.track(function(){
                            $.ajax({
                                method:'GET',
                                url: app.servidor+'obtener_foto_usuario', 
                                dataType: 'json', 
                                data:{
                                    id:respuesta.id,
                                }
                            }).
                            done(function(info){
                                console.log(info);
                                window.localStorage.setItem('fotoUsuario',info.foto);
                                if(window.localStorage.getItem('fotoUsuario') != app.server) {
                                    $('.datosFoto').attr(
                                        'src',window.localStorage.getItem('fotoUsuario')
                                    );
                                } else {
                                    $('.datosFoto').attr(
                                        'src','images/icon_no.png'
                                    );
                                }
                            })
                        });
                        $('.nombrePerfil').text(window.localStorage.getItem('nombreUsuario'));
                        app.application = new kendo.mobile.Application(document.body, { skin: "flat", initial:'view-bienvenida'});
                    } else {
                        app.mostrarMensaje(respuesta.message,'error');                       
                    }
                })
            });
        },
        cerrarSesion:function(){            
            var n = noty({
                text        : '¿Cerrar sesión?',
                type        : 'confirm',
                dismissQueue: true,
                timeout     : 2000, 
                layout      : 'bottomCenter',
                theme       : 'someOtherTheme',
                maxVisible  : 10,
                buttons: [
        		{addClass: 'btn btn-primary', text: 'Salir', onClick: function($noty) {
        				// this = button element
        				// $noty = $noty element

        				$noty.close();
        				//noty({text: 'You clicked "Ok" button', type: 'success'});
                        Pace.track(function(){
                            $.ajax({
                                method:'GET',
                                url: app.servidor+'cerrar_sesion',
                                dataType: 'json',
                                data:{
                                    userId:window.localStorage.getItem('idUsuario')
                                }
                            })
                            .done(function( respuesta ) {
                                console.log(respuesta);
                                if(respuesta){
                                    $('.mlogin').hide();
                                    $('.madmin').hide();
                                    window.localStorage.clear();
                                    window.localStorage.setItem('fotoUsuario','images/icon_no.jpg');
                                    app.favoritos = [];
                                    window.localStorage.setItem('favoritos',app.favoritos); 
                                    window.localStorage.setItem('llave_payu') = ''; 
                                    $('.datosFoto').attr(
                                        'src','images/icon_no.jpg'
                                    );
                                    app.application.navigate('#view-bienvenida');
                                }
                            });
                        });
                	}
        		},
        		{addClass: 'btn btn-danger', text: 'Cancelar', onClick: function($noty) {
        				$noty.close();
        				//noty({text: 'You clicked "Cancel" button', type: 'error'});
        			}
        		}
        	]
            });
          
        
        },
        remember: function(){
            
            var email = $('#emailRemember').val();
            if(email){
                Pace.track(function(){
                    $.ajax({
                        method:'GET',
                        url: app.servidor+'recuperar_password_usuario',
                        dataType: 'json',
                        data:{
                            email:email
                        }
                    })
                    .done(function( respuesta ) {
                        console.log(respuesta);
                        if(respuesta.error === false){
                            if(respuesta.envioMail === true){
                                app.mostrarMensaje('Hemos enviado un código de verificación a su correo electrónico','success');
                                app.application.navigate('#view-reset','fade');
                            }else{
                                app.mostrarMensaje('Ocurrió un error en el proceso de envío de correo electrónico','error');
                            }
                        }else{
                            app.mostrarMensaje(respuesta.message,'error');
                        }
                        
                    });
                });
             } else {
                app.mostrarMensaje('Debe escribir su correo electrónico','error');
             }
        },   
        restablish:function(){
            var code = $('#codeReset').val();
            var password = $('#newPassword').val();
            var password2 = $('#newPassword2').val();
            console.log('C: '+code+' - P: '+password+' - P2: '+password2);
            if(code !== '' && password !== '' && password2 !== ''){
                if(code.length === 4){
                    if(password === password2){
                        var datos = {};
                        datos.token = code;
                        datos.password = password;
                        Pace.track(function(){
                            $.ajax({
                                method:'GET',
                                url: app.servidor+'verificar_token',
                                dataType: 'json',
                                data:datos
                            })
                            .done(function( respuesta ) {
                                console.log(respuesta);
                                if(respuesta.error === false){
                                    app.mostrarMensaje('Su contraseña se ha restablecido correctamente','success');
                                    app.application.navigate('#view-no-login');
                                }else{
                                    app.mostrarMensaje('Ha ocurrido un problema reestableciendo su contraseña','error');
                                }
                            });
                        });
                    }else{
                        app.mostrarMensaje('Su contraseña no coincide','error');
                    }
                }else{
                    app.mostrarMensaje('El código debe ser de 4 digitos','error');
                }
                
            }else{
                app.mostrarMensaje('Debe completar todos los campos','error');
            }
        },
        mostrarInfoPrincipal: function(){
             Pace.track(function(){
                $.ajax({
                    method:'GET',
                    url: app.servidor+'obtener_informacion_perfil', 
                    dataType: 'json', 
                    data:{
                        id:window.localStorage.getItem('idUsuario')
                    }
                }).
                done(function(info){
                    console.log(info);                    
                    //Datos
                    $('#inputNombreEditar').val(window.localStorage.getItem('nombreUsuario'));
                    $('#inputCorreoEditar').val(window.localStorage.getItem('usernameUsuario'));
                    $('#inputCiudadEditar').val(info.ciudad);
                    $('#inputPaisEditar').val(info.pais);
                    $('#inputProfesionEditar').val(info.profesion);
                    window.localStorage.setItem('fotoUsuario',info.foto);
                    if(window.localStorage.getItem('fotoUsuario') != app.server) {
                        $('.datosFoto').attr(
                            'src',window.localStorage.getItem('fotoUsuario')
                        );
                    } else {
                        $('.datosFoto').attr(
                            'src','images/icon_no.png'
                        );
                    }
                })
            });
            
            $('#editarFoto').click(function(){
                navigator.notification.confirm(
                    'Selecciona una opción', // message
                     function(boton){
                         if(boton === 1){
                             navigator.camera.getPicture(onSuccess, onFail, { 
                                quality: 70,
                                destinationType: Camera.DestinationType.DATA_URL,
                                allowEdit : true,
                                targetWidth: 800,
                  			  targetHeight: 800
                            });

                            function onSuccess(imageData) {
                                //alert('Cambiando');
                                //var image = document.getElementById(id);
                                var nuevoSrc = "data:image/jpeg;base64," + imageData;
                                //image.src = nuevoSrc;
                                $('.datosFoto').attr(
                                    'src',nuevoSrc
                                );
                                
                                    
                                // Modificar Foto
                                Pace.track(function(){
                        			$.ajax({
                        				url: app.servidor+'guardar_foto',
                        				type: 'POST',
                        				dataType: 'json',
                                        data: {
                                            foto:nuevoSrc,
                                            id:window.localStorage.getItem('idUsuario')
                                        }
                        			})
                        			.done(function(success) {  
                                       window.localStorage.setItem('fotoUsuario',nuevoSrc); 
                                        app.mostrarMensaje('Su foto de perfil ha sido moficada','success');
                        			})                          
                	        	});
                            } 

                            function onFail(message) { 
                                //navigator.notification.alert(message, function(){}, "Colombian Coffee Hub", "Ok");
                            }
                         }else if(boton === 2) {
                                navigator.camera.getPicture(listoFoto, onFail, { 
                                    quality: 70,
                                    destinationType: Camera.DestinationType.DATA_URL,
                                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                                    allowEdit : true,
                                    targetWidth: 800,
                      			  targetHeight: 800
                                });
                                
                                function listoFoto(imageData) {
                                    //alert('Cambiando');
                                    //var image = document.getElementById(id);
                                    var nuevoSrc = "data:image/jpeg;base64," + imageData;
                                    //image.src = nuevoSrc;
                                    $('.datosFoto').attr(
                                        'src',nuevoSrc
                                    );
                                    
                                    // Modificar Foto
                                    Pace.track(function(){
                            			$.ajax({
                            				url: app.servidor+'guardar_foto',
                            				type: 'POST',
                            				dataType: 'json',
                                            data: {
                                                foto:nuevoSrc,
                                                id:window.localStorage.getItem('idUsuario')
                                            }
                            			})
                            			.done(function(success) {  
                                           window.localStorage.setItem('fotoUsuario',nuevoSrc); 
                                           app.mostrarMensaje('Su foto de perfil ha sido moficada','success');
                            			})                          
                    	        	});
                                    
                                }

                                function onFail(message) {
                                    //navigator.notification.alert(message, function(){}, "Colombian Coffee Hub", "Ok");
                                }
                         }else if(boton === 3) {
                                return;
                         }
                         
                     },            // callback to invoke with index of button pressed
                    'Imagen de perfil',           // title
                    ['Tomar foto','Elegir', 'Cancelar']         // buttonLabels
                );
            });
        },
        guardarPerfil:function(){    
            var nombre = $('#inputNombreEditar').val();
            var ciudad = $('#inputCiudadEditar').val();
            var pais = $('#inputPaisEditar').val();
            var profesion = $('#inputProfesionEditar').val();
             
            if(nombre.length < 5 || ciudad.length < 2 || pais.length < 2 || profesion.length < 5){
                // Campos incorrectos
                app.mostrarMensaje('Complete el formulario correctamente','error');
            } else {           
              // Modificar Datos Principales
                Pace.track(function(){
        			$.ajax({
        				url: app.servidor+'guardar_datos_usuario',
        				type: 'POST',
        				dataType: 'json',
                        data: {
                            nombre:nombre,
                            id:window.localStorage.getItem('idUsuario')
                        }
        			})
        			.done(function(success) {  
                       window.localStorage.setItem('nombreUsuario',nombre); 
                       $('.nombrePerfil').text(window.localStorage.getItem('nombreUsuario'));                            
                       //console.log(nombre);
        			})                          
        		});
                
                // Modificar Datos Personales
                Pace.track(function(){
        			$.ajax({
        				url: app.servidor+'guardar_datos_personales',
        				type: 'POST',
        				dataType: 'json',
                        data: {
                            profesion:profesion,
                            pais:pais,
                            ciudad:ciudad,
                            id:window.localStorage.getItem('idUsuario')
                        }
        			})
        			.done(function(success) {  
                        if(success){                    
                            app.mostrarMensaje('Sus datos han sido almacenados correctamente','success');                          
                        } else {
                            app.mostrarMensaje('Hubo un error con su solicitud, verifique su internet e intente nuevamente','error');                                    
                        }
        			})                          
        		});         
            }
        },
        validarFavoritos:function(){
            if (app.favoritos.length == 0) {
                swal("", "No ha agregado articulos a sus favoritos", "error");
            }else{
                app.application.navigate('#view-favoritos');
            }
            console.log(app.favoritos);
        },
        validarFavoritosNoticias:function(){
            if (app.favoritas.length == 0) {
                swal("", "No ha agregado notícias a sus favoritos", "error");
            }else{
                app.application.navigate('#view-favoritos-noticias');
            }
            console.log(app.favoritas);
        }
        
    });

    app.perfilService = {
        viewModel: new perfilViewModel()
    };
})(window);