(function (global) {
    var noticiasViewModel,
        app = global.app = global.app || {};

    noticiasViewModel = kendo.data.ObservableObject.extend({
		mostrar:function(){
            $('#noticiaDiaInt').html('');
            $('#noticiasContenedor').html('');
            Pace.track(function() {
                $.ajax({
                    method:'GET',
                    url: app.servidor+'obtener_noticia_dia_app', 
                    dataType: 'json', 
                    data:{}
                }).
            	done(function(result) {
                    //console.log(result);
                    $('#noticiaDiaInt').append(''+
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
            // Noticias
            Pace.track(function(){
                $.ajax({
                    method:'POST',
                    url: app.servidor+'obtener_noticias_app ', 
                    dataType: 'json', 
                    data:{}
                }).
                done(function(noticias){
                    console.log(noticias);
                    $.each(noticias, function(index,value){                        
        				$('#noticiasContenedor').append(''+
                            '<a href="#view-noticias-detalle?imagen='+value.imagen+'&titulo='+value.titulo+'&fecha='+value.fecha_creacion+'&id='+value.id+'">'+
                                '<div class="itemStyle1">'+
                                    '<div class="itemHome">'+
                                    '<img src="'+value.imagen+'" alt="">'+
                                    '<p style="font-size: 13px;margin:0.2em;text-align:center;font-weight:bolder">'+value.titulo.substring(0,40)+'...</p>'+
                                        
                                    '</div>'+
                                '</div>'+
                            '</a>'+
                        '');
                    });
                })
            });
            
    	},
        idActual: 0,
        mostrarDetalle: function(e){
            e.view.scroller.scrollTo(0, 0);
            $('#navigation-container .km-button').removeClass('km-state-active');
            $('#navigation-container #noticias').addClass('km-state-active');
            
            var id = e.view.params.id;
            app.noticiasService.viewModel.idActual = id;
            
            var fecha = e.view.params.fecha;
            var contenido = e.view.params.contenido;
            var imagen = e.view.params.imagen;
            var titulo = e.view.params.titulo;
            $(".i_detalle").attr('src',imagen);
            $(".fecha").text(fecha);
            $(".titulo").text(titulo);          
            // Contenido Detalle
            Pace.track(function(){
                $.ajax({
                    method:'POST',
                    url: app.servidor+'obtener_noticia_detalle_app ', 
                    dataType: 'json', 
                    data:{id: id}
                }).
                done(function(contenido){
                    console.log(contenido);
                    $(".continfo").html(contenido);
                })
            });
            
            console.log('actual:'+id +' favoritas: '+app.favoritas);
            var encontrado = app.favoritas.indexOf(id);
            console.log('encontrado: '+encontrado);
            
            if(encontrado != -1){
                $('#favArticulo').html('<i class="fa fa-star" aria-hidden="true"></i>');
            } else {
                $('#favArticulo').html('<i class="fa fa-star-o" aria-hidden="true"></i>');
            }
            
        },
        favorito:function(id){
            var id = app.noticiasService.viewModel.idActual;
            console.log('actual:'+id +' favoritas: '+app.favoritas);
            var encontrado = app.favoritas.indexOf(id);
            console.log('encontrado: '+encontrado);
            
            if(encontrado >= 0){
                console.log('ENCONTRADO');
               $('#favArticulo').html('<i class="fa fa-star-o" aria-hidden="true"></i>');
               app.favoritas.splice(encontrado, 1);
               console.log(typeof app.favoritas);
               window.localStorage.setItem('favoritas', app.favoritas); 
                
               app.mostrarMensaje('Noticia removida de favoritos', 'success');
                
            } else {
                console.log('NO ENCONTRADO');
               $('#favArticulo').html('<i class="fa fa-star" aria-hidden="true"></i>');
               app.favoritas.push(app.noticiasService.viewModel.idActual);
               console.log(typeof app.favoritas);
               window.localStorage.setItem('favoritas', app.favoritas);
                
               app.mostrarMensaje('Noticia agregada a favoritos', 'success');  
               
            }
        }
    });

    app.noticiasService = {
        viewModel: new noticiasViewModel()
    };
})(window);