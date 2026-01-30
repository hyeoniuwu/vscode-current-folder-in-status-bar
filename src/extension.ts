"use strict";

import * as vsc from "vscode";
import * as path from "path";

const StatusBarItem = vsc.window.createStatusBarItem(vsc.StatusBarAlignment.Left, 10);

let SHOW_Q = vsc.workspace.getConfiguration("current-folder-in-status-bar").get("show");
let FILENAME_Q = vsc.workspace.getConfiguration("current-folder-in-status-bar").get("include_filename");

let activeUri: vsc.Uri | undefined;

function update_var(variable: any, var_identifier: string, configChange: vsc.ConfigurationChangeEvent) : any { return configChange.affectsConfiguration("current-folder-in-status-bar." + var_identifier) ? vsc.workspace.getConfiguration("current-folder-in-status-bar").get(var_identifier) : variable;}

vsc.workspace.onDidChangeConfiguration(configChange =>
{
	SHOW_Q = update_var(SHOW_Q, "show", configChange);
	FILENAME_Q = update_var(FILENAME_Q, "include_filename", configChange);
	onUpdatePath();
});

function extractUriFromTab(tab: vsc.Tab | undefined): vsc.Uri | undefined
{
	if (!tab) return undefined;
	const input: any = tab.input;
	return input?.uri;
}

function onUpdatePath(): void
{
	if (!SHOW_Q || !activeUri)
	{
		StatusBarItem.hide();
		return;
	}

	let filePath = activeUri.fsPath;
	filePath = filePath.charAt(0).toUpperCase() + filePath.slice(1);

	if (!FILENAME_Q)
	{
		filePath = path.dirname(filePath);
	}

	StatusBarItem.text = filePath;
	StatusBarItem.show();
}

export function activate(context: vsc.ExtensionContext)
{
	StatusBarItem.command = "revealFileInOS";
	StatusBarItem.tooltip = "Open containing folder";

	// Initial active tab
	const activeGroup = vsc.window.tabGroups.activeTabGroup;
	activeUri = extractUriFromTab(activeGroup?.activeTab);
	onUpdatePath();

	const tabDisposable = vsc.window.tabGroups.onDidChangeTabs(() =>
	{
		const group = vsc.window.tabGroups.activeTabGroup;
		activeUri = extractUriFromTab(group?.activeTab);
		onUpdatePath();
	});

	const toggle_visibility = vsc.commands.registerCommand(
		"current-folder-in-status-bar.toggle_visibility",
		() =>
		{
			vsc.workspace.getConfiguration("current-folder-in-status-bar")
				.update("show", !SHOW_Q, true);
		}
	);

	context.subscriptions.push(
		StatusBarItem,
		tabDisposable,
		toggle_visibility
	);
}

export function deactivate()
{
	StatusBarItem.dispose();
}
