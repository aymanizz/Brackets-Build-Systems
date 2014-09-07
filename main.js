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
	var ExtensionUtils 		= brackets.getModule("utils/ExtensionUtils"),
		PreferencesManager 	= brackets.getModule("preferences/PreferencesManager"),
		CommandManager 		= brackets.getModule("command/CommandManager"),
		Menus				= brackets.getModule("command/Menus");

	var InfoPanel 			= require("modules/InfoPanel").InfoPanel,
		Configuration 		= require("modules/Configuration").Configuration,
		RunManager 			= require("modules/RunManager").RunManager,
		Util 				= require("modules/Util").Util,
		CommandLine 		= require("modules/CommandLine").CommandLine,
		ExtensionStrings 	= require("modules/Strings");

	var preferences 		= PreferencesManager.getExtensionPrefs(ExtensionStrings.EXTENSION_PREFS),
		menu 				= Menus.getMenu(ExtensionStrings.MENU_ID),
		lastEntry 			= preferences.get('lastEntry'),
		panel 				= new InfoPanel(),
		configuration 		= new Configuration(),
		commandLine 		= new CommandLine(),
		runManager	 		= new RunManager(panel),
		msgs				= "";
	
	preferences.definePreference('showPanel', 'boolean', false);
	preferences.definePreference('lastEntry', 'object', []);
	preferences.definePreference('clear', 'boolean', false);
	preferences.definePreference('debug', 'boolean', false);
	preferences.definePreference('save', 'boolean', false);

	CommandManager.register(ExtensionStrings.BUILD, ExtensionStrings.BUILD_ID, _build);
	CommandManager.register(ExtensionStrings.RUN, ExtensionStrings.RUN_ID, _run);

	panel.init();
	commandLine.init();

	function appendData(data) {
		var data_arr = data.split(lastEntry.seperator ? lastEntry.seperator : /(?:\r\n|\n)/g);
		
		$(panel.status).attr("title", "Build System Status: " 
					+ data_arr.length 
					+ " Output(s)");
		
		for (var i = 0; i < data_arr.length; i++) {
			if (data_arr[i]) {
				panel.appendOutput(data_arr[i]);
			}
		}
	}

	commandLine.addListeners({
		"progress": function(event, data) {
			msgs += data;
			panel.updateStatus(ExtensionStrings.NO_OUTPUT);
			panel.show();
		},
		"error": function(event, data) {
			msgs += data;
			panel.updateStatus(ExtensionStrings.ERROR);
			panel.show();
		},
		"finished": function(event) {
			if (!msgs) {
				panel.updateStatus(ExtensionStrings.NO_OUTPUT);
				$(panel.status).attr("title", "Build System Status: 0 Output(s)");
				panel.appendOutput("No Output");
			} else {
				msgs = msgs.trimRight();
				appendData(msgs);
			}
			
			msgs = "";
			commandLine.closeConnection();
			runManager.finish();
		}
	});

	configuration.read(function(entry) {
		return function() {
			lastEntry = preferences.get('lastEntry');

			if (lastEntry.id) {
				CommandManager.get(ExtensionStrings.BASIC_ID + ".run." + lastEntry.id).setChecked(false);
			}
			
			preferences.set('lastEntry', entry);
			lastEntry = preferences.get('lastEntry');
			preferences.save();
			CommandManager.get(ExtensionStrings.BASIC_ID + ".run." + entry.id).setChecked(true);
			panel.setTitle(entry.name);
			
			if (!lastEntry.cmd) {
				CommandManager.get(ExtensionStrings.BUILD_ID).setEnabled(false);
				$('.build', panel.panelElement).attr('disabled', 'true');
			} else {
				CommandManager.get(ExtensionStrings.BUILD_ID).setEnabled(true);
				$('.build', panel.panelElement).removeAttr('disabled');
			}
			
			if (!lastEntry.Rcmd) {
				CommandManager.get(ExtensionStrings.RUN_ID).setEnabled(false);
				$('.run', panel.panelElement).attr('disabled', 'true');
			} else {
				CommandManager.get(ExtensionStrings.RUN_ID).setEnabled(true);
				$('.run', panel.panelElement).removeAttr('disabled');
			}
			
			if (!lastEntry.Dcmd) {
				CommandManager.get(ExtensionStrings.DEBUG_MODE_ID).setEnabled(false);
			} else {
				CommandManager.get(ExtensionStrings.DEBUG_MODE_ID).setEnabled(true);				
			}
		};
	});

	/*  Menu Build and Run Entries  */
	
	function _build () {
		var debug = CommandManager.get(ExtensionStrings.DEBUG_MODE_ID).getEnabled() 
					&& CommandManager.get(ExtensionStrings.DEBUG_MODE_ID).getChecked();
		
		if (!lastEntry) {
			return;
		} else if (debug) {
			var cmd = configuration.replaceConsts(lastEntry.Dcmd);
		} else {
			var cmd = configuration.replaceConsts(lastEntry.cmd);
		}
		
		var	clear = CommandManager.get(ExtensionStrings.AUTO_CLEAR_ID).getChecked(),
			save = CommandManager.get(ExtensionStrings.SAVE_ON_BUILD_ID).getChecked(),
			dir = configuration.replaceConsts(lastEntry.dir);
		
		runManager.start(lastEntry, function() {
			commandLine.run(dir, cmd, function onStart() {
				clear && panel.clear();
				save && CommandManager.execute("file.saveAll");
				panel.updateStatus(ExtensionStrings.PROGRESS);
				panel.appendText('<tr class="file-section selected"><td colspan="3"><span class="dialog-filename">' 
					+ cmd
					+ '</span> — in <span class="dialog-path" data-path="'
					+ dir
					+ '">'
					+ dir
					+ '</span></td></tr>');
			});
		});
	}

	function _run () {
		if (!lastEntry) {
			return;
		} else {
			var cmd = configuration.replaceConsts(lastEntry.Rcmd);
		}

		var clear = CommandManager.get(ExtensionStrings.AUTO_CLEAR_ID).getChecked(),
			dir = configuration.replaceConsts(lastEntry.dir);

		runManager.start(lastEntry, function() {
			commandLine.run(dir, cmd, function onStart() {
				clear && panel.clear();
				panel.updateStatus(ExtensionStrings.PROGRESS);
				panel.appendText('<tr class="build-sys-output-header file-section selected" data-path="'
					+ dir
					+ '"><td colspan="3"><span class="dialog-filename">' 
					+ lastEntry.name 
					+ '</span> — in <span class="dialog-path">'
					+ dir
					+ '</span></td></tr>');
				
				$(".disclosure-triangle expanded", this.panelContentElement).on('click', function () {
					
				});
			});
		});
	}

	menu.addMenuItem (ExtensionStrings.BUILD_ID, "F9", Menus.BEFORE, ExtensionStrings.DEBUG_MODE_ID);
	menu.addMenuItem (ExtensionStrings.RUN_ID, "F10", Menus.BEFORE, ExtensionStrings.DEBUG_MODE_ID);
	menu.addMenuDivider(Menus.AFTER, ExtensionStrings.RUN_ID);

	/*  Menu Build and Run Entries  */
	
	ExtensionUtils.loadStyleSheet(module, "styles/style.css");
	
	if (lastEntry.id) {
		
		CommandManager.get(ExtensionStrings.BASIC_ID + '.run.' + lastEntry.id).setChecked(true);
		CommandManager.get(ExtensionStrings.BASIC_ID + '.run.' + lastEntry.id).execute();
		panel.setTitle(lastEntry.name);
	}
	
	if (preferences.get("showPanel")) {
		panel.show();
	}
});