import * as assert from "assert";
import * as vscode from "vscode";
import { OriginLink } from "../../services/link/OriginLink";
import { GitAPIService } from "../../services/git/GitAPI";

suite("OriginLink Tests", () => {
  test("should generate proper GitHub URL", () => {
    // Create a dummy GitAPIService with methods we need
    const dummyGitAPIService: GitAPIService = {
      gitAPI: {
        repositories: [
          {
            rootUri: vscode.Uri.parse("file://test/path"),
            state: {
              HEAD: { name: "main", commit: "dummyCommit" },
              remotes: [],
            },
          },
        ],
      },
      getRemote: () => ({
        name: "origin-link",
        fetchUrl: "https://github.com/vbrazelton/origin-link.git",
        pushUrl: "https://github.com/vbrazelton/origin-link.git",
      }),
      getCurrentBranch: () => ({ name: "main", commit: "dummyCommit" }),
      getRemoteProvider: () => "github",
    };

    // Create a single-line selection (line 0)
    const dummySelection = new vscode.Selection(0, 0, 0, 0);

    // Instantiate the OriginLink using our dummy API and selection
    const originLink = new OriginLink(dummyGitAPIService, [dummySelection]);
    // Stub the getActiveFile method so we bypass the dependency on the active editor
    (originLink as any).getActiveFile = () => "/src/extension.ts";

    const link = originLink.getLink();
    // The expected GitHub URL should be something like:
    // "https://github.com/vbrazelton/origin-link/blob/main/src/extension.ts#L1"
    assert.ok(link.includes("/blob/main/src/extension.ts#L1"));
  });

  test("should generate proper Bitbucket URL", () => {
    const dummyGitAPIService: GitAPIService = {
      gitAPI: {
        repositories: [
          {
            rootUri: vscode.Uri.parse("file://test/path"),
            state: {
              HEAD: { name: "main", commit: "dummyCommit" },
              remotes: [],
            },
          },
        ],
      },
      getRemote: () => ({
        name: "origin-link",
        fetchUrl: "https://bitbucket.org/vbrazelton/origin-link.git",
        pushUrl: "https://bitbucket.org/vbrazelton/origin-link.git",
      }),
      getCurrentBranch: () => ({ name: "main", commit: "dummyCommit" }),
      getRemoteProvider: () => "bitbucket.org",
    };

    const dummySelection = new vscode.Selection(0, 0, 0, 0);
    const originLink = new OriginLink(dummyGitAPIService, [dummySelection]);
    (originLink as any).getActiveFile = () => "/src/extension.ts";

    const link = originLink.getLink();
    // Bitbucket in this case should produce a URL like:
    // "https://bitbucket.org/vbrazelton/origin-link/src/main/src/extension.ts#lines-1"
    assert.ok(link.includes("/src/main/src/extension.ts#lines-1"));
  });

  test("should generate proper self-hosted Bitbucket URL", () => {
    const dummyGitAPIService: GitAPIService = {
      gitAPI: {
        repositories: [],
      },
      getRemote: () => ({
        name: "origin-link",
        fetchUrl: "https://bitbucket.example.com/scm/PRJ/repo.git",
        pushUrl: "https://bitbucket.example.com/scm/PRJ/repo.git",
      }),
      getCurrentBranch: () => ({ name: "main", commit: "dummyCommit" }),
      getRemoteProvider: () => "self-hosted-bitbucket",
    };

    const dummySelection = new vscode.Selection(0, 0, 0, 0);
    const originLink = new OriginLink(dummyGitAPIService, [dummySelection]);
    (originLink as any).getActiveFile = () => "/src/extension.ts";

    const link = originLink.getLink();
    // For self-hosted Bitbucket the URL is built from different URL parts.
    // With a split of "https://bitbucket.example.com/scm/PRJ/repo.git" you expect:
    // ["https:", "bitbucket.example.com", "scm", "PRJ", "repo"]
    // and the resulting URL should be like:
    // "https://bitbucket.example.com/projects/PRJ/repos/repo/browse/src/extension.ts?at=main#1"
    assert.ok(
      link.includes(
        "https://bitbucket.example.com/projects/PRJ/repos/repo/browse/src/extension.ts?at=main#1"
      )
    );
  });

  test("should return empty link when remote info is missing", () => {
    const dummyGitAPIService: GitAPIService = {
      gitAPI: {
        repositories: [],
      },
      getRemote: () => undefined,
      getCurrentBranch: () => undefined,
      getRemoteProvider: () => undefined,
    };

    const dummySelection = new vscode.Selection(0, 0, 0, 0);
    const originLink = new OriginLink(dummyGitAPIService, [dummySelection]);
    (originLink as any).getActiveFile = () => "/src/extension.ts";

    const link = originLink.getLink();
    assert.strictEqual(link, "");
  });

  test("should have registered extension commands", async () => {
    const commands = await vscode.commands.getCommands(true);
    // Log available commands to help debug
    console.log(
      "Available commands:",
      commands.filter((cmd) => cmd.includes("origin-link"))
    );
    assert.ok(commands.includes("origin-link.getOriginLinkAtLine"));
    assert.ok(commands.includes("origin-link.openOriginLinkAtLine"));
  });
});
