"use strict";

import * as vsc from "vscode";
import * as path from 'path';

const StatusBarItem = vsc.window.createStatusBarItem(vsc.StatusBarAlignment.Left, 10);

let SHOW_Q = vsc.workspace.getConfiguration("current-folder-in-status-bar").get("show");
let FILENAME_Q = vsc.workspace.getConfiguration("current-folder-in-status-bar").get("include_filename");

function update_var(variable: any, var_identifier: string, configChange: vsc.ConfigurationChangeEvent): any
{
	return configChange.affectsConfiguration("current-folder-in-status-bar."+var_identifier) ? vsc.workspace.getConfiguration("current-folder-in-status-bar").get(var_identifier) : variable
}

vsc.workspace.onDidChangeConfiguration
(
	configChange => 
	{
		SHOW_Q=update_var(SHOW_Q, "show", configChange);
		FILENAME_Q=update_var(FILENAME_Q, "include_filename", configChange);
		onUpdatePath();
	}
);

function onUpdatePath(): void
{
	const editor = vsc.window.activeTextEditor;
	if (!SHOW_Q || editor === undefined)
	{
		StatusBarItem.hide();
	}
	else
	{
		let filePath = editor.document.fileName;
		filePath = filePath.charAt(0).toUpperCase() + filePath.slice(1); // Capitalises drive letters.
		if (!FILENAME_Q) {filePath=path.dirname(filePath)}
		StatusBarItem.text = filePath
		StatusBarItem.show();
	}
};


export function activate(context: vsc.ExtensionContext) {

	StatusBarItem.command = "revealFileInOS";
	StatusBarItem.tooltip = "Open containing folder";

	onUpdatePath();

	const textEditorDisposable = vsc.window.onDidChangeActiveTextEditor(onUpdatePath);

	const toggle_visibility = vsc.commands.registerCommand(
		"current-folder-in-status-bar.toggle_visibility",
		() => {
		  vsc.workspace.getConfiguration("current-folder-in-status-bar").update("show", !SHOW_Q, true);
		}
	  );


	context.subscriptions.concat([textEditorDisposable, toggle_visibility]);
}

export function deactivate()
{
	StatusBarItem.dispose();
}
