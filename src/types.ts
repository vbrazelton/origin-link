import * as vscode from "vscode";

export interface GitExtension {
  getAPI(version: number): GitAPI;
}

export interface GitAPI {
  repositories: Repository[];
}

export interface Repository {
  rootUri: vscode.Uri;
  state: RepositoryState;
}

export interface RepositoryState {
  HEAD: Ref;
  remotes: Remote[];
}

export interface Ref {
  name: string;
  commit: string;
}

export interface Remote {
  name: string;
  fetchUrl: string | undefined;
  pushUrl: string | undefined;
}

export interface GitOrigin {
  origin: string;
  branch: string;
}

export type RemoteProvider =
  | "github"
  | "bitbucket.org"
  | "self-hosted-bitbucket"
  | "gitlab"
  | "custom";
