(function (global) {
    var checkoutViewModel,
        app = global.app = global.app || {};

    checkoutViewModel = kendo.data.ObservableObject.extend({
        total_s:0,
        pesoTotal:0,
        costoEnvio:0,
        moneda:null,
        cambio:0,
        carrito:function(){
            $('#productos_b').html('');
            var llave = window.localStorage.getItem('llave_payu');   
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
                        method: 'GET',
                        url: app.servidor+'obtener_productos_carrito_app',
                        dataType: 'json',
                        data: {
                            llave:llave
                        }
                    })
                    .done(function(result) {
                        console.log(result);
                        if (result.length<1) {
                            console.log('no se han agregado productos al carrito')
                        }else{
                            app.carritoService.viewModel.total_s = 0;
                            app.carritoService.viewModel.pesoTotal = 0;
                            app.carritoService.viewModel.costoEnvio = 0;
                            $.each(result,function(idx, vl) {

                                var id_producto = result[idx].producto;

                                var cantidad_s1 = parseInt(result[idx].cantidad);
                                var cantidad_s2 = parseInt(result[idx].precio);

                                var cantidad_s = cantidad_s1 * cantidad_s2;
                                app.carritoService.viewModel.total_s = app.carritoService.viewModel.total_s + (cantidad_s * app.productosService.viewModel.cambio);
                                console.log('total compra: '+cantidad_s * app.productosService.viewModel.cambio);

                                $('#totalCh').val(app.carritoService.viewModel.total_s);

                                var peso = parseInt(result[idx].peso) * parseInt(result[idx].cantidad);
                                app.carritoService.viewModel.pesoTotal +=peso;
                                console.log(app.carritoService.viewModel.pesoTotal );
                                var pesoTotal = app.carritoService.viewModel.pesoTotal;
                                $.ajax({
                                    url: app.servidor+'obtener_rango_app'
                                })
                                .done(function(rango) {
                                    console.log("success rango");
                                    // console.log(rango);
                                    // console.log('var peso: '+result[idx].peso);
                                    $.each(rango,function(idx, vl) {
                                        var rang_min = parseInt(rango[idx].rango_minimo);
                                        var rang_max = parseInt(rango[idx].rango_maximo);
                                        // console.log('rango_minimo envio: '+rang_min);
                                        // console.log('rango_maximo envio: '+rang_max);
                                        if (pesoTotal >= rang_min && pesoTotal <= rang_max) {
                                            var pesoEnvio = rango[idx].precio * app.productosService.viewModel.cambio;   
                                            $('#envio').val(pesoEnvio);
                                            console.log('precio envio: '+pesoEnvio);
                                            console.log('precio subtotal: '+app.carritoService.viewModel.total_s);
                                            console.log('precio subtotal: '+app.carritoService.viewModel.cambio);

                                            var granTotal = app.carritoService.viewModel.total_s + pesoEnvio;
                                            $('#granTotal').val(granTotal);
                                            

                                            var cleave = new Cleave('#envio', {
                                                prefix: app.productosService.viewModel.moneda+' $',
                                                numeral: true,
                                                numeralThousandsGroupStyle: 'thousand',
                                                rawValueTrimPrefix: true
                                            });

                                            var cleave = new Cleave('#granTotal', {
                                                prefix: app.productosService.viewModel.moneda+' $',
                                                numeral: true,
                                                numeralThousandsGroupStyle: 'thousand',
                                                rawValueTrimPrefix: true
                                            });
                                        }
                                    });                         
                                })
                            });

                            var cleave = new Cleave('#totalCh', {
                                prefix: app.productosService.viewModel.moneda+' $',
                                numeral: true,
                                numeralThousandsGroupStyle: 'thousand',
                                rawValueTrimPrefix: true
                            });

                              var usuario = window.localStorage.getItem('idUsuario');
                              var test = app.pruebas;
                              Pace.track(function(){
                                $.ajax({
                                        method: "GET",
                                        dataType: 'json',
                                        url: app.servidor+"consultar_tcs",
                                        data: {
                                            usuario:usuario,
                                            test:test
                                        }
                                  }).done(function( tcs ) {
                                        console.log('entro done ver tc');
                                        console.log(tcs);
                                        if(tcs.error === false){
                                            $('#contSelectTC2').html('<select id="select-ver-tc"></select>');
                                            $.each(tcs.tcs,function(itc,vtc){
                                                console.log('entro echa2');
                                                console.log(vtc);
                                                console.log(itc);
                                                var tipo = vtc.creditCardTokenList[0].paymentMethod;
                                                $('#select-ver-tc').append('<option value="'+vtc.creditCardTokenList[0].creditCardTokenId+'" data-imagesrc="images/credit-cards/'+tipo+'.PNG" data-description="'+vtc.creditCardTokenList[0].maskedNumber+'">'+tipo+'</option>');
                                            });

                                            var ancho = $(window).width();
                                            $('#select-ver-tc').ddslick({
                                                width:ancho,
                                                onSelected: function(tc){
                                                    console.log(tc);
                                                }   
                                            });
                                            // $('#boton-borrar-tc').data("kendoMobileButton").enable(true);
                                        }else{
                                            console.log('entro erro ver tc')
                                            app.mostrarMensaje(tcs.message,'error');
                                        }
                                    
                                  });
                              });                            
                        }
                    })
                })                    
            }) 

            $('#formPago').click(function(){

                var cleave = new Cleave('#totalCh', {
                    prefix: app.productosService.viewModel.moneda+' $',
                    numeral: true,
                    numeralThousandsGroupStyle: 'thousand',
                    rawValueTrimPrefix: true
                });

                var referenceCode = window.localStorage.getItem('llave_payu');
                // var total_compra = $('#totalCh').val();
                var total_compra = cleave.getRawValue();
                var nombres = $('#inputNombreProducto').val();
                var apellido = $('#inputApellido').val();
                var nombreCompleto = nombres+' '+apellido;
                var correo = $('#inputCorreoProducto').val();
                var telefono = $('#inputTelefonoProducto').val();
                var cedula = jQuery('#inputCedula').val();
                var direccion = $('#inputDireccion').val();
                var direccionEnvio = $('#inputDireccionEnvio').val();
                var ciudad = $('#inputCiudadCheck').val();
                var departamento = $('#inputDepartamentoCheck').val();
                var pais = $('#inputPaisCheck').val();

                console.log(nombres);
                console.log(apellido);
                console.log(cedula);
                console.log(correo);
                console.log(direccion);
                console.log(direccionEnvio);
                console.log(telefono);
                console.log(ciudad);
                console.log(departamento);
                console.log(pais);
                console.log(total_compra);
                console.log(referenceCode);

                // var total_compra = cleave.getRawValue();
                // var llave_payu = window.localStorage.getItem('llave_payu');

                var expr = /^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/;
                if(!nombres){
                    app.mostrarMensaje(
                      'Escribe tu nombre',
                      'error'
                    )
                } else if(!apellido){
                    app.mostrarMensaje(
                      'Escribe tu apellido',
                      'error'
                    )
                } else if(!cedula){
                    app.mostrarMensaje(
                      'Escribe tu cedula',
                      'error'
                    )
                } else if(correo.length <= 0 || !expr.test(correo)){
                    app.mostrarMensaje(
                      'Escribe un correo válido',
                      'error'
                    )
                } else if(!direccion){
                    app.mostrarMensaje(
                      'Escribe tu direcicon',
                      'error'
                    )
                } else if(!telefono){
                    app.mostrarMensaje(
                      'Escribe tu teléfono',
                      'error'
                    )
                } else if(!direccionEnvio){
                    app.mostrarMensaje(
                      'Escribe tu direccion de envío',
                      'error'
                    )
                } else if(!ciudad){
                    app.mostrarMensaje(
                      'Escribe tu ciudad',
                      'error'
                    )
                } else if(!departamento){
                    app.mostrarMensaje(
                      'Escribe tu departamento',
                      'error'
                    )
                } else if(!pais){
                    app.mostrarMensaje(
                      'Escribe tu país',
                      'error'
                    )
                } else {
                    console.log('Formulario completado correctamente');
                     $.ajax( {
                        type: "POST",
                        url: app.servidor+'guardar_solicitud_app',         
                        dataType: "json",
                        data: {
                            nombres: nombres,
                            apellido: apellido,
                            cedula: cedula,
                            correo: correo,
                            direccion: direccion,
                            telefono: telefono,
                            direccion_envio: direccionEnvio,
                            ciudad: ciudad,
                            departamento: departamento,
                            pais: pais,
                            llave: referenceCode,
                            value:total_compra
                        },            
                    })    
                    .done(function(resultado){
                        if(resultado.status === 1){
                            console.log('redireccion');
                        } else {
                            app.mostrarMensaje(
                               resultado.message,
                              'error'
                            )
                        }
                    }); 

                }

            })                   

            $('#cuponBtn').click(function(event) {
                console.log('entre cupon.......');
                var usuario = window.localStorage.getItem('idUsuario');
                var cupon = $('#cupon').val();
                if (cupon) {
                    console.log('usuario: '+usuario);
                    console.log('cupon: '+cupon);    
                    $.ajax({
                        method: "POST",
                        url: app.servidor+"validar_cupon",                
                        dataType: 'json',
                        data: {
                            usuario:usuario,
                            cupon:cupon
                        },
                    })
                    .done(function(result) {
                        console.log(result);
                        if (result.status == 'succes') {
                            jQuery('#cupon').val(cupon);
                            jQuery('#cupon').attr('readonly','readonly');
                            app.mostrarMensaje('Cupon canjeado','succes');

                            var totalCop = jQuery('#totalCh').val();
                            var totalCop = totalCop.replace(/[COPUSD,*+?^${}()|[\]\\]/g, '');
                            var totalCop = parseFloat(totalCop);

                            var envioP = jQuery('#envio').val();
                            var envioP = envioP.replace(/[COPUSD,*+?^${}()|[\]\\]/g, '');
                            var envioP = parseFloat(envioP);

                            var valorCupon = result.result[0].valor;
                            var valorCupon = parseInt(valorCupon);
                            var valorCupon = valorCupon/100;
                            var desc = totalCop * valorCupon;
                            var totalDesc = totalCop - desc;
                            var totalDesc = totalDesc + envioP; 

                            console.log(totalDesc);                        

                            jQuery('#granTotal').val(totalDesc);                                 
                            var cleave = new Cleave('#granTotal', {
                                prefix: '$',
                                numeral: true,
                                numeralThousandsGroupStyle: 'thousand',
                                rawValueTrimPrefix: true
                            });                         
                            


                        }else if (result.status == 'error'){
                            app.mostrarMensaje(result.result,'error');                            
                        }
                    })                       
                }else{
                    app.mostrarMensaje('ingrese cupon','error');
                }        

            });
        },
        verTC: function(){
            console.log('<!-- View Ver TC -->')
          $('#boton-borrar-tc').data("kendoMobileButton").enable(false);
          
          var usuario = window.localStorage.getItem('idUsuario');
          var test = app.pruebas;
          Pace.track(function(){
            $.ajax({
                    method: "GET",
                    dataType: 'json',
                    url: app.servidor+"consultar_tcs",
                    data: {
                        usuario:usuario,
                        test:test
                    }
              }).done(function( tcs ) {
                    console.log('entro done ver tc');
                    console.log(tcs);
                    if(tcs.error === false){
                        $('#contSelectTC').html('<select id="select-ver-tc"></select>');
                        $.each(tcs.tcs,function(itc,vtc){
                            console.log('entro echa');
                            console.log(vtc);
                            console.log(itc);
                            var tipo = vtc.creditCardTokenList[0].paymentMethod;
                            $('#select-ver-tc').append('<option value="'+vtc.creditCardTokenList[0].creditCardTokenId+'" data-imagesrc="images/credit-cards/'+tipo+'.PNG" data-description="'+vtc.creditCardTokenList[0].maskedNumber+'">'+tipo+'</option>');
                        });

                        var ancho = $(window).width();
                        $('#select-ver-tc').ddslick({
                            width:ancho,
                            onSelected: function(tc){
                                console.log(tc);
                            }   
                        });
                        $('#boton-borrar-tc').data("kendoMobileButton").enable(true);
                    }else{
                        console.log('entro erro ver tc')
                        app.mostrarMensaje(tcs.message,'error');
                    }
                
              });
          });
        },
        procesoCompra : 0,
        mostrarAgregarTC: function(e){
            console.log('<!-- View Agregar TC -->');
            var compra = e.view.params.compra;
            app.checkoutService.viewModel.procesoCompra = parseInt(compra);
            console.log('Proceso de compra: '+app.checkoutService.viewModel.procesoCompra);
            $('.tc-container form').card({
                // a selector or DOM element for the container
                // where you want the card to appear
                container: '.card-wrapper', // *required*

                // all of the other options from above
                placeholders: {
                    number: '•••• •••• •••• ••••',
                    name: 'Nombre en tarjeta',
                    expiry: 'MM/AAAA',
                    cvc: 'CVC'
                },
            });
        },
        agregarTC:function(){

            var nombreTC = $('#nombreTC').val();
            var payerId = window.localStorage.getItem('idUsuario');
            var cedula = $('#cedula').val();
            var tarjeta = $('#numeroTC').val();
            var numTarjeta = tarjeta.replace(/ /g,"");
            var Exp = jQuery('#expTC').val();
            values=Exp.split('/');
            var mesExp = values[0];
            var anioExp = values[1];
            var fechaExp = anioExp+'/'+mesExp;
            var franquicia = payU.cardPaymentMethod($('#numeroTC').val());

            if (nombreTC && cedula && numTarjeta && Exp) {

                $.ajax({
                  method: "GET",          
                  url: app.servidor+"agregarTarjeta",
                  dataType: 'json',
                  data: {
                      nombreTC:nombreTC,
                      payerId:payerId,
                      cedula:cedula,
                      numTarjeta: numTarjeta,
                      fechaExp:fechaExp,
                      franquicia:franquicia
                  }
                })
                .done(function( result ) {
                    console.log('result')
                    console.log(result)
                    if (result.error == false) {
                        app.mostrarMensaje(result.message, 'success');
                        $('#numeroTC').val('');
                        $('#nombreTC').val('');
                        $('#expTC').val('');
                        $('#cedula').val('');
                    }else{
                        app.mostrarMensaje(result.message, 'error');
                    }
                });

            }else{
                app.mostrarMensaje('Completa todos los datos','error')
            }   
        },
        borrarTC: function(){
            var modelo = this;
            var ddTC = $('#select-ver-tc').data('ddslick');
            console.log(ddTC);
            var tokenTC = ddTC.selectedData.value;
            var description = ddTC.selectedData.description;
            var datosBorrar = {}
            datosBorrar.usuario = window.localStorage.getItem('idUsuario');
            datosBorrar.token = tokenTC;
            console.log('Token a borrar:');
            console.log(datosBorrar.usuario);
            console.log(datosBorrar.token);
            
            navigator.notification.confirm(
                '¿Realmente deseas eliminar tu tarjeta '+description+'?', // message
                function(boton){
                    if(boton === 1){
                        console.log(datosBorrar);
                        Pace.track(function(){
                            $.ajax({
                                method:'GET',
                                url: app.servidor+'eliminar_tc',
                                data:datosBorrar,
                                dataType: 'json'
                            })
                            .done(function( respuestaEliminar ) {
                                console.log(respuestaEliminar);
                                if(respuestaEliminar.error === false){
                                    app.mostrarMensaje(respuestaEliminar.message,'success');
                                    modelo.verTC();
                                }else{
                                    app.mostrarMensaje(respuestaEliminar.message,'error');
                                }
                                
                            })
                            .error(function(error){
                                console.log(JSON.stringify(error));
                            });
                        });
                    }
                },            // callback to invoke with index of button pressed
                'Eliminar tarjeta de crédito',           // title
                ['Borrar','Cancelar']         // buttonLabels
            );
        },        
        enviarPago:function(){
            console.log('clicked submit'); // --> works

            var referenceCode = window.localStorage.getItem('llave_payu');
            var total_compra = $('#totalCh').val();
            var nombres = $('#inputNombreProducto').val();
            var apellido = $('#inputApellido').val();
            var nombreCompleto = nombres+' '+apellido;
            var correo = $('#inputCorreoProducto').val();
            var telefono = $('#inputTelefonoProducto').val();
            var cedula = jQuery('#inputCedula').val();
            var direccion = $('#inputDireccion').val();
            var direccionEnvio = $('#inputDireccionEnvio').val();
            var ciudad = $('#inputCiudadCheck').val();
            var departamento = $('#inputDepartamentoCheck').val();
            var pais = $('#inputPaisCheck').val();

            console.log(nombres);
            console.log(apellido);
            console.log(cedula);
            console.log(correo);
            console.log(direccion);
            console.log(direccionEnvio);
            console.log(telefono);
            console.log(ciudad);
            console.log(departamento);
            console.log(pais);
            console.log(total_compra);
            console.log(referenceCode);

            // var total_compra = cleave.getRawValue();
            // var llave_payu = window.localStorage.getItem('llave_payu');
            var expr = /^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$/;
            if(!nombres){
                app.mostrarMensaje(
                  'Escribe tu nombre',
                  'error'
                )
            } else if(!apellido){
                app.mostrarMensaje(
                  'Escribe tu apellido',
                  'error'
                )
            } else if(!cedula){
                app.mostrarMensaje(
                  'Escribe tu cedula',
                  'error'
                )
            } else if(correo.length <= 0 || !expr.test(correo)){
                app.mostrarMensaje(
                  'Escribe un correo válido',
                  'error'
                )
            } else if(!direccion){
                app.mostrarMensaje(
                  'Escribe tu direcicon',
                  'error'
                )
            } else if(!telefono){
                app.mostrarMensaje(
                  'Escribe tu teléfono',
                  'error'
                )
            } else if(!direccionEnvio){
                app.mostrarMensaje(
                  'Escribe tu direccion de envío',
                  'error'
                )
            } else if(!ciudad){
                app.mostrarMensaje(
                  'Escribe tu ciudad',
                  'error'
                )
            } else if(!departamento){
                app.mostrarMensaje(
                  'Escribe tu departamento',
                  'error'
                )
            } else if(!pais){
                app.mostrarMensaje(
                  'Escribe tu país',
                  'error'
                )
            } else {
                console.log('Formulario completado correctamente');
                //  $.ajax( {
                //     type: "POST",
                //     url: app.servidor+'guardar_solicitud_app',         
                //     dataType: "json",
                //     data: {
                //         nombres: nombres,
                //         apellido: apellido,
                //         cedula: cedula,
                //         correo: correo,
                //         direccion: direccion,
                //         telefono: telefono,
                //         direccion_envio: direccionEnvio,
                //         ciudad: ciudad,
                //         departamento: departamento,
                //         pais: pais,
                //         llave: referenceCode,
                //         value:total_compra
                //     },            
                // })    
                // .done(function(resultado){
                //     if(resultado.status === 1){
                //         console.log('redireccion');
                //     } else {
                //         app.mostrarMensaje(
                //            resultado.message,
                //           'error'
                //         )
                //     }
                // }); 

            }

        }
        
    });

    app.checkoutService = {
        viewModel: new checkoutViewModel()
    };
})(window);