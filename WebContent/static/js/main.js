function getLoadData(url,callback){
    $.ajax({
        url:url,
        type:"GET",
        dataType:'json',
        success:function(data){
            callback(data);
        }
    });
}

// 添加数据方法
function addApi(paramArr){
	var url = cip+"/add"; 
	var param = {
		stype:stype,
		module:module,
		name:name,
		script:script,
		description:description,
		param:paramArr
	};
	
	var paramstr = JSON.stringify(param);

	$.post(url,paramstr,function(data){
		if( data.result == 'failed' ){
			$('#alrcon').html('请注意：'+data.msg);
			$('#alr').show();
		}else{
			window.close();
		}
	});
}

var description,module,name,stype,flag,script;

// 请求ip地址变量
var cip = Http.rootPath();
// var cip = 'http://123.57.34.39:8080/soa';
