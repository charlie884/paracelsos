(function (global) {
    var checkoutViewModel,
        app = global.app = global.app || {};

    checkoutViewModel = kendo.data.ObservableObject.extend({
        total_s:0,
        carrito:function(){
            $('#productos_b').html('');
            var llave = window.localStorage.getItem('llave_payu');            

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
                    $.each(result,function(idx, vl) {

                        var id_producto = result[idx].producto;
                        
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
                                            '<span class="precio"><input style="width:100%;font-size:10px;" id="precio'+idx+'" class="cValor" value="'+result[idx].precio+'" type="text" readonly></span>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                            +'');

                            $.ajax({
                                url: app.servidor+'obtener_rango_app'
                            })
                            .done(function(rango) {
                              console.log("success rango");
                              console.log(rango);
                              var peso = parseInt(respuesta.peso);
                              var pesoTotal = peso + parseInt(pesoTotal);
                              console.log('pesoTotal: '+pesoTotal);
                              $.each(rango,function(idx, vl) {
                                var rang_min = parseInt(rango[idx].rango_minimo);
                                var rang_max = parseInt(rango[idx].rango_maximo);
                                console.log('rango_minimo envio: '+rang_min);
                                // console.log('rango_maximo envio: '+rang_max);
                                if (pesoTotal >= rang_min && pesoTotal <= rang_max) {
                                  var pesoEnvio = rango[idx].precio;
                                  console.log('peso envio: '+pesoEnvio);
                                }
                                $('#envio').val(pesoTotal);
                              });                             
                            })

                            var cleave = new Cleave('#precio'+idx+'', {
                                prefix: '$',
                                numeral: true,
                                numeralThousandsGroupStyle: 'thousand',
                                rawValueTrimPrefix: true
                            });
                        })

                        var cantidad_s1 = parseInt(result[idx].cantidad);
                        var cantidad_s2 = parseInt(result[idx].precio);

                        var cantidad_s = cantidad_s1 * cantidad_s2;
                        app.carritoService.viewModel.total_s = app.carritoService.viewModel.total_s + cantidad_s;
                        console.log('total compra: '+ app.carritoService.viewModel.total_s);

                    });
                    $('#totalCh').val(app.carritoService.viewModel.total_s);

                    var cleave = new Cleave('#totalCh', {
                        prefix: '$',
                        numeral: true,
                        numeralThousandsGroupStyle: 'thousand',
                        rawValueTrimPrefix: true
                    });
                    
                }
            })
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