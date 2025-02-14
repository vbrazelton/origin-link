// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { GitAPIService } from "./services/git/GitAPI";

import { OriginLink } from "./services/link/OriginLink";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
const gitAPI = new GitAPIService();

const getURL = async (): Promise<any | undefined> => {
  if (!vscode.window.activeTextEditor) {
    vscode.window.showErrorMessage("No active text editor found.");
    return;
  }

  if (!gitAPI) {
    vscode.window.showErrorMessage("Git extension not found.");
    return;
  }

  return new OriginLink(
    gitAPI,
    vscode.window.activeTextEditor.selections
  ).getLink();
};

export function activate(context: vscode.ExtensionContext) {
  console.log('"origin-link" is now active!');
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "origin-link.getOriginLinkAtLine",
      async () => {
        const url = await getURL();
        if (!url) {
          return;
        }
        await vscode.env.clipboard.writeText(url);
        vscode.window.showInformationMessage(
          "Origin Link copied to clipboard."
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "origin-link.openOriginLinkAtLine",
      async () => {
        const url = await getURL();
        if (!url) {
          return;
        }
        await vscode.env.openExternal(vscode.Uri.parse(url));
        vscode.window.showInformationMessage("Origin Link Opened");
      }
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
