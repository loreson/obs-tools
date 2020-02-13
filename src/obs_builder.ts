import * as vscode from 'vscode';


export class Builder
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
export class BuilderProvider implements vscode.TreeDataProvider<BuilderTreeEntry>{

	private _onDidChangeTreeData: vscode.EventEmitter<BuilderTreeEntry | undefined> = new vscode.EventEmitter<BuilderTreeEntry | undefined>();
	readonly onDidChangeTreeData: vscode.Event<BuilderTreeEntry | undefined> = this._onDidChangeTreeData.event;
	context: vscode.ExtensionContext;
	constructor(context: vscode.ExtensionContext) {
		this.context = context;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: BuilderTreeEntry): vscode.TreeItem {
		return element;
	}

	getChildren(element?: BuilderTreeEntry): Thenable<BuilderTreeEntry[]> {
		if (element) {
			return Promise.resolve([]);
		} else {

			return Promise.resolve(this.getBuilders(this.context));
		}

	}

	private getBuilders(context: vscode.ExtensionContext): BuilderTreeEntry[] {

		let builders: Builder[] = context.globalState.get("builders",[]);
		let tree_builders: BuilderTreeEntry[] = [];
		builders.forEach(element => {
			tree_builders.push(new BuilderTreeEntry(element.name,0, undefined));
		});
		return tree_builders;

	}
}


export class BuilderTreeEntry extends vscode.TreeItem {


	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	get tooltip(): string {
		return `${this.label}`;
	}

	get description(): string {
		return this.label;
	}

	iconPath =false;

	contextValue = 'builder';

}
