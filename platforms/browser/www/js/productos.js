(function (global) {
    var productosViewModel,
        app = global.app = global.app || {};

    productosViewModel = kendo.data.ObservableObject.extend({
        galleryTop: null,
        galleryThumbs: null,
        idProducto: 0,
        moneda:null,
        cambio:0,
		mostrar:function(e){
            // cargar vista desde el top
            e.view.scroller.scrollTo(0, 0);
            $('#categoriaPorductos').html('');
            $('#contenidoSlider').html('');
            $('.plusProduct').html('');
            $('#cantidad').val(0);
            console.log('<!-- View Productos -->');
            Pace.track(function(){
                $.ajax({
                    method: 'GET',
                    url: app.servidor+'obtener_categorias',
                    dataType: 'json',
                    data: {
                    }
                }).done(function(result) {
                    console.log(result);
                    $('#categoriaPorductos').append('<div class="swiper-wrapper" id="categorias"></div>')
                    $('#contenidoSlider').append('<div class="swiper-wrapper" id="productosCate"></div>')
                    $.each(result,function(index,valor){
                        $('#categorias').append('<div class="swiper-slide" id="prductoCat-'+valor.id+'">'+valor.categoria+'</div>');
                        $('#productosCate').append('<div class="swiper-slide" id="cart-'+valor.id+'"></div>')
                        Pace.track(function(){
                            $.ajax({
                                method: 'POST',
                                url: app.servidor+'obtener_productos_categoria',
                                dataType: 'json',
                                data: {
                                    id:valor.id,
                                }
                            }).done(function(respuesta) {
                                console.log(respuesta);
                                $('#cart-'+valor.id).html();
                                $.each(respuesta,function(idx,val){
                                    $('#cart-'+valor.id).append(''+
                                        '<a href="#view-detalle-producto?id='+val.id+'">'+
                                            '<div style="background-image:url('+val.imagen+')" class="productos">'+
                                                '<div class="contTextProducto">'+
                                                    '<p class="titleProducto">'+val.producto+'</p>'+
                                                    '<p class="textoProducto">'+val.referencia+'</p>'+
                                                '</div>'+
                                            '</div>'+
                                        '</a>'                                        
                                    );	                                  
                               });
                               
                            })
                        });
                   });
                    app.productosService.viewModel.galleryTop = new Swiper('.gallery-topP', {
                        spaceBetween: 10,
                        initialSlide: 0,
                        scrollbarHide: false,
                        autoHeight: true,
                    });
                    app.productosService.viewModel.galleryThumbs = new Swiper('.gallery-thumbsP', {
                        initialSlide: 0,
                        spaceBetween: 10,
                        centeredSlides: true,
                        slidesPerView: 'auto',
                        touchRatio: 0.2,
                        slideToClickedSlide: true,
                        setWrapperSize: true
                    });
                    app.productosService.viewModel.galleryThumbs.params.control = app.productosService.viewModel.galleryTop;
                    app.productosService.viewModel.galleryTop.params.control = app.productosService.viewModel.galleryThumbs;
                })
            });            
        },
        ocultar:function(){
            app.productosService.viewModel.galleryTop.destroy(true, false);
            app.productosService.viewModel.galleryThumbs.destroy(true,false);
        },        
        mostrarDetalle:function(e){
            e.view.scroller.scrollTo(0, 0);
            var id = e.view.params.id;
            app.productosService.viewModel.idProducto = id;
            $('#cantidad').val(1);
            $('#navigation-container .km-button').removeClass('km-state-active');
            $('#navigation-container #Productos').addClass('km-state-active');
            
            $('.upps').html('');
            $('.titlePortada').html('');
            $('.textPortada').html('');
            $('#accionesDetalle').html('');
            $('.portadaProducto').attr('style','');
            if (window.localStorage.getItem('idUsuario')) {
                if(window.localStorage.getItem('nombreUsuario')){
                    var nombreUsuario = window.localStorage.getItem('nombreUsuario');
                    var correoUsuario = window.localStorage.getItem('usernameUsuario');
                    console.log('vista detalle pro nom usu: '+nombreUsuario+' '+correoUsuario);
                } else {                
                    var nombreUsuario = '';
                    var correoUsuario = '';
                }                
                Pace.track(function(){

                    $.ajax({
                        method: 'POST',
                        url: app.servidor+'obtener_info_detalle_cantidad_app',
                        dataType: 'json',
                        data: {
                            id:id,
                        }
                    }).done(function(detalle) {
                        $.ajax({
                            url: app.servidor+'cambio_moneda_app'
                        })
                        .done(function(moneda) {
                            console.log('ajax moneda');
                            console.log(moneda);
                            $.ajax({
                                url: app.servidor+'select_moneda_usu_app',
                                method: 'POST',
                                dataType: 'json',
                                data: {usuario: window.localStorage.getItem('idUsuario')},
                            })
                            .done(function(monedaUsu) {
                                console.log("success monedausu");
                                console.log('moneda usuario: '+monedaUsu);
                            
                                if (monedaUsu == 'usd') {
                                    app.productosService.viewModel.cambio = parseFloat(moneda.tasa);
                                    app.productosService.viewModel.moneda = 'USD';
                                    console.log('cambio: '+app.productosService.viewModel.cambio);
                                    console.log('moneda: '+app.productosService.viewModel.moneda);
                                }else{
                                    app.productosService.viewModel.cambio = 1;
                                    app.productosService.viewModel.moneda = 'COP';
                                }
                                $.ajax({
                                    method: 'POST',
                                    url: app.servidor+'productos_detalle',
                                    dataType: 'json',
                                    data: {
                                        id:id,
                                    }
                                })
                                .done(function(respuesta) {
                                    console.log('producto detalle: '+respuesta.categoria);
                                    $('.portadaProducto').attr('style','background-image:url('+respuesta.imagen+');');
                                    $('.titlePortada').append(respuesta.producto);
                                    $('.textPortada').append(respuesta.descripcion);
                                    if(respuesta.video){
                                        //$('.video').append('<video width="320" height="240"><source src="'+app.server+'images/videos/'+respuesta.video+'"></video>');
                                    } 
                                    // $('#accionesDetalle').append('<div class="leerMas"><p class="masStyle">Solicita más información</p><input placeholder="Nombre" id="inputNombreSolicitud" value="'+nombreUsuario+'"><input placeholder="Correo electrónico" id="inputCorreoSolicitud" value="'+correoUsuario+'"><input placeholder="Teléfono" id="inputTelefonoSolicitud"><textarea placeholder="Mensaje" id="inputMensajeSolicitud"></textarea><a onclick="app.productosService.viewModel.solicitud()" data-role="button"><div class="botonMas">Solicitar</div></a></div>');
                                    // console.log('detalle: '+detalle[2].categoria);
                                    console.log(JSON.stringify(detalle));
                                    if (respuesta.categoria == 4) {
                                        $('.cleanButton').css('display', 'none');                                
                                        $('.conferenceB').css('display', 'block');                                
                                    }else{
                                        $('.cleanButton').css('display', 'block');
                                        $('.conferenceB').css('display', 'none');
                                        $('#cantidadP').val(0);
                                        $('#precio').val(0);
                                        $('#peso').val(0);
                                        $.each(detalle,function(idx,val){
                                            $('.plusProduct').append(''+'<div class="row-fluid">'+
                                                    '<div class="span6">'+
                                                        '<div class="b_cantidad">'+
                                                            '<p>Frasco por: <span><button id="cant'+idx+'" class="btn-cant">'+detalle[idx].cantidad+'</button></span></p>'+                                                
                                                        '</div>'+
                                                    '</div>'+
                                                    '<div class="span6">'+
                                                        '<div class="i_cantidad">'+
                                                            '<p><input id="valor'+idx+'" class="cValor" value="'+detalle[idx].precio * app.productosService.viewModel.cambio+'" type="text" readonly></p>'+                                                
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>'+
                                            '');
                                            if(respuesta.categoria == 2){
                                                $('.b_cantidad').hide();
                                                $('.i_cantidad').css('float','left');
                                                $('#cantidadP').val(detalle[idx].cantidad);
                                                $('#precio').val(detalle[idx].precio);
                                                $('#peso').val(detalle[idx].peso);
                                            }
                                            $('#cant'+idx+'').click(function(){
                                                $('.btn-cant').removeClass('activeB');
                                                $(this).addClass('activeB');

                                                $('#cantidadP').val(detalle[idx].cantidad);
                                                $('#precio').val(detalle[idx].precio);
                                                $('#peso').val(detalle[idx].peso);

                                            });
                                            var cleave = new Cleave('#valor'+idx+'', {
                                                prefix: app.productosService.viewModel.moneda+' $',
                                                numeral: true,
                                                numeralThousandsGroupStyle: 'thousand',
                                                rawValueTrimPrefix: true
                                            });
                                        });

                                    }
                                        
                                })  
                            })                       
                        })                                               
                    })
                });
            }else{

                $('.cleanButton').hide('');
                $('.conferenceB').hide(); 
                $('.portadaProducto').hide(); 
                $('.titlePortada').hide(); 

                $('.upps').append(''+
                    '<div align="center" class="span12">'+
                        '<img style="margin-top: 2em;" src="images/upps.png" alt="" />'+
                        '<h3 style="margin-top: 1em;">Debes registrarte o iniciar sesión para realizar compras</h3>'+
                    '</div> '+                              
                '');

            }
        },       
        aumentar: function(){
            cant_producto = $('#cantidadP').val();
            console.log('cantidad: '+cant_producto);
            if (cant_producto != 0) {
                var currentVal = parseInt($('#cantidad').val());
                $('#cantidad').val(currentVal + 1);

            }else{
                app.mostrarMensaje(
                  'Debes seleccionar una unidad',
                  'error'
                ); 
            }
        },
        disminuir: function(){
            var currentVal = parseInt($('#cantidad').val());
            if (currentVal == 1) {
                $('#cantidad').val(1);
            }else{
                $('#cantidad').val(currentVal - 1);
            }
        },
        agregarCarrito: function (){
            cantidad = $('#cantidad').val();
            id_producto = app.productosService.viewModel.idProducto;
            cant_producto = $('#cantidadP').val();
            precio = $('#precio').val();
            peso = $('#peso').val();

            if (window.localStorage.getItem('llave_payu')) {
                var llave_payu = window.localStorage.getItem('llave_payu');
                console.log('exite llave local: '+llave_payu);
            }else{
                $.ajax({
                    type: "GET",
                    url: app.servidor+'generar_llave_app',
                    data:{
                        cantidad:cantidad
                    }
                }).done(function(rest){
                    console.log(rest);
                    window.localStorage.setItem('llave_payu',rest);
                    var llave_payu = window.localStorage.getItem('llave_payu');
                    console.log('creo llave local: '+llave_payu);
                });
            }

            if(cant_producto == 0){
                app.mostrarMensaje(
                  'Debes seleccionar un frasco',
                  'error'
                );
            } else if (cantidad == 0){  
                app.mostrarMensaje(
                  'Debes seleccionar una cantidad',
                  'error'
                );           
            } else{
                console.log('entro agregar_producto_app: '+llave_payu);
                // mostrarMensaje('Completo','success');
                $.ajax( {
                    type: "GET",
                    url: app.servidor+'agregar_producto_app',         
                    dataType: "json",
                    data: {
                        cantidad: cantidad,
                        producto: id_producto,
                        cant_producto: cant_producto,
                        llave: llave_payu,
                        precio: precio,
                        peso: peso
                    }
                }) 
                .done(function( resultado ) {
                    console.log(resultado);
                    if (resultado.status == 'no_stock') {
                        app.mostrarMensaje(
                          resultado.result,
                          'error'
                        );                  
                    }else{
                        if(resultado.status == 'added'){
                            app.mostrarMensaje(
                               'Ha sido agregado de forma exitosa un producto ',
                              'success'
                            );
                            // setTimeout(function(){ location.assign('<?= JURI::base() ?>carrito'); }, 1000);
                        }else if( resultado.status == 'error'){
                            app.mostrarMensaje(
                              'Ya habías seleccionado este producto, se encuentra en el carrito',
                              'error'
                            );
                        }else{
                            app.mostrarMensaje(
                              'Debes seleccionar una cantidad',
                              'error'
                            );                  
                        }

                    }
                });
                $.ajax({
                    url: app.servidor+'obtener_cantidad_productos_app',
                    dataType: 'json',
                    data:{llave:window.localStorage.getItem('llave_payu')}
                }).
                done(function(badage){
                    console.log('badage; '+badage)
                    if (badage > 0) {
                        $('#carrito').addClass('badge_twitter');                    
                        $('#carrito').text(badage);                    
                    }else{
                        console.log('no hay productos en carrito')
                    }
                })

            }
        }, 
        viewRegistro: function(){
            app.application.navigate('#view-no-login');
            var pane = $("#perfil-pane").data("kendoMobilePane");
            pane.navigate("#view-registro");
        },
        solicitud:function(){
            
			var nombres = $('#inputNombreSolicitud').val();
			var correo = $('#inputCorreoSolicitud').val();
			var telefono = $('#inputTelefonoSolicitud').val();
			var mensaje = $('#inputMensajeSolicitud').val();
			var expr = /^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/;

			if(!nombres){
				app.mostrarMensaje('Escriba su nombre', 'error');
			} else if(!telefono){
				app.mostrarMensaje('Escriba su teléfono', 'error');
			} else if(correo.length <= 0 || !expr.test(correo)){
				app.mostrarMensaje('Escriba su correo válido', 'error');
			} else if(!mensaje){
				app.mostrarMensaje('Escriba su mensaje', 'error');
			} else {
				console.log('Formulario completado correctamente');                
                Pace.track(function(){
    				 $.ajax( {
    					type: "POST",
    					url: app.servidor+'guardar_solicitud_app',         
    					dataType: "json",
    					data: {
    						nombres: nombres,
    						telefono: telefono,
    						mensaje: mensaje,
    						correo: correo,
    					},
    					success: function(resultado) {
    						if(resultado.status === 1){
    							$('#inputNombreSolicitud').val('');
    							$('#inputCorreoSolicitud').val('');
    							$('#inputTelefonoSolicitud').val('');
    							$('#inputMensajeSolicitud').val('');
				                app.mostrarMensaje(resultado.message, 'success');
    						} else {
				                app.mostrarMensaje(resultado.message, 'error');
    						}
    					}
    				});                  
				}); 
    		}
        }

    });

    app.productosService = {
        viewModel: new productosViewModel()
    };
})(window);