(function (global) {
    //Creación de variable global en el proyecto
    var app = global.app = global.app || {};
    
    app.servidor = 'https://paracelsos.com/index.php?option=com_functions&task=';
    app.server = 'https://paracelsos.com/';
    app.share = 'https://paracelsos.com/index.php?option=com_k2&view=item&id=';
    app.pruebas = 0; //1 pruebas - 0 Producción
    
    app.favoritos = [];
    app.favoritas = [];
    
    app.mostrarMensaje = function(texto,tipo){
        var n = noty({
            text        : texto,
            type        : tipo,
            dismissQueue: true,
            timeout     : 5000,
            layout      : 'bottomCenter',
            theme       : 'someOtherTheme', 
            maxVisible  : 10
        }); 
    }
    
    if(!window.localStorage.getItem('favoritos')){
        app.favoritos = [];
    } else {
        app.favoritos = window.localStorage.getItem('favoritos').split(',');      
    }
    
    if(!window.localStorage.getItem('favoritas')){
        app.favoritas = [];
        window.localStorage.setItem('favoritas',app.favoritas);
    } else {
        app.favoritas = window.localStorage.getItem('favoritas').split(',');      
    }
    
    
    document.addEventListener("deviceready", function () {
        StatusBar.backgroundColorByHexString("#153c6c"); 
        if (window.navigator.simulator !== true && window.analytics){  
            window.analytics.startTrackerWithId('UA-85129883-1');
        } 
        if (navigator && navigator.splashscreen) {
            navigator.splashscreen.hide();
        }
        
        $.ajaxSetup({
          error:function(e){
              app.mostrarMensaje('Error comunicando con la plataforma','error');
          }
        });
        var usuario = window.localStorage.getItem('usernameUsuario');
            var password = window.localStorage.getItem('passwordUsuario');
            if(usuario && password){
                app.perfilService.viewModel.iniciarSesionNoAPP(usuario,password);
            }else{
                $('.mlogin').hide();
                $('.madmin').hide();
                app.application = new kendo.mobile.Application(document.body, { skin: "flat", initial:'view-bienvenida'});  
            } 
    },false);
    
    
})(window);