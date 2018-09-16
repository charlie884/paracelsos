(function (global) {
    var favoritosViewModel,
        app = global.app = global.app || {};

    favoritosViewModel = kendo.data.ObservableObject.extend({
		mostrarFavoritos:function(){
            console.log(app.favoritos);
            $('#listaFavoritos').html('');
            $.each(app.favoritos, function(index, vl) {
                Pace.track(function(){
                    $.ajax({
                        method:'POST',
                        url: app.servidor+'obtener_detalle_fav ', 
                        dataType: 'json', 
                        data:{id: vl}
                    }).done(function(value){
                        console.log(value);
            	        $('#listaFavoritos').append('<a href="#view-detalle-categorias?id='+value.id+'"><div class="fav" style="background-image: url('+value.imagen+');"><div class="tituloFav">'+value.titulo+'</div></div></a>');          
                    })
                });  
            })
    	},       
		mostrarFavoritosN:function(){
            console.log(app.favoritas);
            $('#listaFavoritosN').html('');
            $.each(app.favoritas, function(index, vl) {
                Pace.track(function(){
                    $.ajax({
                        method:'POST',
                        url: app.servidor+'obtener_detalle_fav_n ', 
                        dataType: 'json', 
                        data:{id: vl}
                    }).done(function(value){
                        console.log(value);
            	        $('#listaFavoritosN').append('<a href="#view-noticias-detalle?imagen='+value.imagen+'&titulo='+value.titulo+'&fecha='+value.fecha_creacion+'&id='+value.id+'"><div class="fav" style="background-image: url('+value.imagen+');"><div class="tituloFav">'+value.titulo+'</div></div></a>');          
                    })
                });  
            })
    	},        
    });

    app.favoritosService = {
        viewModel: new favoritosViewModel()
    };
})(window);