

$(function(){

	// 获取数据地址
	var requestUrl = cip+'/data/index?type=script_list';
	
	// 添加按钮
	$('#addState').on('click',function(){
		window.open('DataMaintenance.html');
	});

	// 数据获取
	getLoadData(requestUrl,function(data){
		var objs = data.data,
		len = objs.length,
		i = 0;
			
		for(; i<len; i++){
			var strHtmlDel = '<tr>'+
			'<td><a href="">'+objs[i].name+'</a></td>'+
			'<td>'+objs[i].id+'</td>'+
			'<td>'+objs[i].module+'</td>'+
			'<td>'+objs[i].type+'</td>'+
			'<td>'+objs[i].script+'</td>'+
			'<td>'+objs[i].description+'</td>'+
			'<td><span class="span-del">删除</span></td>'
			+'</tr>';

			$('#state').append(strHtmlDel);
		}

	});
		
	// 删除按钮
	$('#state').on('click','span',function(){
		// 显示遮罩层
		$('#shade').fadeIn(400);

		var spanThis = this;
		var val = $(spanThis).parent().parent().children(':first').children(':first').html();
		var name = '确定要删除名称为:"<span style="color:red">'+val+'</span>"的数据项吗?';
		$('#con').html(name);
		
		// 删除确定按扭
		$('#yes').on('click',function(){
			var id = $(spanThis).parent().parent().children("td:eq(1)").html();
			var test = $(spanThis).parent().parent().children("td:eq(2)").html();
			// 删除数据接口地址
			var delUrl = cip+'/data/index?type=script_delete&scriptId='+id;
			// 删除确定判断
			if( test != 'market'){
				$(spanThis).parent().parent().remove();
				var delObj = {
						data:[
							{count:id}
						]
					};

				var delObjStr = JSON.stringify(delObj);
				$.post(delUrl,delObjStr,function(){
					// console.log('发送删除请求成功');
				});
			}

			$('#shade').fadeOut(400);
			spanThis = null;
		});

		// 删除取消按扭
		$('#no').on('click',function(){
			$('#shade').fadeOut(400);
			spanThis = null;
		});

	});

	// 名称a连接的跳转
	$('#state').on('click','a',function(){
		window.open('interfaceDebug.html');
		localStorage.aName = $(this).html();
		localStorage.description = $(this).parent().parent().children('td:eq(5)').html();
		localStorage.scriptId = $(this).parent().parent().children('td:eq(1)').html();
	});

});


