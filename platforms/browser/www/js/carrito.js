(function (global) {
    var carritoViewModel,
        app = global.app = global.app || {};

    carritoViewModel = kendo.data.ObservableObject.extend({
        total_s:0,
        stock:0,
        moneda:null,
        cambio:0,
        mostrarProducto:function(e){
            $('#productos_carrito').html('');
            $('.km-scroll-container').css('height','100%');
            console.log('<!-- View carrito -->');
            if (window.localStorage.getItem('idUsuario')) {
                e.view.scroller.scrollTo(0, 0);
                $('#totalT').attr('value', 0);
                $('.km-scroll-container').css('height','100%');
                // $('.total').html('');
                console.log('entro carrito');
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
                if (window.localStorage.getItem('llave_payu')) {
                    Pace.track(function(){
                        var llave = window.localStorage.getItem('llave_payu');
                        console.log(llave);
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
                                }).done(function(result) {
                                    console.log('entro each btn '+result.length);

                                    if (result.length >= 1) {

                                        $('.cont_btnCar').show('');

                                        console.log('entro apepend btn');
                                        $('#btn_carrito').html('');
                                        $('#totalT').val(0);

                                        if (window.localStorage.getItem('idUsuario')) {
                                            console.log('entre idUsuario');
                                            $('#btn_carrito').append('<a href="#view-checkout" class="readmore">Procesar compra</a>');                                    
                                        }
                                        if (result.length >3) {
                                            $('#view-carrito .pt').css('position','relative');
                                        }

                                    }else{

                                        $('.cont_btnCar').hide('');

                                        $('#productos_carrito').append(''+
                                            '<div align="center" class="span12">'+
                                            '<img style="margin-top:2em;" src="images/uppscar.png" alt="" class="ico">'+
                                                '<h3 style="margin-top: 1em;">No has agrgado productos al carrito</h3>'+
                                            '</div>  '+                              
                                        '');
                                    }

                                    app.carritoService.viewModel.total_s = 0;
                                    $.each(result,function(idx,val){
                                        var id_producto = result[idx].producto;
                                        console.log(id_producto);
                                        $.ajax({
                                            method: 'GET',
                                            url: app.servidor+'obtener_img_productos_carrito_app',
                                            dataType: 'json',
                                            data: {
                                                id:id_producto
                                            }
                                        }).done(function(id){
                                            // console.log('id nombre: '+id.producto);
                                            // console.log('id id_producto: '+id.id);
                                            // console.log('id imagen: '+id.imagen);
                                            // console.log('id cantidad: '+result[idx].cant_producto);
                                            var producto_name = id.id;
                                            var producto_cant = result[idx].cant_producto;
                                            var producto_img = id.imagen;
                                            $.ajax({
                                                method: 'POST',
                                                url: app.servidor+'obtener_stock_dos_app',
                                                dataType: 'json',
                                                data: {
                                                    producto_name:producto_name,
                                                    producto_cant:producto_cant
                                                }

                                            }).done(function(stock){
                                                console.log('stock: '+stock);
                                                app.carritoService.viewModel.stock = stock;
                                                $('#productos_carrito').append(''+
                                                    '<input type="hidden" id="cont'+idx+'" value="'+app.carritoService.viewModel.stock+'" name="">'
                                                +'');

                                                $('#productos_carrito').append(''+
                                                    '<div class="mtb">'+
                                                        '<div class="row-fluid">'+
                                                            '<div class="span10">'+
                                                                '<p>'+id.producto+'</p>'+
                                                            '</div>'+
                                                            '<div class="span2">'+
                                                                '<div onclick="app.carritoService.viewModel.deleteItem('+result[idx].id+')" class="delete-button">'+
                                                                    'X'+
                                                                '</div>'+
                                                            '</div>'+
                                                        '</div>'+
                                                        '<div class="row-fluid cont_proc">'+
                                                            '<div class="imagen-galeria span3">'+
                                                                '<img src="'+app.server+''+id.imagen+'">'+
                                                            '</div>'+
                                                            '<div class="span9">'+
                                                                '<div class="cantidad">'+
                                                                    '<p>'+
                                                                        '<input type="button" value="-" class="disminuirF" onclick="app.carritoService.viewModel.disminuir('+result[idx].precio+','+result[idx].id+','+idx+')" field="quantity" />'+
                                                                        '<input class="cantidadF" id="cantidad'+idx+'" type="text" name="cantidad" value="'+result[idx].cantidad+'" readonly="readonly" />'+
                                                                        '<input type="button" value="+" class="aumentarF test_ca aumentar'+idx+'" onclick="app.carritoService.viewModel.aumentar('+app.carritoService.viewModel.stock+','+result[idx].precio+','+result[idx].id+','+idx+')" field="quantity" />'+
                                                                    '</p>'+
                                                                '</div>'+
                                                                '<div class="row-fluid">'+
                                                                    '<div class="span6">'+
                                                                        '<p>Precio unitario</p>'+
                                                                    '</div>'+
                                                                    '<div class="span6">'+
                                                                        '<p class="precio"><input style="width:100%;font-size:10px;" id="valor'+val.id+'" class="cValor" value="'+result[idx].precio * app.productosService.viewModel.cambio+'" type="text" readonly></p>'+
                                                                    '</div>'+
                                                                '</div>'+
                                                            '</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '');
                                                var cleave = new Cleave('#valor'+val.id+'', {
                                                    prefix: app.productosService.viewModel.moneda+' $',
                                                    numeral: true,
                                                    numeralThousandsGroupStyle: 'thousand',
                                                    rawValueTrimPrefix: true
                                                });
                                            });
                                        });
                                        $('#cant'+idx+'').click(function(){
                                            $('.btn-cant').removeClass('activeB');
                                            $(this).addClass('activeB');

                                            $('#cantidadP').val(detalle[idx].cantidad);
                                            $('#precio').val(detalle[idx].precio);

                                        });
                                        var cantidad_s1 = 0;
                                        var cantidad_s2 = 0;

                                        cantidad_s1 = parseInt(result[idx].cantidad);
                                        cantidad_s2 = parseInt(result[idx].precio);

                                        var cantidad_s = cantidad_s1 * cantidad_s2;
                                        app.carritoService.viewModel.total_s = app.carritoService.viewModel.total_s + (cantidad_s * app.productosService.viewModel.cambio);
                                        console.log('total compra: '+ app.carritoService.viewModel.total_s);

                                        $('#totalT').val(app.carritoService.viewModel.total_s);
                                        var cleave = new Cleave('#totalT', {
                                            prefix: app.productosService.viewModel.moneda+' $',
                                            numeral: true,
                                            numeralThousandsGroupStyle: 'thousand',
                                            rawValueTrimPrefix: true
                                        });
                                    });
                                });
                            })
                        })

                    });

                }else{

                $('.cont_btnCar').hide('');

                    $('#productos_carrito').append(''+
                        '<div align="center" class="span12">'+
                        '<img style="margin-top:2em;" src="images/uppscar.png" alt="" class="ico">'+
                            '<h3 style="margin-top: 1em;">No has agrgado productos al carrito</h3>'+
                        '</div>  '+                              
                    '');
                }                
            }else{

                $('.cont_btnCar').html('');
                $('#productos_carrito').append(''+
                    '<div align="center" class="span12">'+
                        '<img style="margin-top: 2em;" src="images/upps.png" alt="" />'+
                        '<h3 style="margin-top: 1em;">Debes registrarte o iniciar sesión para realizar compras</h3>'+
                    '</div>  '+                              
                '');
            }
        },
        aumentar:function(stock,precio,id,idx){
            var currentVal = parseInt($('#cantidad'+idx).val());
            console.log('entro aumentar');
            // console.log(stock);
            // console.log(precio);
            // console.log(app.productosService.viewModel.cambio);
            var precio = precio * app.productosService.viewModel.cambio;
            // console.log(id);
            // console.log(typeof(currentVal));
            // console.log(idx);
            if(stock>currentVal){
                $('#cantidad'+idx).val(currentVal + 1);
                $.ajax({
                    type: "GET",
                    url: app.servidor+'modificar_producto',         
                    dataType: "json",
                    data: {
                        id:id,
                        cantidad: (currentVal+1)
                    }
                }).done( function( resultado ) {
                    console.log(resultado);
                    // mostrarMensaje('Producto actualizado correctamente','success');
                    console.log('Producto actualizado correctamente');                                          
                    var suTotal = $('#totalT').val();
                    if (app.productosService.viewModel.moneda == 'USD') {
                        var suTotal = suTotal.replace(/[COPUSD,*+?^${}()|[\]\\]/g, '');
                        var suTotal = parseFloat(suTotal);                        
                    }else{
                        var suTotal = suTotal.replace(/[COPUSD,.*+?^${}()|[\]\\]/g, '');
                        var suTotal = parseInt(suTotal);                            
                    }
                    console.log('suTotal: '+suTotal);

                    var total_precio = precio + suTotal;
                    console.log('total aumento: '+total_precio);
                    
                    $('#totalT').val(total_precio);
                    var cleave = new Cleave('#totalT', {
                        prefix: app.productosService.viewModel.moneda+' $',
                        numeral: true,
                        numeralThousandsGroupStyle: 'thousand',
                        rawValueTrimPrefix: true
                    });
                    // $('#totalT').attr('value',total_precio);

                    setTimeout(function(){ location.reload}, 500);
                });
            } else {
                app.mostrarMensaje(
                  'No hay cantidad sufuciente',
                  'No hay cantidad sufuciente',
                  'error'
                );
            }   
        },
        disminuir:function (precio,id,idx){
            console.log('entro disminuir');
            var currentVal = parseInt($('#cantidad'+idx).val());
            var precio = precio * app.productosService.viewModel.cambio;
            // console.log(precio);
            // console.log(id);
            // console.log(currentVal);
            // console.log(idx);
            // var currentVal = parseInt($('#cantidad'+idx).val());
            var id = id;
            // If it isn't undefined or its greater than 0
            // if (currentVal > 1) {
                // Decrement one
                if (currentVal == 1) {
                    $('#cantidad'+idx).val(1);
                }else{
                    $('#cantidad'+idx).val(currentVal - 1);

                    $.ajax( {
                        type: "GET",
                        url: app.servidor+'modificar_producto',         
                        dataType: "json",
                        data: {
                            id:id,
                            cantidad: (currentVal-1)
                        }
                    }).done( function( resultado ) {
                        console.log(resultado);
                        // mostrarMensaje('Producto actualizado correctamente','success');
                        setTimeout(function(){ location.reload}, 500);
                    })
                    var precioU = precio;
                    var restTotal = $('#totalT').val();
                    if (app.productosService.viewModel.moneda == 'USD') {
                        var restTotal = restTotal.replace(/[COPUSD,*+?^${}()|[\]\\]/g, '');
                        var restTotal = parseFloat(restTotal);                        
                    }else{
                        var restTotal = restTotal.replace(/[COPUSD,.*+?^${}()|[\]\\]/g, '');
                        var restTotal = parseInt(restTotal);                            
                    }
                    var resta = restTotal - precioU;
                    $('.total input').val(resta);
                    var cleave = new Cleave('#totalT', {
                        prefix: app.productosService.viewModel.moneda+' $',
                        numeral: true,
                        numeralThousandsGroupStyle: 'thousand',
                        rawValueTrimPrefix: true
                    }); 
                }
            // } 
        },
        deleteItem:function(id){
            // app.mostrarMensaje("Are you sure?", {
            //   dismissQueue: true,
            //   buttons: true,
            // })
            // .then((willDelete) => {
            //   console.log(willDelete);
            //   console.log(id);
            //   if (willDelete) {
                $.ajax( {
                    method: "GET",
                    url: app.servidor+'eliminar_producto',         
                    dataType: "json",
                    data: {id:id},
                }).done( function( resultado ) {
                    console.log(resultado);
                    location.reload();
                }) 
            //   } else {
            //     app.mostrarMensaje("Your imaginary file is safe!");
            //   }
            // });

        }

    });

    app.carritoService = {
        viewModel: new carritoViewModel()
    };
})(window);