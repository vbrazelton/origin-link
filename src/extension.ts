// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { createLink } from "./commands/links";
import { getOriginInfo } from "./commands/git";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

const disposable = vscode.commands.registerCommand(
  "origin-link.getOriginLinkAtLine",
  async () => {
    const originInfo = await getOriginInfo();

    if (!originInfo || !originInfo.gitOrigin || !originInfo.filePath) {
      vscode.window.showInformationMessage("Unable to get git origin");
      return;
    }

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const url = createLink(originInfo, editor.selections);

    await vscode.env.clipboard.writeText(url);
    vscode.window.showInformationMessage("Origin Link copied to clipboard.");
  }
);

const disposable2 = vscode.commands.registerCommand(
  "origin-link.openOriginLinkAtLine",
  async () => {
    const originInfo = await getOriginInfo();

    if (!originInfo || !originInfo.gitOrigin || !originInfo.filePath) {
      vscode.window.showInformationMessage("Unable to get git origin");
      return;
    }

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const url = createLink(originInfo, editor.selections);
    await vscode.env.openExternal(vscode.Uri.parse(url));
    vscode.window.showInformationMessage("Origin Link copied to clipboard.");
  }
);

export function activate(context: vscode.ExtensionContext) {
  console.log('"origin-link" is now active!');
  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
