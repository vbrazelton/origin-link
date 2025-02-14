import * as vscode from "vscode";
import { GitAPIService } from "../git/GitAPI";
export class OriginLink {
  constructor(
    private gitAPI: GitAPIService,
    private readonly selections: readonly vscode.Selection[]
  ) {}

  private getRanges = (): string => {
    switch (this.gitAPI.getRemoteProvider()) {
      case "github":
        return this.selections
          .map((selection: vscode.Selection) => {
            if (selection.isSingleLine) {
              return `L${selection.start.line + 1}`;
            } else {
              return `L${selection.start.line + 1}-L${selection.end.line + 1}`;
            }
          })
          .join(",");
      case "bitbucket.org":
        return this.selections
          .map((selection: vscode.Selection, index) => {
            if (selection.isSingleLine) {
              return `lines-${selection.start.line + 1}`;
            } else {
              if (index === 0) {
                return `lines-${selection.start.line + 1}:${
                  selection.end.line + 1
                }`;
              } else {
                return `${selection.start.line + 1}:${selection.end.line + 1}`;
              }
            }
          })
          .join(",");
      default:
        return this.selections
          .map((selection: vscode.Selection) => {
            if (selection.isSingleLine) {
              return `${selection.start.line + 1}`;
            } else {
              return `${selection.start.line + 1}-${selection.end.line + 1}`;
            }
          })
          .join(",");
    }
  };

  private removeUsernameFromGitUrl = (url: string): string => {
    return url.replace(/(https?:\/\/)[^\/]+@/, "$1");
  };

  private normalizeRemoteURL = (url: string): string => {
    if (url.startsWith("ssh://")) {
      url = url
        .replace(/:/g, "/")
        .replace("ssh///", "https://")
        .replace("git@", "");
    }

    if (url.startsWith("git@")) {
      url = url.replace(/:/g, "/").replace("git@", "https://");
    }

    const remoteProvider = this.gitAPI.getRemoteProvider();

    if (remoteProvider === "github") {
      url = this.removeUsernameFromGitUrl(url);
    }

    return url;
  };

  private splitRemoteURL = (url: string): string[] => {
    return url
      .replace("//", "/") // remove double slashes so that we can split on single slash
      .replace(/\/$/, "") // remove trailing slash
      .replace(/\.git?$/, "") // remove .git or .git/ from the end
      .split("/");
  };

  private constructURL = (
    urlParts: string[],
    branch: string,
    path: string,
    ranges: string
  ): string => {
    switch (this.gitAPI.getRemoteProvider()) {
      case "bitbucket.org":
        return `${urlParts[0]}//${urlParts[1]}/${urlParts[2]}/${urlParts[3]}/src/${branch}${path}#${ranges}`;
      case "self-hosted-bitbucket":
        return `${urlParts[0]}//${urlParts[1]}/projects/${urlParts[3]}/repos/${urlParts[4]}/browse${path}?at=${branch}#${ranges}`;
      case "github":
        return `${urlParts[0]}//${urlParts[1]}/${urlParts[2]}/${urlParts[3]}/blob/${branch}${path}#${ranges}`;
      default:
        return "";
    }
  };

  private getActiveFile = (): string | null => {
    if (
      !vscode.workspace.workspaceFolders ||
      vscode.workspace.workspaceFolders.length === 0
    ) {
      vscode.window.showErrorMessage("No workspace folder found.");
      return null;
    }

    if (!vscode.window.activeTextEditor) {
      vscode.window.showErrorMessage("No workspace folder found.");
      return null;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = vscode.window.activeTextEditor.document.uri.fsPath.replace(
      workspaceFolder,
      ""
    );

    return filePath;
  };

  public getLink = (): string => {
    const url = this.gitAPI.getRemote()?.fetchUrl;

    if (!url) {
      return "";
    }

    const normalizedURL = this.normalizeRemoteURL(url);

    const urlParts = this.splitRemoteURL(normalizedURL);

    const ranges = this.getRanges();

    const branch = this.gitAPI!.getCurrentBranch();

    if (!branch) {
      return "";
    }

    const activeFile = this.getActiveFile();

    if (!activeFile) {
      return "";
    }

    return this.constructURL(urlParts, branch.name, activeFile, ranges);
  };
}
