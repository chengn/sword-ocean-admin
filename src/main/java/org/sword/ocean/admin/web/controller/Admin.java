package org.sword.ocean.admin.web.controller;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.scripting.ScriptCompilationException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.sword.lang.StreamUtils;
import org.sword.ocean.service.DataDriver;
import org.sword.ocean.web.common.ControllerUtils;
import org.sword.ocean.web.utils.BaseController;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

@Controller
public class Admin extends BaseController {
	
	private static Logger logger = Logger.getLogger(Admin.class);
	
	@Resource
	private DataDriver swordDataDriver;
	
	/**
	 * sword集成测试
	 * @param request
	 * @return
	 */
	@RequestMapping(value="data")
	@ResponseBody
	public JSONObject indicator(HttpServletRequest request){
		JSONObject object = renderFailed("sword ok"); 
		return object;
	}
	
	/**
	 * 自身服务测试
	 * @param request
	 * @return
	 */
	@RequestMapping(value="test")
	@ResponseBody
	public String test(HttpServletRequest request){
		return "hello sword";
	}
	
	/**
	 * add request
	 * @param request
	 * @return
	 */
	@RequestMapping(value="add",method=RequestMethod.POST)
	@ResponseBody
	public JSONObject add(HttpServletRequest request){
		try {
			String jsonStr = StreamUtils.streamToString(request.getInputStream());
			jsonStr = URLDecoder.decode(jsonStr);
			JSONObject jsonObj = JSONObject.parseObject(jsonStr);   
			JSONArray pArray = jsonObj.getJSONArray("param");
			String validStr = valid(jsonObj, pArray);
			if(StringUtils.isNotBlank(validStr)){
				return renderFailed(validStr);
			}
			String scriptId = addScript(jsonObj);
			if(StringUtils.isNotBlank(scriptId) && pArray != null){
				ArrayList<String> paramIdList = new ArrayList<String>();
				for (Object p : pArray) {
	                JSONObject pobj = (JSONObject)p;
					String paramId = addScriptParam(scriptId, pobj);
					paramIdList.add(paramId);
                }
				Object result = builderAddResult(scriptId, paramIdList);
				return renderObject(result);
			}
        } catch (Exception e) {
        	logger.error("add script error");
	        e.printStackTrace();
        }
		return renderSuccess("add failed");
	}
	
	/**
	 * 
	 * @param jsonObj
	 * @param pArray
	 * @return
	 */
	private String valid(JSONObject jsonObj,JSONArray pArray){
		if(StringUtils.isBlank(jsonObj.getString("stype"))){
			return "接口类型不能为空";
		}
		if(StringUtils.isBlank(jsonObj.getString("module"))){
			return "模块内容不能为空";
		}
		if(StringUtils.isBlank(jsonObj.getString("name"))){
			return "接口名称不能为空";
		}
		if(StringUtils.isBlank(jsonObj.getString("script"))){
			return "脚本内容不能为空";
		}
		
		int pcount = StringUtils.countMatches(jsonObj.getString("script"), "?");
		int psize = 0;
		if(pArray != null)
			psize = pArray.size();
		if(pcount > 0){
			if(pcount != psize){
				return "脚本中含有的?和对应的参数不符";
			}
		}
		return null;
	}
	
	/**
	 * 构建返回对象
	 * @param scriptId
	 * @param paramList
	 * @return
	 */
	private Object builderAddResult(String scriptId,ArrayList<String> paramIdList){
		JSONObject reObject = new JSONObject();
		//构建返回对象
		reObject.put("scriptId", scriptId);
		reObject.put("params", paramIdList);
		return reObject;
	}
	
	/**
	 * set script param
	 * @param type
	 * @param module
	 * @param name
	 * @param script
	 * @param description
	 * @param flag
	 * @return
	 */
	private void setScriptParam(Map paramsMap,JSONObject jsonObj){
		paramsMap.put("stype", jsonObj.getString("stype"));
		paramsMap.put("module", jsonObj.getString("module"));
		paramsMap.put("name", jsonObj.getString("name"));
		paramsMap.put("script", jsonObj.getString("script"));
		paramsMap.put("description", jsonObj.getString("description"));
		if(StringUtils.contains("?", jsonObj.getString("script"))){
			paramsMap.put("flag", "1");
		}
		else{
			paramsMap.put("flag", "0");
		}
	}
	
	/**
	 * add script
	 * @param jsonObj
	 * @return
	 */
	private String addScript(JSONObject jsonObj){  
		Map paramsMap = new HashMap<String, String>();  
		paramsMap.put(PARAM_TYPE, "script_add");
		setScriptParam( paramsMap, jsonObj);
		List<Object> data = swordDataDriver.query(paramsMap);
		if(data == null || data.size() <= 0){
			return null;
		}
		Map result = (Map)data.get(0);
		String scriptId = result.get("scriptid").toString();
		return scriptId;
	}
	
	/**
	 * add param
	 * @param scriptId
	 * @param name
	 * @param content
	 * @return
	 */
	private String addScriptParam(String scriptId,JSONObject pobj){
		Map paramsMap = new HashMap<String, String>();  
		paramsMap.put(PARAM_TYPE, "script_add_param");
		paramsMap.put("scriptId", scriptId);
		paramsMap.put("name", pobj.getString("name"));
		paramsMap.put("content", pobj.getString("value"));
		List<Object> data = swordDataDriver.query(paramsMap);
		if(data == null || data.size() <= 0){
			return null;
		}
		Map result = (Map)data.get(0);
		String paramId = result.get("paramId").toString();
		return paramId;
	}
	
}
