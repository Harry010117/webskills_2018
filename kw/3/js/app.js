function Slider(obj){
    this.index          = 1;
    this.slideObj       = $(obj);
    this.init();
    this.start();
}

Slider.prototype.init = function(){
    this.timer          = null;
    this.slide          = true;
    this.slideObjLen    = this.slideObj.find("li").length;
    this.slideObj.css({
        "width" : this.slideObjLen * 100 + "%"
    });

    this.slideObj.find("li").css({
        "width" :  100 / this.slideObjLen + "%"
    }); 
}

Slider.prototype.start = function() {
    var $this   = this;
    this.timer  = setInterval(function(){
        $this.arrow("right");
    },3000);
};

Slider.prototype.arrow = function(type, num) {
    if(!this.slide) return false;
    var $this   = this;
    this.index  = type ? this.index : num;
    this.slide  = false;
    clearInterval(this.timer);

    if(type == "left"){
        if(this.index == 1){
            this.index = this.slideObjLen - 1;
            this.slideObj.css({
                "left" : (this.slideObjLen - 1) * -100 + "%"
            });
        }else{
            --this.index;
        }

    }else if(type == "right"){
        ++this.index;
    }

    var left = (this.index - 1) * -100;
    this.slideObj.stop().animate({
        "left" : left+"%",
    },400,function(){
        if($this.index == $this.slideObjLen){
            $this.slideObj.css({
                "left" : "0%"
            });
            $this.index = 1;
        }
        $this.slide = true;
        $this.start();
    });
};

Slider.prototype.append = function(obj){
    clearInterval(this.timer);
    this.init();
    this.start();
}

var App = {
    member : null,
    new_sticker : false,
    box_idx : null,
    slider_arr : [],

    init : function(){
        var view =  '<div class="btn hidden">'+
                    '    <input type="button" value="◀" class="prev"> &nbsp; <input type="button" value="▶" class="next">&nbsp;&nbsp;&nbsp;&nbsp;'+
                    '    <button class="down">다운로드</button>&nbsp;&nbsp;&nbsp;&nbsp;'+
                    '    <button class="main">메인페이지</button>'+
                    '</div>'+
                    '<a href="#" download="download.html" class="hidden" id="down"></a>'+
                    '<input type="file" id="upfile" class="hidden" multiple="multiple">';
        var style = '<style type="text/css">'+
                    '    .sticker { width: 20px; height: 20px; border-radius: 50%; position: absolute; z-index: 50; }'+
                    '    .hidden { display: none; }'+
                    '    button[disabled=disabled] { background: gray; cursor: default; }'+
                    '    input[disabled=disabled] { color: gray!important; cursor: default; }'+
                    '    .box { overflow: hidden; position: relative; }'+
                    '    .box > div { width: calc(100% - 20px); height: calc(100% - 20px); margin: 0 auto; margin-top: 10px; position: relative; z-index: 20; }'+
                    '    .box ul { position: absolute; z-index: 10; list-style: none; opacity: 0.7; }'+
                    '    .box li  { width: 188px; height: 100%; float: left; }'+
                    '    .box li img { width: 100%; height: 200px; }'+
                    '</style>';

        $('head').append($(style));
        $('.btn').after($(view));

        // 회원 등록 && 스티커 붙임판 고유번호
        $this.onDB('get', 'ADMIN', 'member', function(e){
            if (!e) {
                var data = {
                    id : 'ADMIN',
                    pw : '1234',
                }
                $this.onDB('write', data, 'member');

                for (var i = 1; i < 4; i++) {
                    var data = {
                        id : 'USER' + i,
                        pw : '1234',
                    }
                    $this.onDB('write', data, 'member');
                }

                var num = { idx : 0 }
                $('.wrap > div > div').filter(function(i){
                    $('select > option').eq(i).attr('value', num.idx);
                    $(this).addClass('box').attr('data-section', num.idx).append($('<ul></ul><div></div>'));
                    num.idx++;
                });

                $this.onDB('write', num, 'idx');
                $this.modeOn('save');
            }
        });

        // 페이지 유지
        $this.onDB('get', 1, 'content', function(e){
            if (e) {
                $('body').html(e.content);
                $('.sticker[data-section=""]').remove();
            }

            $this.eventOn();
            if ($('.box li').length > 2) {
                $this.modeOn('slide_start');
            }

            $('.box ul').filter(function(){
                if ($(this).find('li').length > 2) {
                    var idx = $(this).parent().attr('data-section');
                    $(this).css('left', '0%');
                    $this.slider_arr[idx] = new Slider($(this));
                }
            });

            if ($('.main:visible').length) {
                $('.wrap').prevAll().not('img').hide();
            }
        });
    },

    eventOn : function(){
        $(document).unbind();

        // 로그인
        $this.modeOn('login_chk');

        $(document).on('click', 'p > input:eq(2)', function(){
            $this.modeOn('login');
        });

        $(document).on('click', 'p > button:eq(0)', function(){
            $this.modeOn('logout');
        });

        // 스티커 생성
        $(document).on('click', 'p > button:eq(1)', function(){
            if ($('.sticker[data-section=""]').length) {
                alert("아직 부착되지 않은 스티커가 있습니다.");
                return false;
            }
            if (localStorage['userid'] == 'ADMIN') {
                return false;
            }
            $this.new_sticker = true;
            return false;
        });

        $(document).on('click', 'body, .box > div', function(e){
            if ($this.new_sticker) {
                var pos = {
                    left : e.pageX - 10,
                    top : e.pageY - 10,
                    section : $(this).parent().attr('data-section'),
                    in_left : e.offsetX,
                    in_top : e.offsetY,
                }
                $this.modeOn('sticker', pos);
            }
        });

        // 페이지 이동
        $(document).on('click', '.btn button:eq(0)', function(){
            if ($('.sticker[data-section=""]').length) {
                alert("아직 부착되지 않은 스티커가 있습니다.");
                return false;
            }
            $this.modeOn('view_page');
        });

        $(document).on('click', '.main', function(){
            $this.modeOn('main_page');
        });

        // 스티커 애니메이션
        $(document).on('click', '.btn input', function(){
            $this.modeOn('ani', $(this).attr('class'));
        });

        // 다운로드
        $(document).on('click', '.down', function(){
            $this.modeOn('down');
        });

        // 자회사 추가 && 삭제
        $(document).on('click', 'p > button:eq(2)', function(){
            $this.modeOn('add_box');
        });

        $(document).on('click', 'p > button:eq(3)', function(){
            $this.modeOn('del_box');
        });

        // 이미지 추가
        $(document).on('click', '.box', function(){
            if (localStorage['userid'] == 'ADMIN' && $('#con > h3:visible').length) {
                $this.box_idx = $(this).attr('data-section');
                $('#upfile').click();
            }
        });

        $(document).on('change', '#upfile', function(){
            $this.modeOn('add_img');
        });

        // 드래그 && 드롭(스티커 순서 정렬 && 부착여부)
        $('.sticker').draggable({
            cursorAt : { top : 10, left : 10},
            start : function(){
                if ($this.new_sticker || localStorage['userid'] != $(this).attr('data-id') || $(this).hasClass('view')) {
                    return false;
                }
                $(this).attr('data-section', '');
            },
            stop : function(e,ui){
                $('.wrap').append($(this));
                $this.modeOn('count');
            },
        });

        $('.box').droppable({
            tolerance : 'fit',
            drop : function(e,ui){
                var left = e.pageX - $(this).offset().left - 10;
                var top = e.pageY - $(this).offset().top - 10;
                ui.helper.attr({
                    'data-section' : $(this).data().section,
                    'data-left' : left,
                    'data-top' : top,
                });
            }
        });
    },

    modeOn : function(mode, option){
        switch(mode){
            case "login" : 
                var id = ['ADMIN', 'USER1', 'USER2', 'USER3'];
                
                var userid = $('#con > p:nth-child(6) input:nth-child(1)').val();
                var pw = $('#con > p:nth-child(6) input:nth-child(2)').val();
                
                $.each(id, function(k, v){
                    if(userid == v && pw == '1234'){
                        localStorage['userid'] = v;
                        alert("로그인이 완료되었습니다.");
                    }
                })
                
                if(!localStorage['userid']){
                    alert('아이디 또는 비밀번호가 일치하지 않습니다.');
                    return false;
                }
            break;

            case "logout" : 
                $('.sticker[data-section=""]').remove();
                alert("로그아웃 되었습니다.");
                localStorage.clear();
                $this.eventOn();
            break;

            case "login_chk" : 
                $('#con > p:eq(3), #con > p:eq(4), #con > p:eq(5)').hide();
                $('p > input:not(:eq(2))').val("");

                if (localStorage['userid']) {
                    $('#con > p:eq(4)').show();
                    $this.member = localStorage['userid'];

                    var info = $('#con > p:eq(4)').html();
                        info = localStorage['userid'] + info.slice(5);
                    $('#con > p:eq(4)').html(info);
                    localStorage['userid'] == 'ADMIN' ? $('#con > p:eq(5)').show() : "";
                }else{
                    $('#con > p:eq(3)').show();
                }
            break;

            case "sticker" : 
                var sticker = '<span class="sticker" data-section=""></span>';
                var color = ['blue', 'black', 'red'];
                var random = Math.ceil(Math.random()*3);
                var bg = color[random-1];
                var left = option.left - $('.wrap').offset().left;
                var top = option.top - $('.wrap').offset().top;

                $(sticker).css({
                    left : left,
                    top : top,
                    background : bg,
                }).attr({
                    'data-score' : random * 100,
                    'data-section' : option.section,
                    'data-id' : localStorage['userid'],
                    'data-left' : option.in_left,
                    'data-top' : option.in_top,
                }).appendTo($('.wrap'));

                $this.new_sticker = false;
                $this.eventOn();
                $this.modeOn('count');
            break;

            case "count" :
                var arr = [];
                $('.box').filter(function(){
                    var idx = $(this).attr('data-section');
                    arr[idx] = 0; 
                });
                $('.sticker:visible').filter(function(){
                    var idx = $(this).attr('data-section');
                    if(idx == "") return false;
                    arr[idx] += parseInt($(this).attr('data-score')); 
                });
                $('.box').filter(function(){
                    var idx = $(this).attr('data-section');
                    $(this).next().find('span').text(arr[idx].toLocaleString());
                });

                $this.modeOn('save');
            break;

            case "save" : 
                var data = {
                    no : 1,
                    content : $('body').html()
                }
                $this.onDB('write', data, 'content');
            break;

            case "view_page" : 
                $('.wrap').prevAll().not('img').hide();
                $('.btn').hide().last().show();
                $('.sticker').hide();
                $('.show').addClass('view').show();

                $this.modeOn('ani');
            break;

            case "main_page" : 
                $('.wrap').prevAll().not('img').show();
                $('.btn').hide().first().show()
                $('.sticker').show().removeClass('view');

                $this.eventOn();
                $this.modeOn('count');
            break;

            case "ani" : 
                if (option == 'prev') {
                    $('.show').last().hide().removeClass('show view');
                }else if(option == 'next') {
                    $('.sticker:hidden').first().show().addClass('show view');
                }

                var show = $('.show').length;
                var sticker = $('.sticker').length;
                if (show == 0 && sticker == 0) {
                    $('.prev').attr('disabled', 'disabled');
                    $('.next').attr('disabled', 'disabled');
                    $('.down').attr('disabled', 'disabled');
                }else if (show == 0) {
                    $('.prev').attr('disabled', 'disabled');
                    $('.next').removeAttr('disabled', 'disabled');
                    $('.down').attr('disabled', 'disabled');
                }else if (show != sticker) {
                    $('.prev').removeAttr('disabled', 'disabled');
                    $('.next').removeAttr('disabled', 'disabled');
                    $('.down').attr('disabled', 'disabled');
                }else {
                    $('.prev').removeAttr('disabled', 'disabled');
                    $('.next').attr('disabled', 'disabled');
                    $('.down').removeAttr('disabled', 'disabled');
                }

                $this.modeOn('count');
            break;

            case "add_box" : 
                var name = $.trim($('p > input:eq(3)').val());
                if (!name) {
                    alert('등록할 회사명을 입력해주세요.')
                    return false;
                }

                var cp =    '<div>'+
                            '    <p>A 사</p>'+
                            '    <div class="box"><ul></ul><div></div></div>'+
                            '    <p>점수 : <span>0</span> 점</p>'+
                            '</div>';

                $this.onDB('get', 1, 'idx', function(e){
                    var opt = '<option value="' + e.idx + '">' + name + ' 사</option>';
                    $('select').append($(opt));
                    $(cp).find('p:eq(0)').text(name + " 사").end().find('.box').attr('data-section', e.idx).end().appendTo($('.wrap'));

                    e.idx++;
                    $this.onDB('write', e, 'idx');
                    $this.eventOn();
                    $this.modeOn('position');
                });
            break;

            case "del_box" : 
                var idx = $('select').val();
                $('.sticker[data-section='+idx+']').remove();
                $('.box[data-section='+idx+']').parent().remove();
                $('option[value='+idx+']').remove();

                $this.modeOn('position');
            break;

            case "position" : 
                $('.sticker').filter(function(){
                    var idx = $(this).attr('data-section');
                    var left = $('.box[data-section='+idx+']')[0].offsetLeft + parseInt($(this).attr('data-left'));
                    var top = $('.box[data-section='+idx+']')[0].offsetTop + parseInt($(this).attr('data-top'));
                    $(this).css({
                        left : left,
                        top : top,
                    });
                });
                $this.modeOn('save');
            break;

            case "add_img" :
                var obj = $('#upfile')[0].files;
                var tempData    = [];
                var count       = 1;
                var imgLen      = obj.length

                $(obj).filter(function(i,e){
                    var img = new Image();
                    var blob = new Blob([e], {type : 'application/octet-binary'});
                    var url = URL.createObjectURL(blob);
                    img.src = url;
                    img.onload = function(){
                        var canvas = $('<canvas width="190" height="200"></canvas>')[0];
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        tempData[i] = canvas.toDataURL();
                        imgChk();
                    }
                    var imgChk = function(){
                        if (count == imgLen) {
                            data();
                        }
                        count++;
                    }
                });

                var data = function(){
                    $.each(tempData, function(i,e){
                        var box = $('.box[data-section='+$this.box_idx+']');
                        var list = $('<li><img src="'+e+'" alt="" /></li>');
                        if (box.find('li').length == 0) {
                            box.find('ul').append(list).append(list.clone());
                        }else{
                            box.find('li').last().before(list);
                            if ($this.slider_arr[$this.box_idx]) {
                                $this.slider_arr[$this.box_idx].append($this.slider_arr[$this.box_idx]);
                            }else{
                                $this.slider_arr[$this.box_idx] = new Slider($(box).find('ul'));
                            }
                        }
                        $this.modeOn('save');
                    });
                }
            break;

            case "down" : 
                var text = '';
                $.ajax({
                    type : 'post',
                    dataType : 'text',
                    url : './jquery/jquery-1.12.3.min.js',
                    cache : false,
                    async : false,
                    success : function(data){
                        text += '<script>';
                        text += data
                        text += '<\/script>';
                    }
                });

                $.ajax({
                    type : 'post',
                    dataType : 'text',
                    url : './css/style.css',
                    cache : false,
                    async : false,
                    success : function(data){
                        text += '<style>';
                        text += data
                        text += '<\/style>';
                    }
                });

'                text += <script type="text/javascript">'+
                            'function Slider(obj){'+
                                'this.index          = 1;'+
                                'this.slideObj       = $(obj);'+
                                'this.init();'+
                                'this.start();'+
                            '}'+
                            'Slider.prototype.init = function(){'+
                                'this.timer          = null;'+
                                'this.slide          = true;'+
                                'this.slideObjLen    = this.slideObj.find("li").length;'+
                                'this.slideObj.css({'+
                                    '"width" : this.slideObjLen * 100 + "%"'+
                                '});'+
                                'this.slideObj.find("li").css({'+
                                    '"width" :  100 / this.slideObjLen + "%"'+
                                '}); '+
                            '};'+
                            'Slider.prototype.start = function() {'+
                                'var $this   = this;'+
                                'this.timer  = setInterval(function(){'+
                                    '$this.arrow("right");'+
                                '},3000);'+
                            '};'+
                            'Slider.prototype.arrow = function(type, num) {'+
                                'if(!this.slide) {return false;}'+
                                'var $this   = this;'+
                                'this.index  = type ? this.index : num;'+
                                'this.slide  = false;'+
                                'clearInterval(this.timer);'+
                                'if(type == "left"){'+
                                    'if(this.index == 1){'+
                                        'this.index = this.slideObjLen - 1;'+
                                        'this.slideObj.css({'+
                                            'left : (this.slideObjLen - 1) * -100 + "%"'+
                                        '});'+
                                    '}else{'+
                                        '--this.index;'+
                                    '}'+
                                '}else if(type == "right"){'+
                                    '++this.index;'+
                                '}'+
                                'var left = (this.index - 1) * -100;'+
                                'this.slideObj.stop().animate({'+
                                    '"left" : left+"%"'+
                                '},400,function(){'+
                                    'if($this.index == $this.slideObjLen){'+
                                        '$this.slideObj.css({'+
                                            '"left" : "0%"'+
                                        '});'+
                                        '$this.index = 1;'+
                                    '}'+
                                    '$this.slide = true;'+
                                    '$this.start();'+
                                '});'+
                            '};'+
                            '$(function(){'+
                                '$(".box ul").filter(function(){'+
                                    'if ($(this).find("li").length > 2) {'+
                                        '$(this).css("left", "0%");'+
                                        'new Slider($(this));'+
                                    '}'+
                                '});'+
                                '$(".sticker").hide();'+
                                'count();'+
                                'var timer = setInterval(function(){'+
                                    'if ($(".sticker:hidden").length == 0) {'+
                                        'clearInterval(timer);'+
                                        'return false;'+
                                    '};'+
                                    '$(".sticker:hidden").eq(0).show();'+
                                    'count();'+
                                '}, 1000);'+
                            '});'+
                            'function count(){'+
                                'var arr = [];'+
                                '$(".box").filter(function(){'+
                                    'var idx = $(this).attr("data-section");'+
                                    'arr[idx] = 0; '+
                                '});'+
                                '$(".sticker:visible").filter(function(){'+
                                    'var idx = $(this).attr("data-section");'+
                                    'arr[idx] += parseInt($(this).attr("data-score")); '+
                                '});'+
                                '$(".box").filter(function(){'+
                                    'var idx = $(this).attr("data-section");'+
                                    '$(this).next().find("span").text(arr[idx].toLocaleString());'+
                                '});'+
                            '}'+
                        '<\/script>';

                var doctype = '<!doctype html>';
                var content = $('html').clone();
                content.find('script, link, h3, #con>img, #con>p:not(:last-child), a, .btn, #upfile').remove().end().find('head').append($(text));

                var code = doctype + content[0].outerHTML;
                var file = new Blob([code], {type : 'text/html'});
                $('#down').attr({
                    'href' : URL.createObjectURL(file),
                })[0].click();
            break;
        }
    },

    onDB : function(mode, value, table, callback){
        var request = indexedDB.open('survey', 1);
        request.onupgradeneeded = function(){
            this.result.createObjectStore('member', {keyPath : 'id', autoIncrement : false});
            this.result.createObjectStore('content', {keyPath : 'no', autoIncrement : true});
            this.result.createObjectStore('idx', {keyPath : 'no', autoIncrement : true});
        }
        request.onsuccess = function(){
            var TX = this.result.transaction([table], 'readwrite').objectStore(table);
            action(mode, value, callback, TX);
        }

        function action(mode, value, callback, TX){
            switch(mode){
                case "write" : 
                    OK = TX.put(value);
                break;
                case "delete" : 
                    OK = TX.delete(value);
                break;
                case "get" : 
                    OK = TX.get(value);
                break;
                case "read" : 
                    OK = TX.openCursor();
                break;
            }
            var arr = [];
            OK.onsuccess = function(){
                var data = this.result;
                if (mode == 'read') {
                    if (data) {
                        arr.push(data.value);
                        data.continue();
                    }else{
                        data = arr;
                        callback(data);
                    }
                    return false;
                }
                if (callback) {callback(data)}
            }
        }
    }
}

var $this = App;

$(function(){
    $this.init();
});



//$(function(){
//    mb_change();
//    st_add();
//    
//    $('#con > .wrap > div > div').css({"position" : "relative"});
//    
//    /*로그인*/
//    $('body').on('click', '#con > p:nth-child(6) input[type="button"]', function(e){
//        var userid = $(this).parents("p").find("input").eq(0).val();
//        var pw = $(this).parents("p").find("input").eq(1).val();
//        
//        var id_r = ['ADMIN', 'USER1', 'USER2', 'USER3'];
//        
//        $.each(id_r, function(k, v){
//            if(v == userid && pw == '1234'){
//                localStorage['userid'] = v;
//                alert('로그인이 완료되었습니다.');
//                location.reload();
//            }
//        })
//        
//        if(!localStorage['userid']){
//            alert('아이디 또는 비밀번호가 일치하지 않습니다.');
//            return false;
//        }
//    })
//    
//    /*로그아웃*/
//    $('body').on('click', '#con > p:nth-child(7) button:nth-child(1)', function(e){
//        localStorage.clear();
//        
//        alert('로그아웃이 완료되었습니다.');
//        location.reload();
//    })
//})
//
//function st_add(){
//    var st_r = ['blue', 'black', 'red'];
//    var s_chk = false;
//    
//    /*스티커 생성*/
//    $('body').on('click', '#con > p:nth-child(7)', function(e){
//        if($('#con > .wrap .st-out').length != 0){
//            alert('아직 부착되지 않은 스티커가 있습니다.');
//            return false;
//        }
//        
//        s_chk = s_chk == false ? true : false;
//    })
//    
//    $('body').on('click', '#con > .wrap > div > div', function(e){
//        if(s_chk){
//            var x = e.pageX - $(this).offset().left - 10;
//            var y = e.pageY - $(this).offset().top - 10;
//
//            var rand = Math.floor(Math.random() * 3);
//            
//            /*선을 넘어가는지 체크*/
//            if(x >= 0 && y < 170 && x <= 170 && y >= 0){
//                var st = "<span class='st' style='width:20px; height:20px; background-color:"+st_r[rand]+"; position:absolute; left:"+x+"px; top:"+y+"px; border-radius:50%;'></span>";
//
//                $(this).append(st);
//                s_chk = false;
//                return false;
//            }
//            
//            drag();
//        }
//    })
//    
//    $('body').on('click', '#con > .wrap', function(e){
//        if(s_chk){
//            var x = e.pageX - $(this).offset().left - 10;
//            var y = e.pageY - $(this).offset().top - 10;
//
//            var rand = Math.floor(Math.random() * 3);
//
//            var st = "<span class='st-out' style='width:20px; height:20px; background-color:"+st_r[rand]+"; position:absolute; left:"+x+"px; top:"+y+"px; border-radius:50%;'></span>";
//
//            $('#con > .wrap').append(st);
//            s_chk = false;
//        }
//        
//        drag();
//    })
//}
//
//function mb_change(){
//    if(localStorage['userid']){
//        $("#con > p:nth-child(6)").hide();
//        $('#con > p:nth-child(7)').show();
//        $('#con > p:nth-child(8)').hide();
//        
//        if(localStorage['userid'] == 'ADMIN'){
//            $('#con > p:nth-child(8)').show();
//        }
//        
//        var html = "<p>"+localStorage['userid']+" 님 반갑습니다.&nbsp;&nbsp; <button>로그아웃</button>&nbsp;&nbsp; <button>스티커 생성</button></p>";
//        $('#con > p:nth-child(7)').html(html);
//    } else {
//        $("#con > p:nth-child(6)").show();
//        $('#con > p:nth-child(7)').hide();
//        $('#con > p:nth-child(8)').hide();
//    }
//}
//
//function drag(){
//    $("#con > .wrap > div > div > span").draggable();
//}