import * as vscode from "vscode";
import {
  GitExtension,
  Remote,
  Ref,
  GitOrigin,
  RemoteProvider,
} from "../../types";
import { GitAPI } from "../../types";

export class GitAPIService {
  public readonly gitAPI: GitAPI | undefined;

  constructor() {
    const gitExtension =
      vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
    if (!gitExtension) {
      vscode.window.showErrorMessage("Git extension not found.");
      this.gitAPI = undefined;
    } else {
      this.gitAPI = gitExtension.getAPI(1);
    }
  }

  getRemote(): Remote | undefined {
    if (!this.gitAPI) {
      return undefined;
    }

    return this.gitAPI.repositories[0].state.remotes[0];
  }

  getCurrentBranch(): Ref | undefined {
    if (!this.gitAPI) {
      return undefined;
    }

    return this.gitAPI.repositories[0].state.HEAD;
  }

  getRemoteProvider(): RemoteProvider | undefined {
    const remote = this.getRemote();
    if (!remote) {
      return undefined;
    }

    const origin = remote.fetchUrl || remote.pushUrl;
    if (!origin) {
      return undefined;
    }

    if (origin.includes("github.com")) {
      return "github";
    }

    if (origin.includes("bitbucket.org")) {
      return "bitbucket.org";
    }

    return "self-hosted-bitbucket";
  }
}
