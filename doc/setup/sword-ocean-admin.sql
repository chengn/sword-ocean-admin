/*
Navicat MySQL Data Transfer

Target Server Type    : MYSQL
Target Server Version : 50629
File Encoding         : 65001

Date: 2016-08-30 09:11:44
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sys_script
-- ----------------------------
DROP TABLE IF EXISTS `sys_script`;
CREATE TABLE `sys_script` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL COMMENT '1=SQL，2=存储过程',
  `module` varchar(255) DEFAULT NULL COMMENT '模块',
  `name` varchar(255) NOT NULL,
  `script` varchar(2000) NOT NULL COMMENT '执行脚本',
  `description` varchar(255) DEFAULT NULL,
  `flag` varchar(1) DEFAULT NULL COMMENT '是否有效，0无效，1或其他有效',
  PRIMARY KEY (`id`),
  UNIQUE KEY `I_SYS_SCRIPT_NAME` (`name`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of sys_script
-- ----------------------------
INSERT INTO `sys_script` VALUES ('3', '1', 'sys', 'script_list', 'SELECT id,module,name,script,description,CASE WHEN type = 1 THEN \'SQL脚本\' WHEN type = 2 THEN \'存储过程\' ELSE \'错误\' END type FROM sys_script WHERE module <> \'sys\'', '系统管理接口列表', '');
INSERT INTO `sys_script` VALUES ('5', '2', 'sys', 'script_add', 'p_sys_addScript(?,?,?,?,?,?)', '添加数据服务', '');
INSERT INTO `sys_script` VALUES ('6', '2', 'sys', 'script_delete', 'p_sys_deleteScript(?)', '删除数据服务', '');
INSERT INTO `sys_script` VALUES ('7', '2', 'sys', 'script_add_param', 'p_sys_addScriptParam(?,?,?)', '添加数据服务参数', '');
INSERT INTO `sys_script` VALUES ('9', '2', 'sys', 'proc_param', 'p_sys_proParam(?)', '过程参数', '');
INSERT INTO `sys_script` VALUES ('12', '2', 'sys', 'proc_list', 'p_sys_proList()', '系统过程', '');
INSERT INTO `sys_script` VALUES ('15', '1', 'sys', 'script_exist', 'select count(*) as cnt from sys_script where name = ? ', '数据服务是否存在', '1');
INSERT INTO `sys_script` VALUES ('17', '1', 'sys', 'script_params', 'select name from sys_scriptparam a where a.scriptId = ?', '脚本参数列表', '1');

-- ----------------------------
-- Table structure for sys_scriptparam
-- ----------------------------
DROP TABLE IF EXISTS `sys_scriptparam`;
CREATE TABLE `sys_scriptparam` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scriptId` int(11) DEFAULT NULL COMMENT '参数对应脚本的id',
  `name` varchar(255) DEFAULT NULL COMMENT '参数名称',
  `content` varchar(255) DEFAULT NULL COMMENT '参数内容，sql条件语句或者过程参数',
  PRIMARY KEY (`id`),
  KEY `I_SCRIPT_ID` (`scriptId`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of sys_scriptparam
-- ----------------------------
INSERT INTO `sys_scriptparam` VALUES ('5', '6', 'scriptId', '1');
INSERT INTO `sys_scriptparam` VALUES ('6', '5', 'stype', '1');
INSERT INTO `sys_scriptparam` VALUES ('7', '5', 'module', '2');
INSERT INTO `sys_scriptparam` VALUES ('8', '5', 'name', '3');
INSERT INTO `sys_scriptparam` VALUES ('9', '5', 'script', '4');
INSERT INTO `sys_scriptparam` VALUES ('10', '5', 'description', '5');
INSERT INTO `sys_scriptparam` VALUES ('11', '5', 'flag', '6');
INSERT INTO `sys_scriptparam` VALUES ('12', '7', 'scriptId', '1');
INSERT INTO `sys_scriptparam` VALUES ('13', '7', 'name', '2');
INSERT INTO `sys_scriptparam` VALUES ('14', '7', 'content', '3');
INSERT INTO `sys_scriptparam` VALUES ('17', '9', 'procName', '1');
INSERT INTO `sys_scriptparam` VALUES ('18', '15', 'sname', '1');
INSERT INTO `sys_scriptparam` VALUES ('21', '17', 'scriptId', '1');

-- ----------------------------
-- Procedure structure for p_sys_addScript
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_sys_addScript`;
DELIMITER ;;
CREATE  PROCEDURE `p_sys_addScript`(IN `p_stype` varchar(100),IN `p_module` varchar(100),IN `p_name` varchar(100),IN `p_script` varchar(1000),IN `p_description` varchar(1000),IN `p_flag` varchar(10))
BEGIN
    #EXISTS
    DECLARE v_return INTEGER;
    SET v_return = (select count(*) from sys_script where name=p_name);
    IF v_return > 0 THEN
		UPDATE sys_script SET type=p_stype,module=p_module,script=p_script,description=p_description,flag=p_flag
		WHERE  name=p_name ;
		set v_return = (select id from sys_script where name=p_name LIMIT 1);
	ELSE
		INSERT into sys_script(type,module,name,script,description,flag)
		VALUES (p_stype,p_module,p_name,p_script,p_description,p_flag);
		
		SET v_return = LAST_INSERT_ID();
	END IF;

	SELECT v_return as scriptid from DUAL;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_sys_addScriptParam
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_sys_addScriptParam`;
DELIMITER ;;
CREATE  PROCEDURE `p_sys_addScriptParam`(IN `p_scriptId` varchar(100),IN `p_paramName` varchar(100),IN `p_paramContent` varchar(500))
BEGIN
	#Routine body goes here...
    DECLARE v_return INTEGER;
    SET v_return = (select id from sys_scriptparam where scriptid=p_scriptId and name=p_paramName limit 1);
    IF v_return > 0 THEN
		UPDATE sys_scriptparam set content = p_paramContent where scriptid=p_scriptId and name=p_paramName;
	ELSE
		INSERT into sys_scriptparam(scriptId,name,content)
		VALUES (p_scriptId ,p_paramName,p_paramContent);
		
		SET v_return = LAST_INSERT_ID();
	END IF;

	SELECT v_return as paramId;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_sys_deleteScript
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_sys_deleteScript`;
DELIMITER ;;
CREATE  PROCEDURE `p_sys_deleteScript`(IN `p_scriptId` varchar(100))
BEGIN

	DECLARE v_del INTEGER;
    SET v_del = (SELECT count(*) from sys_script where id=p_scriptId and module = 'sys');
    IF v_del > 0 THEN
	    SET v_del = 0;
	ELSE
		DELETE from sys_script where id=p_scriptId;
		DELETE from sys_scriptparam where scriptId = p_scriptId;
        SET v_del = (SELECT count(*) from sys_script where id=p_scriptId);
	END IF;

    SELECT v_del as count;
END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_sys_proList
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_sys_proList`;
DELIMITER ;;
CREATE PROCEDURE `p_sys_proList`()
BEGIN

	DECLARE v_currentDb VARCHAR(100);
	SET v_currentDb = (SELECT db from mysql.proc where SPECIFIC_name = 'p_sys_proList');
    SELECT SPECIFIC_name as procName from mysql.proc where db=v_currentDb and type = 'PROCEDURE'  and SUBSTR(SPECIFIC_name,1,5) <> 'p_sys';

END
;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for p_sys_proParam
-- ----------------------------
DROP PROCEDURE IF EXISTS `p_sys_proParam`;
DELIMITER ;;
CREATE PROCEDURE `p_sys_proParam`(IN `p_procName` varchar(100))
BEGIN
	#Routine body goes here...
    DECLARE v_paramCount INTEGER;
    DECLARE v_param varchar(200);
    SET v_param = (select CONVERT(GROUP_CONCAT(param_list) USING utf8) as procParam from mysql.proc where name = p_procName);
    IF LENGTH(v_param) = 0 THEN
		SET v_paramCount = 0 ;
	ELSE
		SET v_paramCount = (LENGTH(v_param) - LENGTH(REPLACE(v_param,',','')) + 1) ;
	END IF;
    
    SELECT v_paramCount as paramCount FROM DUAL;
END
;;
DELIMITER ;
