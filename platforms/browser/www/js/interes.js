(function (global) {
    var interesViewModel,
        app = global.app = global.app || {};

    interesViewModel = kendo.data.ObservableObject.extend({
        galleryTop: null,
        galleryThumbs: null,
        temas: null,
		mostrar:function(e){
            // cargar vista desde el top
            e.view.scroller.scrollTo(0, 0);
            $('#contTextos').html('');
            $('#categoriasArticulos').html('');
            $('#catArticulos').html('');
            $('#artCategorias').html('');
            $('#articulos').html('');
            
            if(window.localStorage.getItem('usernameUsuario')){
                Pace.track(function(){
                    $.ajax({
                        method: 'POST',
                        url: app.servidor+'obtener_interes_cat_app',
                        dataType: 'json',
                        data: {idUser: window.localStorage.getItem('idUsuario')}
                    }).done(function(respuesta) {
                        console.log(respuesta);
                        if(respuesta){
                            $('#categoriasArticulos').append('<div class="swiper-wrapper" id="catArticulos"></div>');
                            $('#articulos').append('<div class="swiper-wrapper" id="artCategorias"></div>');
                            $.each(respuesta,function(index,valor){
                                $('#catArticulos').append('<div class="swiper-slide" id="articuloCat-'+valor.id+'">'+valor.categoria+'</div>');
                                $('#artCategorias').append('<div class="swiper-slide" id="art-'+valor.id+'"></div>');
                                Pace.track(function(){
                                    $.ajax({
                                        method: 'POST',
                                        url: app.servidor+'obtener_articulos_app',
                                        dataType: 'json',
                                        data: {
                                            id:valor.id,
                                        }
                                    }).done(function(respuesta) {
                                        console.log(respuesta);
                                        $('#cart-'+valor.id).html();
                                        $.each(respuesta,function(idx,val){
                                            $('#art-'+valor.id).append('<a href="#view-detalle-categorias?id='+val.id+'"><div class="categoria"><div style="background-image:url('+val.imagen+')" class="image"></div><div class="contTexto"><div class="title">'+val.titulo+'</div><div class="info">'+val.introduccion+'</div></div></div></a>');
                                       });
                                       
                                    })
                                });
                           });
                            
                             app.interesService.viewModel.galleryTop = new Swiper('.gallery-top', {
                                spaceBetween: 10,
                                initialSlide: 0,
                                scrollbarHide: false,
                                autoHeight: true,
                            });
                            app.interesService.viewModel.galleryThumbs = new Swiper('.gallery-thumbs', {
                                initialSlide: 0,
                                spaceBetween: 10,
                                centeredSlides: true,
                                slidesPerView: 'auto',
                                touchRatio: 0.2,
                                slideToClickedSlide: true,
                                setWrapperSize: true
                            });
                            app.interesService.viewModel.galleryTop.params.control = app.interesService.viewModel.galleryThumbs;
                            app.interesService.viewModel.galleryThumbs.params.control = app.interesService.viewModel.galleryTop;    
                         } else { 
                             
                            app.interesService.viewModel.temas = false;
                            $('#contTextos').append('<p>No cuenta con temas de interés asignados, estos se asignarán según sus consultas virtuales</p>');  
                         }
                    })
                    
                });
             } else {                 
                $('#contTextos').append('<p>No cuenta con temas de interés asignados o no ha <a href="#view-no-login">iniciado sesión</a>, estos se asignarán según sus consultas virtuales</p>');  
             }
    	},        
        ocultar:function(){
            if(window.localStorage.getItem('usernameUsuario') && app.interesService.viewModel.temas){
                app.interesService.viewModel.galleryTop.destroy(true, false);
                app.interesService.viewModel.galleryThumbs.destroy(true,false);
            }
        },
        idActual: 0,
        mostrarArticulos:function(e){
            e.view.scroller.scrollTo(0, 0);
            var id = e.view.params.id;
            app.interesService.viewModel.idActual = id;
            $('#introArticulo').html('');
            $('#contenidoArticulo').html('');
            $('#compartirArt').hide();
            $('#favArticulo').hide();
            if (window.localStorage.getItem('idUsuario')) {
            	$('#compartirArt').show();
                $('#favArticulo').show();
            }
            Pace.track(function(){
                $.ajax({
                    method: 'GET',
                    url: app.servidor+'detalle_articulos_app',
                    dataType: 'json',
                    data: {
                        id:id,
                    }
                }).done(function(respuesta) {
                    console.log(respuesta);
                    $('#introArticulo').append('<div style="background-image:url('+respuesta.imagen+')" class="portadaProducto"></div><div class="titlePortada">'+respuesta.titulo+'</div>');
                    $('#contenidoArticulo').append('<div class="textPortada">'+respuesta.contenido+'</div>');
                })
            });
            console.log('actual:'+id +' favoritos: '+app.favoritos);
            var encontrado = app.favoritos.indexOf(id);
            console.log('encontrado: '+encontrado);
            
            if(encontrado != -1){
                $('#favTema').html('<i class="fa fa-star" aria-hidden="true"></i>');
            } else {
                $('#favTema').html('<i class="fa fa-star-o" aria-hidden="true"></i>');
            }
        },
        favorito:function(id){
            var id = app.interesService.viewModel.idActual;
            console.log('actual:'+id +' favoritos: '+app.favoritos);
            var encontrado = app.favoritos.indexOf(id);
            console.log('encontrado: '+encontrado);
            
            if(encontrado >= 0){
                console.log('ENCONTRADO');
               $('#favTema').html('<i class="fa fa-star-o" aria-hidden="true"></i>');
               app.favoritos.splice(encontrado, 1);
               console.log(typeof app.favoritos);
               window.localStorage.setItem('favoritos', app.favoritos); 
                
               app.mostrarMensaje('Artículo removida de favoritos', 'success');
                
            } else {
                console.log('NO ENCONTRADO');
               $('#favTema').html('<i class="fa fa-star" aria-hidden="true"></i>');
               app.favoritos.push(app.interesService.viewModel.idActual);
               console.log(typeof app.favoritos);
               window.localStorage.setItem('favoritos', app.favoritos);
                
               app.mostrarMensaje('Artículo agregado a favoritos', 'success');  
               
            }
        }
    });

    app.interesService = {
        viewModel: new interesViewModel()
    };
})(window);