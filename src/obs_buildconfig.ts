import * as vscode from 'vscode';
import {Builder} from './obs_builder';

export class Repository
{
	name: string;
	architecture: string;
	constructor(name: string, architecture: string)
	{
		this.name =name;
		this.architecture = architecture;
	}
}

export class BuildConfiguration
{
	name: string;
	repos: Repository[];
	specFiles: string[];
	builder: Builder;
	constructor(name: string, repos: Repository[], specFiles: string[], builder: Builder)
	{
		this.name = name;
		this.repos = repos;
		this.specFiles = specFiles;
		this.builder = builder;

	}
}

export class BuildConfigProvider implements vscode.TreeDataProvider<BuilderConfigTreeEntry>{

	private _onDidChangeTreeData: vscode.EventEmitter<BuilderConfigTreeEntry | undefined> = new vscode.EventEmitter<BuilderConfigTreeEntry | undefined>();
	readonly onDidChangeTreeData: vscode.Event<BuilderConfigTreeEntry | undefined> = this._onDidChangeTreeData.event;
	context: vscode.ExtensionContext;
	constructor(context: vscode.ExtensionContext) {
		this.context = context;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: BuilderConfigTreeEntry): vscode.TreeItem {
		return element;
	}

	getChildren(element?: BuilderConfigTreeEntry): Thenable<BuilderConfigTreeEntry[]> {
		if (element) {
			return Promise.resolve([]);
		} else {

			return Promise.resolve(this.getBuildConfigs(this.context));
		}
}
	private getBuildConfigs(context: vscode.ExtensionContext): BuilderConfigTreeEntry[] {

			let configs: BuildConfiguration[] = context.workspaceState.get("BuildConfigurations",[]);
			let tree_configs: BuilderConfigTreeEntry[] = [];
			configs.forEach(element => {
				tree_configs.push(new BuilderConfigTreeEntry(element, element.name,0, undefined));
			});
			return tree_configs;

			}

	}



export class BuilderConfigTreeEntry extends vscode.TreeItem {

	data: BuildConfiguration;
	constructor(
		config: BuildConfiguration,
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.data = config;
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	get description(): string {
		return this.label;
	}

	iconPath =false;

	contextValue = 'config';

}
