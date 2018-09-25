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
                                
                                $.ajax({
                                    method: 'GET',
                                    url: app.servidor+'obtener_img_productos_carrito_app',
                                    dataType: 'json',
                                    data: {
                                        id:id_producto
                                    }
                                })
                                .done(function(respuesta) {
                                    console.log(respuesta);

                                    $('#productos_b').append(''+
                                        '<div class="mtb">'+
                                            '<div class="row-fluid cont_proc">'+
                                                '<div class="imagen-galeria span3">'+
                                                    '<img src="'+app.server+''+respuesta.imagen+'">'+
                                                '</div>'+
                                                '<div class="span9">'+
                                                    '<div class="row-fluid">'+
                                                        '<div class="span6">'+
                                                            '<p>Cantidad</p>'+
                                                        '</div>'+
                                                        '<div class="span6">'+
                                                            '<p class="precio"><input style="width:100%;font-size:10px;" id="cant'+idx+'" class="cValor" value="'+result[idx].cantidad+'" type="text" readonly></p>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</div>'+
                                                '<div class="imagen-galeria span3">'+
                                                    '<span class="precio"><input style="width:100%;font-size:10px;" id="precio'+idx+'" class="cValor" value="'+result[idx].precio * app.productosService.viewModel.cambio+'" type="text" readonly></span>'+
                                                '</div>'+
                                            '</div>'+
                                        '</div>'+
                                    '');
                                    var cleave = new Cleave('#precio'+idx+'', {
                                        prefix: app.productosService.viewModel.moneda+' $',
                                        numeral: true,
                                        numeralThousandsGroupStyle: 'thousand',
                                        rawValueTrimPrefix: true
                                    });
                                })

                            
                                // var pesoTotal = $('#envio').val();
                                // console.log('costo envio: '+pesoTotal);
                                // var pesoTotal = pesoTotal.replace(/[COPUSD.,*+?^${}()|[\]\\]/g, '');
                                // var pesoTotal = parseInt(pesoTotal);
                                // console.log('costo envio: '+pesoTotal);
                            });

                            var cleave = new Cleave('#totalCh', {
                                prefix: app.productosService.viewModel.moneda+' $',
                                numeral: true,
                                numeralThousandsGroupStyle: 'thousand',
                                rawValueTrimPrefix: true
                            });
                        }
                    })
                })                    
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
          $('#boton-borrar-tc').data("kendoMobileButton").enable(false);
          var tokens = {};
          tokens.usuario = window.localStorage.getItem('idUsuario');
          tokens.test = app.pruebas;
          Pace.track(function(){
            $.ajax({
              method: "GET",
              url: app.servidor+"consultar_tcs",
              data: tokens,
              dataType: 'json'
              })
              .done(function( tcs ) {
                console.log(tcs);
                if(tcs.error === false){
                    $('#contSelectTC').html('<select id="select-ver-tc"></select>');
                    $.each(tcs.tcs,function(itc,vtc){
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
                    app.mostrarMensaje(tcs.message,'error');
                }
                
              });
          });
        },
        procesoCompra : 0,
        mostrarAgregarTC: function(e){
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
            var Exp = jQuery('#expTC').val();
            values=Exp.split('/');
            var mesExp = values[0];
            var anioExp = values[1];

           
            var franquicia = payU.cardPaymentMethod($('#numeroTC').val());
            console.log(app.pruebas);
            var datosTC = {
                number:$('#numeroTC').val().replace(/\s/g, ''),
                name_card:$('#nombreTC').val(),
                payer_id:window.localStorage.getItem('idUsuario'), 
                exp_month:parseInt(mesExp),
                exp_year:parseInt(anioExp),
                method:franquicia,
             }
            console.log(datosTC);
            console.log(app.pruebas);
            if(app.pruebas){ 
                console.log('entro pruebas');
                payU.setURL('http://sandbox.api.payulatam.com/payments-api/4.0/service');
                //payU.setPublicKey("6u39nqhq8ftd0hlvnjfs66eh8c"); /* Test */
                payU.setPublicKey("PKaC6H4cEDJD919n705L544kSU");
                payU.setAccountID("512321");
                payU.setListBoxID('mylistID');
                payU.getPaymentMethods();
            }else{
                console.log('entro real');
                payU.setURL('https://api.payulatam.com/payments-api/4.0/service'); /* Producción */
                payU.setPublicKey("PKaoH5W14pdw66s70X50hSx0Rt"); /* Sushitoc */
                payU.setAccountID("89375"); //3 brasil // 9 argentina // 1 colombia /* Kheiron */
                payU.setListBoxID('TU LIST BOX ID', 'texto opcional');
                payU.getPaymentMethods();
                //No tienes tarjeta crédito como medio de pago activo para tokenizar (Verifica que estás utilizando 
                payU.setLanguage("es");// optional
            }
            
            payU.setCardDetails(
              datosTC
            );
            console.log(datosTC);
            // payU.getPaymentMethods();
            payU.createToken(responseHandler);        
            
            function responseHandler(response){
                console.log('responseHandler'+ JSON.stringify(response));
              if (response.error) {
                // Se muestra los mensajes de error.
                app.mostrarMensaje(response.error,'error');
              }
              else {
                // Se obtiene el token y se puede guardar o enviarlo para algún pago.
                var token = response.token;
                var payer_id = response.payer_id;
                var document = response.document;
                var name = response.name;
                console.log('Tarjeta encriptada con Token: '+token);
                window.localStorage.setItem('token',token);
                var datosToken ={};
                datosToken.usuario = window.localStorage.getItem('idUsuario');
                datosToken.token =token;
                datosToken.test = app.pruebas;
                Pace.track(function(){
                    $.ajax({
                      method: "GET",
                      url: app.servidor+"agregar_token_payu",
                      data: datosToken,
                      dataType: 'json'
                    })
                    .done(function( tokenIngreso ) {
                        console.log(tokenIngreso); 
                        if(!tokenIngreso.error){
                            app.mostrarMensaje(tokenIngreso.message,'success');
                            $('#numeroTC').val('');
                            $('#nombreTC').val('');
                            $('#expTC').val('');
                            if(app.citasServicio.modelo.procesoCompra === 1){
                                app.application.navigate('view-pago','fade');
                            }else{
                                app.application.navigate('view-ver-tc','fade');    
                            }
                            
                        }else{
                            app.mostrarMensaje(tokenIngreso.message,'error');
                        }
                    });
                });
            
                    //modelo.pagoExitoso();
                    
                    
              }
            }
        },
        enviarSolicitud:function(){
             var prueba = true;
            if(prueba){
                 var accountId = $('#accountId').val('512321');
                 var api_key = $('#Api_key').val('4Vj8eK4rloUd272L48hsrarnUA');;
                 var referenceCode = $('#referenceCode').val(window.localStorage.getItem('llave_payu'));
                 var currency = $('#accountId').val('COP');
                 var merchantId = $('#merchantId').val('508029');
                 var test = $('#test').val(1);
                 var formPayu = $('#formPayu').attr('accion','https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu');
            } else {
                 var accountId = '532870';
                 var api_key = 'pC56j2dD64ai24I41xI1e4WurV';
                 var referenceCode = $llaveCompra;
                 var currency = 'COP';
                 var merchantId = '530976';
                 var test = 0;
                 var url = 'https://gateway.payulatam.com/ppp-web-gateway/';
            }

            console.log('clicked submit'); // --> works
            // pretty sure the problem is here

            // var total_compra = cleave.getRawValue();
            var total_compra = $('#totalCh').val();
            var nombres = $('#inputNombreProducto').val();
            var apellido = $('#inputApellido').val();
            var cedula = jQuery('#inputCedula').val();
            var correo = $('#inputCorreoProducto').val();
            var direccion = $('#inputDireccion').val();
            var telefono = $('#inputTelefonoProducto').val();
            var direccionEnvio = $('#inputDireccionEnvio').val();
            var llave_payu = window.localStorage.getItem('llave_payu');
            var pais = $('#inputPais').val();
            var ciudad = $('#inputCiudad').val();
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
            } else if(!pais){
                app.mostrarMensaje(
                  'Escribe tu pais',
                  'error'
                )
            } else if(!ciudad){
                app.mostrarMensaje(
                  'Escribe tu ciudad',
                  'error'
                )
            } else {

                $('#btn-enviar-solicitud').hide();
                $('#payerFullName').val(nombres);
                $('#buyerEmail').val(correo);
                $('#telephone').val(telefono);
                $('#amount').val(total_compra);        
                $.ajax( {
                    type: "GET",
                    url: app.servidor+'generar_firma_app',         
                    dataType: "json",
                    data: {
                        amount: total_compra,
                        llave: llave_payu
                    },
                })    
                .done(function( firma ){
                    $('#signature').val(firma);
                    console.log('llave: '+firma);
                }) 
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
                        pais: pais,
                        ciudad: ciudad,
                        llave: llave_payu
                    },            
                })    
                .done(function(resultado){
                    if(resultado.status === 1){
                        // document.formPayu.submit();
                        console.log('redireccion');
                    } else {
                        app.mostrarMensaje(
                           resultado.message,
                          'error'
                        )
                    }
                }); 

            }

        }
        
    });

    app.checkoutService = {
        viewModel: new checkoutViewModel()
    };
})(window);