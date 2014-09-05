/*  Configuration 
	-*- all menu items added in this file except for build and run items 
	-*- build-sys-config is processed in this file  
	*/
define(function (require, exports, module) {

	var DocumentManager 	= brackets.getModule("document/DocumentManager"),
		Document 			= brackets.getModule("document/Document"),
		FileUtils 			= brackets.getModule("file/FileUtils"),
		ExtensionUtils 		= brackets.getModule("utils/ExtensionUtils"),
		CommandManager 		= brackets.getModule("command/CommandManager"),
		Menus 				= brackets.getModule("command/Menus"),
		ProjectManager 		= brackets.getModule('project/ProjectManager'),
		PreferencesManager 	= brackets.getModule('preferences/PreferencesManager'),
		Dialogs 			= brackets.getModule("widgets/Dialogs");

	var Util 				= require("./Util").Util,
		InfoPanel 			= require("./InfoPanel").InfoPanel,
		ExtensionStrings 	= require("./Strings");

	var menu 				= Menus.addMenu("Build", ExtensionStrings.MENU_ID, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU),
		preferences 		= PreferencesManager.getExtensionPrefs(ExtensionStrings.EXTENSION_PREFS);

	function Configuration() {
	}

	function _openConfigFile() {
		console.log(module.uri);
		
		var src = module.uri.substr(0, module.uri.indexOf('/modules/Configuration.js') + 1) + 'build-sys-config.json';
		
		DocumentManager.getDocumentForPath(src).done(
			function (doc) {
				DocumentManager.setCurrentDocument(doc);
			}
		);

		Dialogs.showModalDialog('', ExtensionStrings.EXTENSION_NAME, ExtensionStrings.CONFIG_MSG);
	}

	function _toggleDebugMode ()
	{
		var debug = CommandManager.get(ExtensionStrings.DEBUG_MODE_ID);
		var debugPref = preferences.get("debug");  

		if (debugPref)
		{
			debug.setChecked(false);
		}
		else
		{
			debug.setChecked(true);
		}

		preferences.set("debug", !debugPref);
		preferences.save();
	}

	function _toggleAutoClear ()
	{
		var clear = CommandManager.get(ExtensionStrings.AUTO_CLEAR_ID);
		var clearPref = preferences.get("clear");

		if (clearPref)
		{
			clear.setChecked(false);
		}
		else
		{
			clear.setChecked(true);
		}

		preferences.set("clear", !clearPref);
		preferences.save();
	}

	function _toggleSaveOnBuild ()
	{
		var save = CommandManager.get(ExtensionStrings.SAVE_ON_BUILD_ID);
		var savePref = preferences.get("save");

		if (savePref)
		{
			save.setChecked(false);
		}
		else
		{
			save.setChecked(true);
		}

		preferences.set("save", !savePref);
		preferences.save();
	}

	CommandManager.register(ExtensionStrings.CONFIG, ExtensionStrings.CONFIG_ID, _openConfigFile);
	CommandManager.register(ExtensionStrings.DEBUG_MODE, ExtensionStrings.DEBUG_MODE_ID, _toggleDebugMode);
	CommandManager.register(ExtensionStrings.AUTO_CLEAR, ExtensionStrings.AUTO_CLEAR_ID, _toggleAutoClear);
	CommandManager.register(ExtensionStrings.SAVE_ON_BUILD, ExtensionStrings.SAVE_ON_BUILD_ID, _toggleSaveOnBuild);
	

	if (preferences.get("debug"))
	{
		preferences.set("debug", false);
		_toggleDebugMode();
	}

	if (preferences.get("clear"))
	{
		preferences.set("clear", false);
		_toggleAutoClear();
	}

	if (preferences.get("save"))
	{
		preferences.set("save", false);
		_toggleSaveOnBuild();
	}

	Configuration.prototype.replaceConsts = function(entry) {
		var projectRoot = Util.stripTrailingPathSeparator(ProjectManager.getProjectRoot().fullPath);
		var projectName = FileUtils.getBaseName(projectRoot);
		var fileName = DocumentManager.getCurrentDocument().file._name;
		var fileNameNoExt = fileName.replace("." + FileUtils.getFileExtension(fileName), "");
		var filePath = DocumentManager.getCurrentDocument().file.parentPath;

		return entry.replace(/\$PROJECT_NAME/g, projectName)
		.replace(/\$PROJECT_ROOT/g, projectRoot)
		.replace(/\$FULL_FILE_NAME/g, fileName)
		.replace(/\$FILE_NAME/g, fileNameNoExt)
		.replace(/\$FILE_PATH/g, filePath);
	}

	Configuration.prototype.read = function(entryCallback) {
		var configuration = JSON.parse(require('text!../build-sys-config.json'));

		configuration.forEach(function(entry, idx) {

			entry.id = idx + 1;
			var commandId = ExtensionStrings.BASIC_ID + '.run.' + entry.id;

			CommandManager.register(
				entry.name,
				commandId,
				entryCallback(entry)
			);

			menu.addMenuItem(commandId,entry.shortcut);

		});

		menu.addMenuDivider();
		menu.addMenuItem (ExtensionStrings.DEBUG_MODE_ID/*, "CTRL-F9"*/);
		menu.addMenuItem (ExtensionStrings.AUTO_CLEAR_ID/*, "CTRL-F10"*/);
		menu.addMenuItem (ExtensionStrings.SAVE_ON_BUILD_ID/*, "Ctrl-F11"*/);
		menu.addMenuDivider();
		menu.addMenuItem (ExtensionStrings.SHOW_PANEL_ID);
		menu.addMenuItem(ExtensionStrings.CONFIG_ID);
	};

	exports.Configuration = Configuration;
});