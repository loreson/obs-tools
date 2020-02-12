// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { create } from 'domain';
import { reporters } from 'mocha';

class Builder
{
	name: string;
	buildroot: string;
	threads: number;
	constructor(name: string, buildroot: string, threads: number)
	{
		this.name = name;
		this.buildroot = buildroot;
		this.threads = threads;
	}
}

class Repository
{
	name: string;
	architecture: string;
	constructor(name: string, architecture: string)
	{
		this.name =name;
		this.architecture = architecture;
	}
}

class BuildConfiguration
{
	name: string;
	repos: Repository[];
	specFiles: string[];
	constructor(name: string, repos: Repository[], specFiles: string[])
	{
		this.name = name;
		this.repos = repos;
		this.specFiles = specFiles;
	}
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let create_builder = vscode.commands.registerCommand('extension.create_OBS_Builder', () => {
		// The code you place here will be executed every time your command is executed
		create_OBS_Builder(context);
		// Display a message box to the user
	});
	context.subscriptions.push(create_builder);
	let create_buildconf = vscode.commands.registerCommand("extension.create_OBS_Build_Conf",() =>{
		create_OBS_Build_Conf(context);
	});
	context.subscriptions.push(create_buildconf);
	let clear_builder = vscode.commands.registerCommand("extension.clear_OBS_Builders",()=>{
		context.globalState.update("builders", undefined);
		vscode.window.showInformationMessage("cleared OBS builders");
	});
	context.subscriptions.push(clear_builder);
	let clear_build_conf = vscode.commands.registerCommand("extension.clear_OBS_BuildConfs",()=>
	{
		context.globalState.update("BuildConfigurations", undefined);
		vscode.window.showInformationMessage("cleared OBS build configurations");

	});
}


async function create_OBS_Builder(context: vscode.ExtensionContext)
{
	let builder_name:string = "";
	let result = await vscode.window.showInputBox({
		value: "The builders name (must be unique)",
		placeHolder: "builder_17",
		validateInput: text => {
			//whole line without whitespaces
			if(text.includes(" "))
			{
				return "name may not contain spaces";
			}
			else if(text === "")
			{
				return "empty name builder name is invalid";
			}
			else
			{
				return null;
			}
		}

	});
	if(result === undefined)
	{
		vscode.window.showErrorMessage("undefined builder name");
	}
	else
	{
		builder_name = result;
	}

	const remote_local = await vscode.window.showQuickPick(
							['local','remote'],
							{placeHolder: 'Select if builder will be local or remote'});

	if(remote_local === undefined)
	{
		vscode.window.showErrorMessage('got no local / remote selection');
		return;
	}
	if(remote_local === 'remote')
	{
		vscode.window.showWarningMessage("Remote not yet supported :(");
	}
	let builder_threads: number = 0;
	result = await vscode.window.showInputBox({
		value: "Threads to use",
		placeHolder: "4",
		validateInput: text =>
		{
			let exp = RegExp("^[0-9]+$");
			if (exp.test(text))
			{
				return null;
			}
			else
			{
				return "must enter a vaild natural number";
			}
		}
	});
	if( result === undefined)
	{
		vscode.window.showErrorMessage("undefined thread count");
	}
	else
	{
		builder_threads = parseInt(result);
	}

	result = await vscode.window.showInputBox({
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
	let buildroot: string = "";
	if( result === undefined)
	{
		vscode.window.showErrorMessage("undefined buildroot");
	}
	else
	{
		buildroot = result;
	}
	let builder: Builder = new Builder(builder_name, buildroot, builder_threads);
	let builders:Builder[] = context.globalState.get("builders",[]);
	builders.push(builder);
	context.globalState.update("builders", builders);

}

async function create_OBS_Build_Conf(context: vscode.ExtensionContext){
	let name_res = await vscode.window.showInputBox({placeHolder: "Config name"});
	if(name_res === undefined)
	{
		vscode.window.showErrorMessage("undefined config name");
		return;
	}
	else
	{
		var conifg_name = name_res;
	}
	let builders:Builder[]  = context.globalState.get("builders", []);
	if (builders === [])
	{
		vscode.window.showErrorMessage("No OBS builders created");
		return;
	}
	let builder_names: string[] = [];
	for(var i = 0; i< builders.length; i++)
	{
		builder_names.push(builders[i].name);
	}
	let result = await vscode.window.showQuickPick(builder_names,
		{
			canPickMany: false,
			placeHolder: "Select the builder this configuration is for"
		});
	let builder_name = "";
	if (result === undefined)
	{
		vscode.window.showErrorMessage("Undefined builder");
	}
	else{
		builder_name = result;
	}
	let builder:Builder;
	for(var i = 0; i < builders.length; i++)
	{
		if(builder_name  === builders[i].name)
		{
			builder = builders[i];
			break;
		}
	}

	let repostr: string = "";
	const cp = require('child_process');
	result = cp.execSync(
							'osc repos',
							{
								"cwd": vscode.workspace.rootPath
							});
	if(result !== undefined)
	{
		repostr = result.toString();
	}

	let splits = repostr.split("\n");

	let resarray = await vscode.window.showQuickPick(splits,
		{
			canPickMany: true,
			placeHolder: "Select repositories to build for"
		}
	);
	if(resarray === undefined)
	{
		vscode.window.showErrorMessage("undefined repositories");
		return;
	}
	else
	{
		var repo_archs: string[]  = resarray;
	}
	let repositories: Repository[]= [];
	for(var i = 0; i<repo_archs.length; i++)
	{
		let splits: string[] = repo_archs[i].split(" ");
		let repo: string = splits[0];
		let arch: string = splits[splits.length - 1];
		repositories.push(new Repository(repo, arch));
	}
	let files = await vscode.workspace.findFiles('*.spec');
	let specPaths: string[] =[];
	files.forEach(element => {
		specPaths.push(element.fsPath);
	});
	let specResult = await vscode.window.showQuickPick(specPaths,
		{ canPickMany: true, placeHolder:"specfiles to build with this configuration" });
	if(specResult === undefined)
	{
		vscode.window.showErrorMessage("undefind specfiles");
		return;
	}
	else
	{
		var specFiles:string[] = specResult;
	}
	let buildConf: BuildConfiguration = new BuildConfiguration(name_res, repositories, specFiles);
	let buildConfs: BuildConfiguration[] = context.workspaceState.get("BuildConfigurations",[]);
	buildConfs.push(buildConf);
}






// this method is called when your extension is deactivated
export function deactivate() {}
