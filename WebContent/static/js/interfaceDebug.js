

$(function(){

	// 自动生成table表格方法
	function requestData() {
		var url = cip+'/data/index?type=script_params&scriptId='+localStorage.scriptId;
		$.ajax({
			url:url,
			type:"GET",
			dataType:'json',
			async:false,
			success:function(data){
				var arrObj = data.data;
				if(arrObj == undefined){
					return;
				}

				$('#param').html(paramHtml);
				for(var i=0; i<arrObj.length; i++){
					for(var k in arrObj[i]){
						var html = '<tr>'+
						'<td class="nameVue">'+arrObj[i][k]+'</td>'+
						'<td><input class="vue" placeholder="请输入参数值" type="text"></input></td>'+
						'</tr>';
						$('#param').append(html);
					}
				}
			}
		});
	}

	// 调用获取数据方法
	function call() {
		var len = $('.nameVue').length;
		var str = '';

		for(var i=0; i<len; i++){
			if( $('.vue')[i].value != '' ){
				str += '&'+$('.nameVue')[i].innerHTML+'='+$('.vue')[i].value;
			}
		}
		var callUrl = cip+'/data/index?type='+typeVal+str;
		$('#site').val(callUrl);
		getLoadData(callUrl, function(data){
			$('#result').val(JSON.stringify(data));
			localStorage.clear();
		});
	}

	var paramHtml = '<tr><td style="width: 200px">参数名称</td><td>参数值</td></tr>';
	var typeVal = localStorage.aName;
	$('#type').val(typeVal);
	$('#description').val(localStorage.description);

	// 自动生成table表格
	requestData();

	// 点击调用事件
	$('#btnCall').off('click').on('click',call);

	// 键盘回车事件
	$('html').off('click').on('keydown',function(e){
		if(e.keyCode == 13){
			call();
		}
	});

});

