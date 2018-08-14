// common.js
var db = '';
var type = '';
var order = '';

$(function(){
	var openDB = indexedDB.open("20180812", 6);

	openDB.onupgradeneeded = function(e){
		var thisDB = e.target.result;

		if(!thisDB.objectStoreNames.contains('list')){
			thisDB.createObjectStore('list', {autoIncrement : true});
		}

		if(!thisDB.objectStoreNames.contains('member')){
			thisDB.createObjectStore('member', { keyPath : 'id'});
		}

		if(!thisDB.objectStoreNames.contains('comment')){
			thisDB.createObjectStore('comment', {autoIncrement : true});
		}
	}

	openDB.onsuccess = function(e){
		db = e.target.result;

		dbController('add', {store: 'member', data: { id: 'admin', pw: '1234!', name: '관리자', phone: '010-4321-4321', profile: 0, date: new Date(), image: '' }})
		
		getList('');

		mbChange();
	}


	// login
	$(document).on('click', '.login_btn', function(e){
		$(".bg").css({'z-index':'1','opacity':'1'});
		$(".login").show();

		$(document).on('click', '.bg span', function(e){
			$(".bg").css({'z-index':'-1','opacity':'0'});
			$(".login").hide();
		});
	});

	// join
	$(document).on('click', '.join_btn', function(e){
		$(".bg").css({'z-index':'1','opacity':'1'});
		$(".join").show();

		$(document).on('click', '.bg span', function(e){
			$(".bg").css({'z-index':'-1','opacity':'0'});
			$(".join").hide();
		});
	});

	// upload
	$(document).on('click', '.upload_btn', function(e){
		$(".bg").css({'z-index':'1','opacity':'1'});
		$(".upload").show();

		$(document).on('click', '.bg span', function(e){
			$(".bg").css({'z-index':'-1','opacity':'0'});
			$(".upload").hide();
		});
	});

	// Event
	$(document).on('click', '.join button', function(e){
		id = $('.jo_co #id').val();
		pw = $('.jo_co #pw').val();
		pw_c = $('.jo_co #pw_chk').val();
		name = $('.jo_co #nickname').val();
		phone = $('.jo_co #phone').val();
		profile = $('.jo_co #profile').val();

		if(id == '' || pw == '' || name == ''){
			alert('필수 입력 항목이 누락되었습니다.');
			return false;
		}

		pw_chk = /[!@#$%?^&*]/;

		if(!pw_chk.test(pw)){
			alert('비밀번호는 특수문자가 한 개 이상 포함되어야 합니다.');
			return false;
		}

		if(pw != pw_c){
			alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
			return false
		}

		dbController('get', { store : 'member', get_k : id }, function(idChk){
			if(!idChk){
				dbController('add', { store : 'member', data : {id : id,  pw : pw, name : name, phone : phone, date : new Date(), image : '', profile : profile }, msg : '회원가입이 완료되었습니다.' } );
				$('.bg span').click()
			} else {
				alert('아이디가 이미 존재합니다.');
				return false
			}
		});
	})
	.on('click', '.login button', function(e){
		id = $('.login #id').val();
		pw = $('.login #pw').val();

		if(!id.length || !pw.length){
			alert('누락 항목이 존재합니다.');
			return false;
		}

		dbController('get', { store: 'member', get_k: id}, function(data){
			if(data && data.pw == pw){
				alert('로그인이 완료되었습니다.');
				sessionStorage['id'] = data.id;
				sessionStorage['name'] = data.name;
				mbChange();
				return false;
			} else {
				alert('아이디 또는 비밀번호가 일치하지 않습니다.');
				return false;
			}
		});
	})
	.on('click', '.logout', function(e){
		sessionStorage.clear();
		alert('로그아웃이 완료되었습니다.')
		mbChange()
	})
	.on('change', '.upload input[type="file"]', function(e){
		var files = e.target.files[0];

		f_upload(files, 'upload');
	})
	.on('click', '.upload button', function(e){
		image = $(this).attr('data-image');
		info = $("#upload_intro").val();
		type = $("#upload_type").val();

		if(!image){
			alert('이미지를 업로드 해주세요.');
			return false;
		}

		dbController('add', {store: 'list', data: { info: info, image: image, type: type, mbid: sessionStorage['id'], date: new Date(), like: '' }, msg: '업로드가 완료되었습니다.' })
		$('.bg span').click()
	})
	.on('click', '.gallery_like', function(e){
		var ts = $(this)
		var l_idx = Number($(this).parents(".g-pt").attr('data-idx'))
		var like = Number($(this).attr('data-like'))
		var like_chk = $(this).hasClass('like_chk')

		if(!sessionStorage['id']){
			alert('회원만 이용 가능합니다.')
			return false
		}

		dbController('get', { store: 'list', get_k: l_idx }, function(data){
			var like_r = data.like.split("/").filter(String)
			var in_like = $.inArray(sessionStorage['userid'], like_r)
			var up_data = data
				
			$(ts).toggleClass('like_chk')

			if(like_chk){
				$(ts).attr('data-like', like - 1)
				$(ts).html(`<i class="fa fa-star"></i> ${like - 1}`)
				
				like_r.splice(in_like, 1)
				up_data.like = like_r.join('/')+"/"
				dbController('update', { store: 'list', data: up_data, get_k: l_idx })
			} else {
				$(ts).attr('data-like', like + 1)
				$(ts).html(`<i class="fa fa-star"></i> ${like + 1}`)
				up_data.like = up_data.like+sessionStorage['id']+'/'
				dbController('update', { store: 'list', data: up_data, get_k: l_idx})
			}			
		})
	})
	.on('click', '.comment_button', function(e){
		var l_idx = $(this).parents('.g-pt').attr('data-idx')
		var text = $(this).parents('.g-pt').find('.comment_input').val();

		if(!sessionStorage['id']){
			alert('회원만 이용 가능합니다.')
			return false
		}

		dbController('add', { store: 'comment', data: { list_key: l_idx, name: sessionStorage['name'], text: text, date: new Date() } })
		alert('댓글이 작성되었습니다.')
		getList('')
	})
	.on('click', '.categories > ul:nth-child(4) li', function(e){
		var cate = $(this).text();

		type = cate

		getList('')
	})
	.on('click', '.categories > ul:nth-child(2) li', function(e){
		var index = $(this).index()

		order = index

		getList('')
	})
	.on('click', '.profile-btn', function(e){
		showLayout('profile')
	})
	.on('click', '.modify_btn', function(e){
		id = $('.profile .id').val();
		name = $('.profile .name').val();
		phone = $('.profile .phone').val();
		profile_chk = $('.profile .profile_chk').val();
		image = $(this).attr('data-image')

		dbController('get', { store: 'member', get_k: sessionStorage['id'] }, function(data){
			var update_obj = {
				id: id,
				pw: data.pw,
				name: name,
				phone: phone,
				date: data.date,
				profile: profile_chk
			}

			update_obj.image = image ? image : data.image

			dbController('delete', { store: 'member', get_k: sessionStorage['id'] } )
			dbController('add', { store: 'member', data: update_obj })
			sessionStorage['id'] = id
			sessionStorage['name'] = name
			mbChange()
			$('.profile-btn').click()
			alert('프로필이 수정되었습니다.')
			return false
		})
	})
	.on('change', '.profile .modify-image', function(e){
		var files = e.target.files[0]

		f_upload(files, 'profile')
	})
	.on('click', '.admin1, .admin2', function(e){
		var cls = $(this).attr('class')

		showLayout(cls)
	})
	.on('click', '.mbremove-btn', function(e){
		id = $(this).attr('data-id')

		$(this).parents('tr').remove()

		dbController('delete', { store: 'member', get_k: id })
		dbController('cursor', { store: 'list' }, function(data){
			$.each(data, function(k, v){
				if(v.mbid == id) dbController('delete', { store: 'list', get_k: Number(v.key) })
			})
		})
	})
	.on('click', '.gallery_delete', function(e){
		var idx = $(this).parents('.g-pt').attr('data-idx')

		dbController('delete', { store: 'list', get_k: Number(idx) })
		alert('게시글이 삭제되었습니다.')
		getList('')
	})
	.on('click', '.gallery_img', function(e){
		var mbid = $(this).attr('data-mbid')

		getList(mbid, function(id){
			dbController('get', { store: 'member', get_k: id }, function(mb){
				var html = ''

				html += `<!-- 프로필 -->`
					html += `<div class="profile">`
						html += `<ul>`
							html += `<li>`
								html += `<img src="${mb.image == '' ? 'images/basic.jpg' : mb.image}" alt="img" class="profile_img"  >`
								html += `<span class="profile_name">${mb.name}</span>`
							html += `</li>`
							html += `<li>`
								html += `<div class="profile_left">`
									html += `닉네임`
								html += `</div>`
								html += `<div class="profile_right">`
				                    html += `<input type="text" value="${mb.name}" class="name" readonly>`
								html += `</div>`
							html += `</li>`
							html += `<li>`
								html += `<div class="profile_left">`
									html += `전화번호`
								html += `</div>`
								html += `<div class="profile_right">`
				                	html += `<input type="text" value="${mb.phone}" class="phone" readonly>`
								html += `</div>`
							html += `</li>`
						html += `</ul>`
					html += `</div>`

					$('.feeds').append(html)
				})
		})
	})


	$(window).on('scroll', function(e){
		var s_bot = $(this).scrollTop() + $(window).height()
		var cnt = 0

		if(s_bot == $(document).height()){
			$.each($('.g-pt'), function(k, el){
				if($(el).css('display') == 'none' && cnt < 5){
					$(el).show()

					cnt++
				}
			})
		}
	})

});

// data / total * 최대값

function pieChart(){
	var cvs = $('#pie_chart')[0]
	var ctx = cvs.getContext('2d')

	var w = cvs.width
	var h = cvs.height
	var x = w / 2
	var y = h / 2

	var type_r = ['기타', '풍경', '인물']
	var color_r = ['#0d5997', '#308cd9', '#7dc1fa']
	var angle = 0

	dbController('getAll', { store: 'list' }, function(data){
		var cnt_r = [ 0, 0, 0 ]
		var total = 0
		
		$.each(data, function(k, v){
			var type_idx = $.inArray(v.type, type_r)

			cnt_r[type_idx] += 1
		})

		$.each(cnt_r, function(k, v){
			total += v
		})

		$.each(cnt_r, function(k, v){
			ctx.beginPath()
			ctx.fillStyle = color_r[k]
			ctx.moveTo(x, y)
			ctx.arc(x, y, y-75, (angle / total * 2) * Math.PI, ((angle + v) / total * 2) * Math.PI)
			ctx.fill()
			if(v > 0){
				ctx.rect(250 + (k * 100), h - 30, 10, 10)
				ctx.fill()
				ctx.font = '12px sans-serif'
				ctx.fillText(type_r[k], 250 + 20 + (k * 100), h - 20)
			}

			angle += v
		})
	})
}

function getList(id, callback){
	dbController('cursor', { store: 'list' }, function(data){
		$('.feeds > div').remove();

		type = $.trim(type)

		if(data){
			switch(order){
				case 0 :
					data = data.sort(function (a, b) {
						var aTime = a.date.getTime()
						var bTime = b.date.getTime()

						return bTime - aTime
					})
				break
				case 1 :
					data = data.sort(function (a, b) {
						var alike = a.like.split('/').filter(String)
						var blike = b.like.split('/').filter(String)

						var a_likelen = alike.length
						var b_likelen = blike.length

						return b_likelen - a_likelen
					})
				break
			}
			var cnt = 0
			$.each(data, function(k, v){
					var html = '';
					var list_type = v.type;
					var list_key = v.key
					var list_like = v.like
					var list_id = v.mbid
					dbController('get', { store: 'member', get_k: v.mbid }, function(mb){
						select_type = type == '' ? list_type : type
						var like_r = list_like.split("/").filter(String)
						var like_cnt = like_r.length;
						var m_likechk = $.inArray(sessionStorage['id'], like_r) == -1 ? '' : 'like_chk';

						if(id == '' ? (list_type == select_type && mb.id != sessionStorage['id']) : (id == list_id)){
							html += `<div class="g-pt" data-idx="${list_key}" ${cnt >= 5 ? 'style="display:none;"' : ''} >`
								html += `<div class="gallery">`
									html += `<img src="${mb.image == '' ? 'images/basic.jpg' : mb.image}" alt="img" class="gallery_img" data-mbid="${v.mbid}">`
									html += `<span class="gallery_name">${mb.name}</span>`
									html += `<span class="gallery_like ${m_likechk}" data-like="${like_cnt}" ><i class="fa fa-star"></i> ${like_cnt}</span>`
									html += `<hr>`
									html += `<p class="gallery_text">${v.info}</p>`
									html += `<a href="${v.image}" download><img src="${v.image}" alt="img" class="gallery_main"></a>`
									html += `<hr>`
								html += `</div>`
								if(sessionStorage['id']){
								html += `<div>`
									if(sessionStorage['id'] == 'admin'){
									html += `<!-- 게시물 삭제 -->`
									html += `<button class="gallery_delete">게시물 삭제</button>`
									}
									html += `<span class="comment">댓글</span>`
									html += `<span class="comment_name">${sessionStorage['name']}</span>`
									html += `<input type="text" placeholder="댓글을 입력하세요." class="comment_input">`
									html += `<button class="comment_button">댓글 등록</button>`
									html += `<ul class="comment_ul">`
									dbController('cursor', { store: 'comment' }, function(data){
										$.each(data, function(k2, c){
											if(c.list_key == list_key){
											html += `<li>`
												html += `<span class="comment_name">${c.name}</span>`
												html += `<span class="comment_text">${c.text}</span>`
											html += `</li>`
											}
										})
											html += `</ul>`
										html += `</div>`
									html += `</div>`

									$('.feeds').append(html);
									cnt++
									})

								}

						}
					})

				if(k == data.length-1 && id != '') {
					callback(id)
				}
			})
		}

		// 로그인 유무에 따라 변경
	})
}

function f_upload(files, type){
	var reader = new FileReader();

	reader.readAsDataURL(files);
	reader.onload = function(e){
		var file = e.target.result;

		var image = new Image();
		image.src = file;
		image.onload = function(e){
			if(type == 'upload'){
				$('.upload button').attr('data-image', file)
			} else if(type == 'profile') {
				$('.profile button').attr('data-image', file)

				$('.profile .profile_left .profile_img').attr('src', file)
			}
		}
	}
}

function mbChange(){
	dbController('get', { store: 'member', get_k: !sessionStorage['id'] ? '' : sessionStorage['id']}, function(data){
		$('.upload_btn').hide();

		var html = '';
		if(sessionStorage['id']){
			$('.upload_btn').show();

			html+= `<div>`
				html+= `<img src="${data.image == '' ? 'images/basic.jpg' : data.image}" alt="img" class="member_img">`
				html+= `<span class="member_name">${sessionStorage['name']}</span>`
				html+= `<button class="profile-btn"><h2>프로필</h2></button>`

			if(sessionStorage['id'] == 'admin'){
				$('.upload_btn').hide();
				html+= `<!-- 관리자 -->`
				html+= `<button class="admin2"><h2>회원 관리</h2></button>`
				html+= `<button class="admin1"><h2>사이트 정보</h2></button>`
			}
			html+= `<button class="logout"><h2>로그아웃</h2></button>`

			html+= `</div>`
		} else {
			html+= `<div>`
				html+= `<button class="login_btn"><h2>로그인</h2></button>`
				html+= `<button class="join_btn"><h2>회원가입</h2></button>`
			html+= `</div>`
		}

		$('.header .membership').html(html);
	})

	getList('')
	$('.bg span').click();
}

function showLayout(type){
	var html = "";

	switch(type){
		case 'profile' :
			dbController('get', { store: 'member', get_k: sessionStorage['id'] }, function(mb){
				html += `<!-- 프로필 -->`
					html += `<div class="profile">`
						html += `<ul>`
							html += `<li>`
								html += `<img src="${mb.image == '' ? 'images/basic.jpg' : mb.image}" alt="img" class="profile_img"  >`
								html += `<span class="profile_name">${mb.name}</span>`
								html += `<button class="modify_btn">프로필 수정</button>`
							html += `</li>`
							html += `<li>`
								html += `<div class="profile_left">`
									html += `아이디`
								html += `</div>`
								html += `<div class="profile_right">`
									html += `<input type="text" value="${mb.id}" class="id">`
								html += `</div>`
							html += `</li>`
							html += `<li>`
								html += `<div class="profile_left">`
									html += `닉네임`
								html += `</div>`
								html += `<div class="profile_right">`
				                    html += `<input type="text" value="${mb.name}" class="name" >`
								html += `</div>`
							html += `</li>`
							html += `<li>`
								html += `<div class="profile_left">`
									html += `전화번호`
								html += `</div>`
								html += `<div class="profile_right">`
				                	html += `<input type="text" value="${mb.phone}" class="phone">`
								html += `</div>`
							html += `</li>`
							html += `<li>`
								html += `<div class="profile_left">`
									html += `프로필 공개 여부`
								html += `</div>`
								html += `<div class="profile_right">`
				                	html += `<select class="profile_chk">`
				                    	html += `<option value="1" ${mb.profile == '1' ? 'selected' : ''} >공개</option>`
				                        html += `<option value="0" ${mb.profile == '0' ? 'selected' : ''} >비공개</option>`
				                    html += `</select>`
								html += `</div>`
							html += `</li>`
				            html += `<li>`
				            	html += `<div class="profile_left">`
				                	html += `<img src="${mb.image == '' ? 'images/basic.jpg' : mb.image}" alt="img" class="profile_img" style="margin:0">`
				                html += `</div>`
				                html += `<div class="profile_right"><input type="file" class="modify-image"></div>`
				            html += `</li>`
						html += `</ul>`
					html += `</div>`

					$('.feeds').html(html)
				})
		break;
		case 'admin1' :
			html += `<div class="admin">`
				html += `<h1>사이트 정보</h1>`
				html += `<div style="text-align:center;">`
					html += `<canvas width="700" height="400" id="pie_chart"></canvas>`
				html += `</div>`
			html += `</div>`

			$('.feeds').html(html)

			pieChart()
		break;
		case 'admin2' :
			html += `<div class="admin">`
				html += `<h1>회원 관리</h1>`
				html += `<table>`
					html += `<tr>`
						html += `<th>아이디</th>`
						html += `<th>비밀번호</th>`
						html += `<th>닉네임</th>`
						html += `<th>전화번호</th>`
						html += `<th>회원 삭제</th>`
					html += `</tr>`

					dbController('getAll', { store: 'member' }, function(data){
						var n_data = data.sort(function(a, b){
							aTime = a.date.getTime()
							bTime = b.date.getTime()

							return bTime - aTime
						})

						$.each(n_data, function(k, v){
							if(v.id != 'admin'){
								html += `<tr>`
									html += `<td>${v.id}</td>`
									html += `<td>${v.pw}</td>`
									html += `<td>${v.name}</td>`
									html += `<td>${v.phone}</td>`
									html += `<td><button class="mbremove-btn" data-id="${v.id}">삭제</button></td>`
								html += `</tr>`
							}
						})
						html += `</table>`
					html += `</div>`

					$('.feeds').html(html)
					})
		break;
	}
	
}

function dbController(type, option, callback){
	var data = "";

	switch(type){
		case 'get' :
			var req = db.transaction([option.store], "readwrite").objectStore(option.store).get(option.get_k);

			req.onsuccess = function(e){
				if(option.msg) alert(option.msg);

				callback(e.target.result);
			}
		break;

		case 'getAll' :
			var req = db.transaction([option.store], "readwrite").objectStore(option.store).getAll();

			req.onsuccess = function(e){
				if(option.msg) alert(option.msg);
				
				callback(e.target.result);
			}
		break;

		case 'count' :
			var req = db.transaction([option.store], "readwrite").objectStore(option.store).count();

			req.onsuccess = function(e){
				if(option.msg) alert(option.msg);
				
				callback(e.target.result);
			}
		break;

		case 'delete' :
			var req = db.transaction([option.store], "readwrite").objectStore(option.store).delete(option.get_k);


			req.onsuccess = function(e){
				if(option.msg) alert(option.msg);
			}
		break;

		case 'update' :
			// console.log(option.get_k)
			// var req = db.transaction([option.store], "readwrite").objectStore(option.store).put(option.data, option.get_k);

			var req = db.transaction([option.store], "readwrite").objectStore(option.store).openCursor();

			req.onsuccess = function(e){
				var result = e.target.result;

				if(result){
					if(result.key == option.get_k){
						var up_data = option.data;

						result.update(up_data);

						if(option.msg) alert(option.msg);
					}

					result.continue();
				}
			}
		break;

		case 'add' :
			var req = db.transaction([option.store], "readwrite").objectStore(option.store).put(option.data);

			req.onsuccess = function(e){
				if(option.msg) alert(option.msg);
			}
		break;
		case 'cursor' :
			var req = db.transaction([option.store], "readwrite").objectStore(option.store).openCursor();
			var data_r = new Array();

			req.onsuccess = function(e){
				var result = e.target.result;

				if(result){
					result.value.key = result.key;

					data_r.push(result.value);
					result.continue();
				}
				
				if(!result){
					callback(data_r);
				}
			}
		break;
	}
}