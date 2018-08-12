$(function(){
    mb_change();
    st_add();
    
    $('#con > .wrap > div > div').css({"position" : "relative"});
    
    /*로그인*/
    $('body').on('click', '#con > p:nth-child(6) input[type="button"]', function(e){
        var userid = $(this).parents("p").find("input").eq(0).val();
        var pw = $(this).parents("p").find("input").eq(1).val();
        
        var id_r = ['ADMIN', 'USER1', 'USER2', 'USER3'];
        
        $.each(id_r, function(k, v){
            if(v == userid && pw == '1234'){
                localStorage['userid'] = v;
                alert('로그인이 완료되었습니다.');
                location.reload();
            }
        })
        
        if(!localStorage['userid']){
            alert('아이디 또는 비밀번호가 일치하지 않습니다.');
            return false;
        }
    })
    
    /*로그아웃*/
    $('body').on('click', '#con > p:nth-child(7) button:nth-child(1)', function(e){
        localStorage.clear();
        
        alert('로그아웃이 완료되었습니다.');
        location.reload();
    })
})

function st_add(){
    var st_r = ['blue', 'black', 'red'];
    var s_chk = false;
    
    /*스티커 생성*/
    $('body').on('click', '#con > p:nth-child(7)', function(e){
        if($('#con > .wrap .st-out').length != 0){
            alert('아직 부착되지 않은 스티커가 있습니다.');
            return false;
        }
        
        s_chk = s_chk == false ? true : false;
    })
    
    $('body').on('click', '#con > .wrap > div > div', function(e){
        if(s_chk){
            var x = e.pageX - $(this).offset().left - 10;
            var y = e.pageY - $(this).offset().top - 10;

            var rand = Math.floor(Math.random() * 3);
            
            /*선을 넘어가는지 체크*/
            if(x >= 0 && y < 170 && x <= 170 && y >= 0){
                var st = "<span class='st' style='width:20px; height:20px; background-color:"+st_r[rand]+"; position:absolute; left:"+x+"px; top:"+y+"px; border-radius:50%;'></span>";

                $(this).append(st);
                s_chk = false;
                return false;
            }
            
            drag();
        }
    })
    
    $('body').on('click', '#con > .wrap', function(e){
        if(s_chk){
            var x = e.pageX - $(this).offset().left - 10;
            var y = e.pageY - $(this).offset().top - 10;

            var rand = Math.floor(Math.random() * 3);

            var st = "<span class='st-out' style='width:20px; height:20px; background-color:"+st_r[rand]+"; position:absolute; left:"+x+"px; top:"+y+"px; border-radius:50%;'></span>";

            $('#con > .wrap').append(st);
            s_chk = false;
        }
        
        drag();
    })
}

function mb_change(){
    if(localStorage['userid']){
        $("#con > p:nth-child(6)").hide();
        $('#con > p:nth-child(7)').show();
        $('#con > p:nth-child(8)').hide();
        
        if(localStorage['userid'] == 'ADMIN'){
            $('#con > p:nth-child(8)').show();
        }
        
        var html = "<p>"+localStorage['userid']+" 님 반갑습니다.&nbsp;&nbsp; <button>로그아웃</button>&nbsp;&nbsp; <button>스티커 생성</button></p>";
        $('#con > p:nth-child(7)').html(html);
    } else {
        $("#con > p:nth-child(6)").show();
        $('#con > p:nth-child(7)').hide();
        $('#con > p:nth-child(8)').hide();
    }
}

function drag(){
    $("#con > .wrap > div > div > span").draggable();
}