(function (global) {
    var bienvenidaViewModel,
        app = global.app = global.app || {};

    bienvenidaViewModel = kendo.data.ObservableObject.extend({
        mostrarDrawer: function(){
            var usuario = window.localStorage.getItem('usernameUsuario');
            var password = window.localStorage.getItem('passwordUsuario');
            if(usuario && password){
                $('#link_tc').show();
                $('.cerrarSesion').show();
            }else{
                 $('#link_tc').hide(); 
                 $('.cerrarSesion').hide(); 
            } 
        },
		mostrar:function(){
            $('#noticiaDia').html('');            
            // Slider
            Pace.track(function(){
                $.ajax({
                    method:'GET',
                    url: app.servidor+'obtener_slider_app ', 
                    dataType: 'json', 
                    data:{}
                }).
                done(function(info){
                    //console.log(info);
                    $.each(info, function(index,value) {
                        $('#sliderHome').append('<div class="swiper-slide"><div id="slide-'+value.id+'" class="portadaHome"></div><div style="margin-bottom:2em;" class="titleHome">'+value.titulo+'<br><br><span>'+value.descripcion+'</span></div></div>');
                        $('#slide-'+value.id).attr('style','background-image:url("'+value.imagen+'")');
                    })     
                    var swiper = new Swiper('.swiper-home', {
                        pagination: '.swiper-pagination',
                        paginationClickable: true,
                        autoplay:3000,
                        effect: 'fade'
                    });
                })
            });
            
            // Noticia del día
            Pace.track(function() {
                $.ajax({
                    method:'GET',
                    url: app.servidor+'obtener_noticia_dia_app', 
                    dataType: 'json', 
                    data:{}
                }).
            	done(function(result) {
                    //console.log(result);
                    $('#noticiaDia').append(''+
                		'<div class="contenedorInt" id="noticiaHome" style="background: url('+result.imagen+');">'+
                			'<div class="pad">'+
                				'<div class="dest">Noticia del día</div>'+
                				'<div class="cont-info">'+
                					'<p class="fecha">'+result.fecha_creacion+'</p>'+
                					'<p class="titulo">'+result.titulo+'</p>'+
                				'</div>'+
                                '<a class="btn_mas" href="#view-noticias-detalle?imagen='+result.imagen+'&titulo='+result.titulo+'&fecha='+result.fecha_creacion+'&id='+result.id+'">Leer más</a>'+
                			'</div>'+
                		'</div>'
                	+'');
                    
            	});
            });
            
            Pace.track(function(){
                $.ajax({
                    method:'POST',
                    url: app.servidor+'obtener_noticias_limit_app ', 
                    dataType: 'json', 
                    data:{}
                }).
                done(function(noticias){
                    $('#noticiasDia').html('');
                    $.each(noticias, function(index,value){  
        				$('#noticiasDia').append(''+
                        	'<div class="row nt">'+
                        		'<div class="span5">'+
                        				'<img src="'+value.imagen+'">'+
                        		'</div>'+
                        		'<div class="span7">'+
                        			'<p class="titulo tp"><b>'+value.titulo.substring(0,30)+'...</b></p>'+
                        			'<div class="row">'+
                        				'<div class="span7">'+
                        					'<p class="fecha fecha2"><i class="fa fa-calendar"></i>'+value.fecha_creacion+'</p>'+
                        				'</div>'+
                        				'<div class="span5">'+
                        					'<a href="#view-noticias-detalle?imagen='+value.imagen+'&titulo='+value.titulo+'&fecha='+value.fecha_creacion+'&id='+value.id+'"><div class="btn_other">Leer más</div></a>'+
                        				'</div>'+
                        			'</div>'+
                        		'</div>'+
                        	'</div>'+
                        '');
                    });
                })

                var llave = window.localStorage.getItem('llave_payu');
                console.log('llave: '+llave);
                if (llave) {
                    $.ajax({
                        method:'POST',
                        url: app.servidor+'obtener_cantidad_productos_app',
                        dataType: 'json',
                        data:{llave:llave}
                    }).
                    done(function(res){

                        if (res.cantidad > 0) {
                            console.log('poniendo badage')
                            $('#carrito').addClass('badge');
                            $('#carritoAtras').addClass('badge');

                        }else{
                            console.log('no hay productos en carrito')
                            $('#carrito').removeClass('badge');  
                            $('#carritoAtras').removeClass('badge');
                        }
                    })                                    
                }
            });
    	},
        // badage:function(){
        //     var llave = window.localStorage.getItem('llave_payu');
        //     $.ajax({
        //         url: app.servidor+'obtener_cantidad_productos',
        //         dataType: 'json',
        //         data:{llave:llave}
        //     }).
        //     done(function(badage){
        //         console.log('badage; '+badage)
        //         if (badage > 0) {
        //             $('#carrito').addClass('badge_twitter');                    
        //         }else{
        //             console.log('no hay productos en carrito')
        //         }
        //     })
        // }
    });

    app.bienvenidaService = {
        viewModel: new bienvenidaViewModel()
    };
})(window);