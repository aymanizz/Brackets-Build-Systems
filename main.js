/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Ayman Izzeldin
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

define(function (require, exports, module) {
  var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
  var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
  var CommandManager = brackets.getModule("command/CommandManager");
  var Menus = brackets.getModule("command/Menus");

  var InfoPanel = require("./InfoPanel").InfoPanel;
  var Configuration = require("./Configuration").Configuration;
  var RunManager = require("./RunManager").RunManager;
  var Util = require("./Util").Util;
  var CommandLine = require("./CommandLine").CommandLine;
  var ExtensionStrings = require("Strings");
	
  var preferences = PreferencesManager.getExtensionPrefs(ExtensionStrings.EXTENSION_PREFS);
  
  $("#status-language").before('<div class="' + ExtensionStrings.INACTIVE + '" id="brackets-build-sys-status" title="Build System Status">No Build</div>');
  
  $status = $('#brackets-build-sys-status');
  
  preferences.definePreference('showPanel', 'boolean', false);
  preferences.definePreference('lastEntry', 'object', []);
  
  var panel = new InfoPanel();
  panel.init();

  var configuration = new Configuration();

  var commandLine = new CommandLine();
  commandLine.init();

  var runManager = new RunManager(panel);
  
  var menu = Menus.getMenu (ExtensionStrings.MENU_ID);
  
  var lastEntry = preferences.get('lastEntry');
  
  CommandManager.register("Show Panel", ExtensionStrings.SHOW_PANEL_ID, _togglePanel);
  
  if (preferences.get("showPanel") === true)
  {
    CommandManager.get(ExtensionStrings.SHOW_PANEL_ID).setChecked(true);
    panel.show();
  }
  
  function _togglePanel ()
  {
    var isShown = preferences.get('showPanel');
    
    if (isShown)
    {
     panel.hide();
    }
    else
     panel.show();
  }
  
  function _updateStatus (newClass)
  {
    $status.attr("class", newClass);
    if (newClass == "Inactive")
      $status.text("No Build");
    else $status.text(newClass);
  }

  commandLine.addListeners({
    "progress": function(event, data) {
      panel.appendText("<tr style='display:table-row'><td>" + Util.encodeSpecialCharacters(data.trim()));
      _updateStatus(ExtensionStrings.WARNING);
    },
    "error": function(event, data) {
      panel.appendText("<tr style='display:table-row'><td>" + data);
      _updateStatus(ExtensionStrings.ERROR);
    },
    "finished": function(event) {
      panel.appendText("</td></tr>");
      if (!($status.hasClass(ExtensionStrings.WARNING) || $status.hasClass(ExtensionStrings.ERROR)))
        _updateStatus(ExtensionStrings.NO_OUTPUT);
      commandLine.closeConnection();
      runManager.finish();
    }
  });

  configuration.read(function(entry) {
    if (entry.cmd == "__build__" || entry.cmd == "__run__") return function() {
      var clear = CommandManager.get(ExtensionStrings.AUTO_CLEAR_ID).getChecked();
      var debug = CommandManager.get(ExtensionStrings.DEBUG_MODE_ID).getChecked();
      var cmd = "";
      var dir = "";
      
      if (lastEntry === [])
        return;
      
      if (entry.cmd == "__run__")
      {
		    if (lastEntry.Rcmd !== undefined)
          cmd = configuration.replaceVarsOf(lastEntry.Rcmd);
        else
        {
          cmd = "";
          if (clear) panel.clear();
          panel.show();
          CommandManager.get(ExtensionStrings.SHOW_PANEL_ID).setChecked(true);
          panel.appendText("<tr><td>" + ExtensionStrings.NO_RUN_CMD + "</tr></td>");
        }
		  }
      
      else if (debug === true && lastEntry.Dcmd !== undefined)
        cmd = configuration.replaceVarsOf(lastEntry.Dcmd);
      
			else if (lastEntry.cmd !== undefined)
        cmd = configuration.replaceVarsOf(lastEntry.cmd);
      
      else
        {
          cmd = "";
          if (clear) panel.clear();
          panel.show();
          CommandManager.get(ExtensionStrings.SHOW_PANEL_ID).setChecked(true);
          panel.appendText("<tr><td>" + ExtensionStrings.NO_BUILD_CMD + "</tr></td>");
        }
        
      if (cmd !== "")
      {
        dir = configuration.replaceVarsOf(lastEntry.dir);
        
        runManager.start(lastEntry, function() {
          commandLine.run(dir, cmd, function onStart() {
            if (clear) panel.clear();
            panel.show();
            CommandManager.get(ExtensionStrings.SHOW_PANEL_ID).setChecked(true);
            _updateStatus(ExtensionStrings.PROGRESS);
            panel.appendText('<tr class="file-section"><td><span class="dialog-filename">' + cmd + '</span> — in <span class="dialog-path">' + dir + '</span></td></tr>');
          });
        });
      }
    };
    
    else return function() {
      if (lastEntry.id !== undefined)
        CommandManager.get(ExtensionStrings.BASIC_ID + ".run." + lastEntry.id).setChecked(false);
      
      preferences.set('lastEntry', entry);
      preferences.save();
      CommandManager.get(ExtensionStrings.BASIC_ID + ".run." + entry.id).setChecked(true);
      panel.setTitle(entry.name);
    };
  });
  
  if (lastEntry.id !== undefined)
  {
    CommandManager.get(ExtensionStrings.BASIC_ID + '.run.' + lastEntry.id).setChecked(true);
    panel.setTitle(lastEntry.name);
  }
  
  $status.on('click', function () {
    _togglePanel();
  });
  
  ExtensionUtils.loadStyleSheet(module, "output-panel.css");
});