

$(function(){

	var verifyName,sname;

	// 失去接口名称焦点事件
	$('#portName').on('blur',function(){
		// 发送校验请求
		sname = $('#portName').val();
		var verifyUrl = cip+'/data/index?type=script_exist&sname='+sname;
		$.ajax({
			url:verifyUrl,
			type:'GET',
			dataType:'json',
			async:false,
			success:function(data){
				verifyName = data.data[0].cnt;
			}
		});
		// 判断校验接口名称是否已经存在
		if( verifyName != 0){
			$('#exist').fadeIn(400);
			return false;
		}else{
			$('#exist').fadeOut(400);
		}
	});
	
	// 下一步页内跳转
	$('#next').off('click').on('click',function(){
		// 判断校验接口名称是否已经存在或是不是为空
		if( verifyName != 0 && sname != undefined){
			return false;
		}

		var inps = $('#addData > input');
		description = inps[0].value;
		module = inps[1].value;
		name = inps[2].value;

		var dataHeight = $('#data').height();
		var storeHeight = $('#store').height();
		var selVal = $('#addList').val();

		// 跳转到-添加SQL脚本
		if(selVal == '1'){
			$('#script').show();
			$('body').scrollTop(dataHeight+storeHeight);
			stype = selVal;
		}

		// 跳转到-添加存储过程
		if(selVal == '2'){
			var storageListUrl = cip+'/data/index?type=proc_list';
			// 自动生成存储过程列表  
			getLoadData(storageListUrl,function(data){
				var arr = data.data;
					for(var i=0;i<arr.length;i++){
						$('#storageList').append('<option value="'+(2+i)+'">'+arr[i].procName+'</option>');
					}
			});
			$('#storageList').html('<option value="1">存储过程列表</option>');
			$('#addsec').html('');
			$('#store').show();
			$('body').scrollTop(dataHeight);
			stype = selVal;
		}
	
	});
	
	// 下拉列表事件  存储过程参数个数生成
	$('#storageList').off('change').on('change',function(){
		$('#addsec').html('');
		var storageList = $('#storageList').children();
		var storageListHtml;
		for(var j=1; j<storageList.length+1; j++){
			if(j == ($('#storageList').val())){
				storageListHtml = $('#storageList').children('option:eq('+(j-1)+')').html();
			}
		}
		if( $('#storageList').val() != '1' ){
			script = storageListHtml;
			var url = cip+'/data/index?type=proc_param&procName='+script;
			$.get(url,function(data){
				var len = data.data[0].paramCount;
				var scriptP = "(";
				for(var i=0; i<len; i++){
					var html = '<input class="inp wi mb" type="text" placeholder="第'+(i+1)+'个参数名称"></input>';
					$('#addsec').append(html);
					scriptP+= "?,";
				}
				if(scriptP.length > 1){
					scriptP = scriptP.substring(0, scriptP.length - 1);
				}
				scriptP += ")";
				script += scriptP;
			});
		}else{
			script = undefined;
		}
	});
	// 添加存储过程完成按扭
	$('#storeComplete').on('click',function(){
		$('#shadeStore').fadeIn(300);
		var arrInput = $('#addsec > input'),
			objData = {},
			values;
			if( $('#addsec').html() != ''){
				values = [];
				for(var i=0; i<arrInput.length; i++){
					values.push({name:arrInput[i].value,value:i+1});
				}
			}
		
		// 确定 发送添加请求
		$('#yesStore').off('click').on('click', function(){
			addApi(values);
			$('#shadeStore').fadeOut(300);
		});
		
		// 取消
		$('#noStore').off('click').on('click', function(){
			$('#shadeStore').fadeOut(300);
			return false;
		});
	});

	// 添加参数按扭
	var sqlIndex = 0;
	$('#addsql').on('click',function(){
		sqlIndex++;		
		var html = '<div id="sqlcon'+sqlIndex+'"><input class="argleft inp mb" value="" type="text" placeholder="参数名称"></input><input class="argright inp mb" value="" type="text" placeholder="参数内容"></input></div>';
		$('#sqlcon').append(html);
	});	
	// 添加SQL脚本完成按扭
	$('#sqlComplete').on('click',function(){
		$('#shadeScript').fadeIn(300);
		var arrDiv = $('#sqlcon > div'),
			paramArr;
			if( $('#sqlcon').html() != ''){
				paramArr = [];
				for(var i=0; i<arrDiv.length; i++){
					paramArr.push({name:$('#sqlcon'+(i+1)+' > input')[0].value,
						value:$('#sqlcon'+(i+1)+' > input')[1].value});
				}
			}
		script = $('#result').val();
		
		// 确定 发送添加请求
		$('#yesScript').off('click').on('click', function(){
			addApi(paramArr);
			$('#shadeScript').fadeOut(300);
		});

		// 取消
		$('#noScript').off('click').on('click', function(){
			$('#shadeScript').fadeOut(300);
			return false;
		});
	});

	// 返回顶部按扭
	$('.return').on('click',function(){
		$('#script').hide();
		$('#store').hide();
	});
	
});

