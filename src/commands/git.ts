import { execSync } from "child_process";
import * as vscode from "vscode";
import { OriginSource } from "../models/origins";

/**
 * Retrieves the Git origin URL and current branch for a given workspace folder.
 * @param workspaceFolder The path to the workspace folder.
 * @returns A promise that resolves to an object containing the origin URL and branch name.
 *          If the origin URL or branch cannot be determined, they will be undefined.
 */
export const getGitOrigin = async (
  workspaceFolder: string
): Promise<{ origin: string | undefined; branch: string | undefined }> => {
  try {
    const originStdout = execSync("git config --get remote.origin.url", {
      cwd: workspaceFolder,
    });
    const origin = originStdout.toString().trim();

    if (!origin) {
      vscode.window.showInformationMessage("No git origin");
      return { origin: undefined, branch: undefined };
    }

    let branchStdout = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: workspaceFolder,
    });
    let branch = branchStdout.toString().trim();

    // Check if the current branch has been pushed to the remote
    try {
      execSync(`git show-ref --verify --quiet refs/remotes/origin/${branch}`, {
        cwd: workspaceFolder,
      });
    } catch (error) {
      // If the current branch is not pushed, use the HEAD branch name
      branchStdout = execSync(
        "git remote show origin | grep 'HEAD branch' | cut -d' ' -f5",
        { cwd: workspaceFolder }
      );
      branch = branchStdout.toString().trim();
    }

    if (origin.startsWith("https://")) {

      const matches = origin.match(
        /^(https?):\/\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+?)\.git$/
        );

        if (matches) {
          const domain = matches[2];
          const project = matches[4];
          const repo = matches[5];
          return {
            origin: `https://${domain}/projects/${project}/repos/${repo}`,
            branch,
          };
        } else {
          vscode.window.showErrorMessage(
            "Could not convert SSH origin to HTTPS."
          );
          return { origin: undefined, branch: undefined };
        } 
    }

    if (origin.startsWith("ssh://")) {
      // Convert SSH URL to HTTPS
      const matches = origin.match(
        /^ssh:\/\/git@([^:]+):([\d]+)\/([^\/]+)\/(.+?)\.git$/
      );

      if (matches) {
        const domain = matches[1];
        const project = matches[3];
        const repo = matches[4];
        return {
          origin: `https://${domain}/projects/${project}/repos/${repo}`,
          branch,
        };
      } else {
        vscode.window.showErrorMessage(
          "Could not convert SSH origin to HTTPS."
        );
        return { origin: undefined, branch: undefined };
      }
    }

    if (origin.startsWith("git@")) {
      // Convert SSH URL to HTTPS
      const matches = origin.match(/^git@([^:]+):([^\/]+)\/([^\/]+)\.git$/);

      if (matches) {
        const domain = matches[1];
        const project = matches[2];
        const repo = matches[3];
        return { origin: `https://${domain}/${project}/${repo}`, branch };
      } else {
        vscode.window.showErrorMessage(
          "Could not convert SSH origin to HTTPS."
        );
        return { origin: undefined, branch: undefined };
      }
    }

    return { origin, branch };
  } catch (error: any) {
    vscode.window.showErrorMessage(
      "Error getting Git origin or branch: " + error.message
    );
    return { origin: undefined, branch: undefined };
  }
};

/**
 * Retrieves information about the origin, file path, and head branch of the active text editor in the workspace.
 * @returns A promise that resolves to an object containing the file path, git origin, and head branch, or null if the information cannot be retrieved.
 */
export const getOriginInfo = async (): Promise<{
  filePath: string;
  gitOrigin: string;
  headBranch: string;
} | null> => {
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

  const gitInfo = await getGitOrigin(workspaceFolder);

  if (!gitInfo || !gitInfo.origin || !gitInfo.branch) {
    vscode.window.showInformationMessage("Unable to get git origin");
    return null;
  }

  return { filePath, gitOrigin: gitInfo.origin, headBranch: gitInfo.branch };
};

export const getOriginSource = (gitOrigin: string): OriginSource => {
  if (gitOrigin.includes("github.com")) {
    return "github";
  }

  if (gitOrigin.includes("bitbucket.org")) {
    return "bitbucket.org";
  }

  return "self-hosted-bitbucket";
};
