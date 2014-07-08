define(function (require, exports) {

  var PanelManager = brackets.getModule("view/PanelManager");
  var CommandManager = brackets.getModule("command/CommandManager");
  var PreferencesManager = brackets.getModule('preferences/PreferencesManager');
  
  var ExtensionStrings = require("Strings");
  
  var preferences = PreferencesManager.getExtensionPrefs(ExtensionStrings.EXTENSION_PREFS);
    
  function InfoPanel() {
    this.panelElement = null;
    this.panelContentElement = null;
    this.panel = null;
  }

  InfoPanel.prototype.init = function() {
    var self = this;
    var infoPanelHtml = require("text!output-panel.html");
    var debug = CommandManager.get(ExtensionStrings.DEBUG_ID);

    this.panelElement = $(infoPanelHtml);
    this.panelContentElement = $('.table tbody', this.panelElement);
    
    this.panel = PanelManager.createBottomPanel(
      ExtensionStrings.PANEL_ID,
      this.panelElement);
    
    $('.close', this.panelElement).on('click', function() {
      CommandManager.get(ExtensionStrings.SHOW_PANEL_ID).setChecked(false);
      preferences.set("showPanel", false);
      self.hide();
    });
    
    $('.build', this.panelElement).on('click', function() {
      CommandManager.execute (ExtensionStrings.BUILD_ID);
    });
      
    $('.run', this.panelElement).on('click', function() {
      CommandManager.execute (ExtensionStrings.RUN_ID);
    });
    
    $('.config', this.panelElement).on('click', function() {
      CommandManager.execute (ExtensionStrings.CONFIG_ID);
    });
      
    $('.clear', this.panelElement).on('click', function() {
      self.clear();
    });
  };

  InfoPanel.prototype.show = function() {
    this.panel.show();
    CommandManager.get(ExtensionStrings.SHOW_PANEL_ID).setChecked(true);
    preferences.set('showPanel', true);
    preferences.save();
  };

  InfoPanel.prototype.hide = function() {
    this.panel.hide();
    CommandManager.get(ExtensionStrings.SHOW_PANEL_ID).setChecked(false);
    preferences.set('showPanel', false);
    preferences.save();
  };

  InfoPanel.prototype.clear = function() {
    $(this.panelContentElement).html("");
    $('#brackets-build-sys-status').attr("class", ExtensionStrings.INACTIVE).text("No Build");
  };

  InfoPanel.prototype.appendText = function(text) {
    var currentHtml = $(this.panelContentElement).html();

    text = text.replace(/(?:\r\n|\n)/g, "</td></tr><tr><td>");
    
    currentHtml = currentHtml.replace("<tr><td></td></tr>", "");
    
    $(this.panelContentElement).html(currentHtml + text);
    
    this.scrollToBottom();
  };

  InfoPanel.prototype.scrollToBottom = function() {
    this.panelElement[0].scrollTop = this.panelElement[0].scrollHeight;
  };
  
  InfoPanel.prototype.setTitle = function(title) {
    $('.title', this.panelElement).html(ExtensionStrings.EXTENSION_NAME + " — " + title);
  };

  exports.InfoPanel = InfoPanel;
});