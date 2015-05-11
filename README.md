# ***Brackets Build System Extension***
-- for brackets >=0.43, doesn't work on newer versions.
Brackets IDE extension. Adds support of keyboard shortcuts and menu items for execution of terminal commands right from the IDE.

## Configuration

Activate the menu item `Build -> Configuration...` to open the configuration of commands for the extension.

Example configuration

```Json
[
  {
    "name": "Example",
    "dir": "$PROJECT_ROOT/$PROJECT_NAME/$FULL_FILE_NAME/$FILE_NAME",
    "cmd": "build $PROJECT_NAME/$FULL_FILE_NAME",
    "Dcmd": "Debug Command",
    "Rcmd": "Run $FILE_NAME.sth",
    "shortcut": "Ctrl-Shift-Alt-N",
    "seperator": "\n",
    "autohide": true
  }
]
```

* `name` name of the configuration entry and menu item, required
* `dir` specifies the directory in which the command should be run, required.
* `cmd` the actual command runned by triggering the command in the menu item or by it's shortcut then using the menu item Build (`Build -> Build <F9>`), required.
* `Dcmd` the debug command (which is only executed if the debug mode is activated) executed using the menu item Build (`Build -> Build <F9>`), optional (if not specified the actual command will be executed instead).
* `Rcmd` the run command which is executed to run the compiled file using the menu item Run (`Build -> Run <F10>`).
* `shortcut` the keyboard shortcut that will activate the command so make sure it's not already used somewhere else, required.
* `seperator` regular expression used to seperate output (default - newline), optional.
* `autohide` whether the feedback panel with the command output should be hidden automatically after a few seconds or not, optional.

* Special Variables : these variables are replaced, when the command is executed, by their values. This way, when opening multiple projects/files in a sequence the commands will be applicable for each project/file provided. The variables are :-

  - `$PROJECT_ROOT` represents the root directory of the currently open project.
  - `$PROJECT_NAME` represents the project name (project directory name).
  - `$FULL_FILE_NAME` represents the currently opened file name with it's extension.
  - `$FILE_NAME` represents the currently opened file name without it's extension.
  - `$FILE_PATH` represents the currently opened file path.

NOTE: required properties if ommited will not produce an error massage.

In order for changes to be applied just reload Brackets.

## How To Use

This extension is similar to sublime text editor's build systems. The following are some useful instructions :-

#### Use menu items

After re-loading Brackets with the latest version of the configuration just use the menu `build`. In the example above

`Build -> Example` will trigger the command so it will be executed when Build (`Build -> Build <F9>`) is activated.

#### Use shortcuts

After re-loading Brackets with the latest version of the configuration just use the shortcuts. In the example above

`Ctrl-Shift-Alt-N` will trigger the command.

#### Notes

1. The Build menu item (`Build -> Build <F9>`) will build the triggered command using it's `cmd` (or `Dcmd` if Debug Mode is enabled) property as the command.

2. The Run menu item (`Build -> Run <F10>`) will run the triggered command using it's `Rcmd` property as the command.

3. if Debug Mode is Enabled (`Build -> Debug Mode <CTRL-F9>`) the command stored in `Dcmd` will be used in building, see `Dcmd` for more details.

4. if Auto Clear is Enabled (`Build -> Auto Clear <CTRL-F10>`) the panel will be cleared before the execution of a command.

5. if Auto Save All on Build is Enabled (`Build -> Save All on Build <CTRL-F11>`) all open files will be saved before the execution of a build command.

## Supported Platforms

The extension has been tested on Windows 7, but should work on any platform or so I HOPE :).

## Future Plans

1. Parse the output in panel to display line, massage, and file in which the error occured on click (like in replace panel).
2. Make editing configurations easier through a modal dialog with add, edit and remove options.
4. Add Automatic build based on the current open file.
5. Add `Build and Run` menu entry.

## Report Issues and Feature Requests

Issues and feature requests can be reported at [https://github.com/aymanizz/Brackets-Build-Systems/issues](https://github.com/aymanizz/Brackets-Build-Systems/issues)

## License

MIT License. see [LICENSE](https://github.com/aymanizz/Brackets-Build-Systems/LICENSE) for more details.

## Credits

The extension was built on top of [Command Line Shortcuts](https://github.com/antivanov/Brackets-Command-Line-Shortcuts/),
which was in part inspired by [Brackets Builder](https://github.com/Vhornets/brackets-builder).
