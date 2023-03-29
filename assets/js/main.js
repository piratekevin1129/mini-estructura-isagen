var i = 0;
var j = 0;
var k = 0;

var ismobile = isMobileDevice()
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

function createMenu(){
    var raya = document.createElement('div')
    raya.className = 'menu_rayita'
    var raya_h = ((data_content.length)*45)
    raya.style.height = ((raya_h-20)-20)+'px'
    
    document.getElementById('menu').appendChild(raya)

    for(i = 0;i<data_content.length;i++){
        var div = document.createElement('div')
        div.className = 'menu_item menu_item_available'
        div.id = 'menu_item_'+i

        var h = ''
        h+='<section class="menu_item_leyend">'+data_content[i].title+'</section>'
        h+='<div class="menu_item_icon" onmouseenter="overMenuBtn(this)" onmouseleave="outMenuBtn(this)" onclick="clickItem('+i+')">'
            h+='<div class="menu_item_border"></div>'
            if(data_content[i].type=='video'){
                h+='<img src="assets/img/icon_tres.svg" />'
            }else if(data_content[i].type=='content'){
                h+='<img src="assets/img/icon_dos.svg" />'
            }
        h+='</div>'
        
        div.innerHTML = h
        
        document.getElementById('menu').appendChild(div)
    }

    //botón responsive
    var btn_responsive = document.createElement('div')
    btn_responsive.setAttribute('id','menu_btn_responsive')
    btn_responsive.setAttribute('class','menu_btn_responsive_closed')
    btn_responsive.setAttribute('onclick','clickToggleMenu(this)')
    btn_responsive.setAttribute('status','closed')
    btn_responsive.innerHTML = '<div class="menu_btn_responsive_icon"><div class="menu_btn_responsive_border"></div><img src="assets/img/icon_menu.svg" /></div>'
    document.getElementById('menu').appendChild(btn_responsive)
}

function overMenuBtn(btn){
    if(!ismobile){
        var item = btn.parentNode
        var legend = item.getElementsByTagName('section')[0]
        legend.className = 'menu_item_leyend_over'
        audio_over.play()
    }
}
function outMenuBtn(btn){
    if(!ismobile){
        var item = btn.parentNode
        var legend = item.getElementsByTagName('section')[0]
        legend.className = 'menu_item_leyend'
    }
}

function clickToggleMenu(btn){
    if(btn.getAttribute('status')=='closed'){
        document.getElementById('menu_btn_responsive').className = 'menu_btn_responsive_opened'
        document.getElementById('menu').className = 'menu_opened'
        btn.setAttribute('status','opened')
    }else{
        document.getElementById('menu_btn_responsive').className = 'menu_btn_responsive_closed'
        document.getElementById('menu').className = 'menu_closed'
        btn.setAttribute('status','closed')
    }
}

function clickItem(ind){//ind de index
    //validamos que no este el cargador puesto porque si no se arma un mierdero
    if(!animating_cargador){
        if(actual_content_data.type=='video'){
            funcionEndVideo(false)
        }

        setCargador(
            function(){
                console.log(i_frame)
                document.getElementById('content').removeChild(i_frame)
                i_frame = null
                document.getElementById('menu_item_'+actual_content).classList.remove('menu_item_available_active')
            },
            function(){
                actual_content = ind
                renderView()
            }
        )
    }
}

//////////////////////////////////
var i_frame = null
var actual_content = 0
var player = null
var actual_content_data = null
var path = ''
var instrucciones_modal = false

function closeInstrucciones(){
    document.getElementById('instrucciones').className = 'instrucciones-off'
    instrucciones_modal = true
    if(player!=null){
        player.play().then(function(){
            player.setVolume(1);
            console.log("reproducción automatica!")
        })
    }
}

function renderView(){
    animating_cargador = true
    actual_content_data = data_content[actual_content]

    document.getElementById('menu_item_'+actual_content).classList.add('menu_item_available_active')
    
    i_frame = document.createElement('iframe')
    i_frame.setAttribute('class','i_frame')
    i_frame.setAttribute('id','mi_frame')
    i_frame.setAttribute('scrolling','no')
    i_frame.setAttribute('border','0')
    
    document.getElementById('content').appendChild(i_frame)

    if(actual_content_data.type=='video'){
        i_frame.setAttribute("allow","autoplay")
        if(!instrucciones_modal){
            path = 'https://player.vimeo.com/video/'+actual_content_data.id
        }else{
            path = 'https://player.vimeo.com/video/'+actual_content_data.id+'?autoplay=1&muted=1'
        }

        i_frame.setAttribute('src',path)        
        $('#mi_frame').on('load', funcionLoadIframe);

    }else if(actual_content_data.type=='content'){
        path = 'anims/'+actual_content_data.src+'/index.html'

        i_frame.setAttribute('src',path)
        $('#mi_frame').on('load', funcionLoadIframe);
        
    }
}

function funcionLoadIframe(){
    if(actual_content_data.type=='video'){
        player = new Vimeo.Player($('#mi_frame'));

        if(!instrucciones_modal){
            document.getElementById('instrucciones').className = 'instrucciones-on'    
            console.log("cargó nuevo video")
        }else{
            player.play().then(function(){
                player.setVolume(1);
                console.log("reproducción automatica!")
            })
        }

        player.on('ended', funcionEndVideo);
    
        $('#i__frame').off('load', funcionLoadIframe)
    }else if(actual_content_data.type=='content'){
        
    }

    animating_cargador = false
}

function funcionEndVideo (next){
    //console.log("-data.percent1: "+data.percent)
    //Manually set the data to 100
    player.off('ended', funcionEndVideo)
    player.unload();
    player = null

    if(next!==false){
        console.log(actual_content_data.next)
        if(actual_content_data.next){
            nextContent()
        }
    }else{
        //esta función se esta llamando para quitar eventos del video, pero no se desea que pase al siguiente contenido
    }
}

function nextContent(){
    //remover iframe
    setCargador(
        function(){
            document.getElementById('content').removeChild(i_frame)
            i_frame = null
            document.getElementById('menu_item_'+actual_content).classList.remove('menu_item_available_active')
        },
        function(){
            actual_content++
            if(actual_content==data_content.length){
                //finalizar actividad
                finish()
            }else{
                renderView()
            }
        }
    )
}

function pasarSiguienteContenido(){//funcion que se ejecuta desde las interactivas
    nextContent()
}

///////////////CARGADOR////////////////
var animation_cargador = null
var animating_cargador = false
function setCargador(preLoad,callBack){
    //animating_cargador = true
    //document.getElementById('cargador').className = 'cargador-on'
    //animation_cargador = setTimeout(function(){
        //clearTimeout(animation_cargador)
        //animation_cargador = null

        preLoad()
        //document.getElementById('cargador').className = 'cargador-off'
        //animation_cargador = setTimeout(function(){
            //clearTimeout(animation_cargador)
            //animation_cargador = null

            callBack()
            //document.getElementById('cargador').className = 'cargador-offf'
            //animating_cargador = false
        //},500)
    //},1000)
}

function finish(){
    window.top.postMessage({completado:true, nextContent:true},"*");
}