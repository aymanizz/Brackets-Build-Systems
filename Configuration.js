define(function (require, exports, module) {

  var DocumentManager = brackets.getModule("document/DocumentManager");
  var Document = brackets.getModule("document/Document");
  var FileUtils = brackets.getModule("file/FileUtils");
  var CommandManager = brackets.getModule("command/CommandManager");
  var Menus = brackets.getModule("command/Menus");
  var KeyBindingManager = brackets.getModule("command/KeyBindingManager");
  var ProjectManager = brackets.getModule('project/ProjectManager');
  var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
  var Dialogs = brackets.getModule("widgets/Dialogs");

  var Util = require("./Util").Util;
  var InfoPanel = require("./InfoPanel").InfoPanel;
  var ExtensionStrings = require("Strings");
    
  var menu = Menus.addMenu("Build", ExtensionStrings.MENU_ID, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
  var preferences = PreferencesManager.getExtensionPrefs(ExtensionStrings.EXTENSION_PREFS);
  
  preferences.definePreference('clear', 'boolean', false);
  preferences.definePreference('debug', 'boolean', false);
    
  function addMenuItem() {
    CommandManager.register(
      ExtensionStrings.CONFIG, 
      ExtensionStrings.CONFIG_ID, function() {
        var src = FileUtils.getNativeModuleDirectoryPath(module) + "/Build-Sys-Config.json";

      DocumentManager.getDocumentForPath(src).done(
        function (doc) {
          DocumentManager.setCurrentDocument(doc);
        }
      );
        
      Dialogs.showModalDialog('', ExtensionStrings.EXTENSION_NAME, ExtensionStrings.CONFIG_MSG);
    });
    menu.addMenuItem(ExtensionStrings.CONFIG_ID);
  }
    
  function _checkDebugMode ()
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
    
  function _checkAutoClear ()
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
    
  CommandManager.register(ExtensionStrings.DEBUG_MODE, ExtensionStrings.DEBUG_MODE_ID, _checkDebugMode);
  CommandManager.register(ExtensionStrings.AUTO_CLEAR, ExtensionStrings.AUTO_CLEAR_ID, _checkAutoClear);
  
  if (preferences.get("debug"))
  {
    preferences.set("debug", false);
    _checkDebugMode();
  }
  
  if (preferences.get("clear"))
  {
    preferences.set("clear", false);
    _checkAutoClear();
  }

  function Configuration() {
  }
  
  Configuration.prototype.replaceVarsOf = function(entry) {
    var projectRoot = Util.stripTrailingPathSeparator(ProjectManager.getProjectRoot().fullPath);
    var projectName = FileUtils.getBaseName(projectRoot);
    var fileName = DocumentManager.getCurrentDocument().file._name;
    var fileNameNoExt = fileName.replace("." + FileUtils.getFileExtension(fileName), "");
    
    return entry.replace(/\$PROJECT_NAME/g, projectName)
        .replace(/\$PROJECT_ROOT/g, projectRoot)
        .replace(/\$FULL_FILE_NAME/g, fileName)
        .replace(/\$FILE_NAME/g, fileNameNoExt);
  }

  Configuration.prototype.read = function(entryCallback) {
    var configuration = JSON.parse(require('text!Build-Sys-Config.json'));
    
    configuration.forEach(function(entry, idx) {
      
      
      entry.id = idx;
      
      if (entry.cmd == "__build__") {
        var commandId = ExtensionStrings.BUILD_ID;
        menu.addMenuDivider();
      } else if (entry.cmd == "__run__") {
        var commandId = ExtensionStrings.RUN_ID;
      } else {
        var commandId = ExtensionStrings.BASIC_ID + '.run.' + idx;
      }
      
      CommandManager.register(
        entry.name,
        commandId,
        entryCallback(entry)
      );
      
      menu.addMenuItem(commandId,entry.shortcut);
      
    });
    
    menu.addMenuDivider();
    menu.addMenuItem (ExtensionStrings.DEBUG_MODE_ID, "CTRL-F9");
    menu.addMenuItem (ExtensionStrings.AUTO_CLEAR_ID, "CTRL-F10");
    menu.addMenuDivider();
    menu.addMenuItem (ExtensionStrings.SHOW_PANEL_ID);
    
    addMenuItem();
  };

  exports.Configuration = Configuration;
});