// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AsyncResource } from 'async_hooks';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "obs-tools" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.create_OBS_Builder', () => {
		// The code you place here will be executed every time your command is executed
		create_OBS_Builder(context);
		// Display a message box to the user

	});

	context.subscriptions.push(disposable);
}

async function create_OBS_Builder(context: vscode.ExtensionContext)
{

	const builder_name = await vscode.window.showInputBox({
		value: "The builders name (must be unique)",
		placeHolder: "builder_17",
		validateInput: text => {
			//whole line without whitespaces
			let exp = RegExp('^[^\s]+$');
			if(text.includes(" "))
			{
				return "name may not contain spaces";
			}
			else
			{
				return null;
			}
		}

	});


	const remote_local = await vscode.window.showQuickPick(
							['local','remote'],
							{placeHolder: 'Select if builder will be local or remote'});


	let remote_host;
	if(remote_local === undefined)
	{
		vscode.window.showErrorMessage('got no local / remote selection');
		return;
	}
	if(remote_local === 'remote')
	{
		vscode.window.showWarningMessage("Remote not yet supported :(");
	}

	const buildroot = await vscode.window.showInputBox({
		value: "enter the buildroot",
		placeHolder: "/var/tmp/",
		validateInput: text => {
			if(text === "")
			{
				return "path may not be empty";
			}
			else if(text === "/")
			{
				return "this seems to be a realy bad idea";
			}
			else if(text.includes(" "))
			{
				return "path may not contain spaces";
			}
			else
			{
				return null;
			}
		}
	});

	context.globalState.update("builder_name", builder_name);
	context.globalState.update("buildroot", buildroot);

}
// this method is called when your extension is deactivated
export function deactivate() {}
