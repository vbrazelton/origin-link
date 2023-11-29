import * as vscode from "vscode";
import { OriginSource } from "../models/origins";
import { getOriginSource } from "./git";

const removeUsernameFromGitUrl = (url: string) => {
  return url.replace(/(https?:\/\/)[^\/]+@/, "$1");
};

/**
 * Creates a link based on the origin information and selections.
 * @param originInfo - The origin information containing the file path, git origin, and head branch.
 * @param selections - The selections made by the user.
 * @returns The generated link.
 */
export const createLink = (
  originInfo: {
    filePath: string;
    gitOrigin: string;
    headBranch: string | undefined;
  },
  selections: readonly vscode.Selection[]
): string => {
  if (!originInfo.gitOrigin) {
    return "";
  }

  let url = originInfo.gitOrigin;

  const gitOriginSource = getOriginSource(url);

  const ranges = getRanges(selections, gitOriginSource);

  if (url.startsWith("ssh://")) {
    url = url
      .replace(/:/g, "/")
      .replace("ssh///", "https://")
      .replace("git@", "");
  }

  if (url.startsWith("git@")) {
    url = url.replace(/:/g, "/").replace("git@", "https://");
  }

  url = removeUsernameFromGitUrl(url);

  const urlParts = url
    .replace("//", "/") // remove double slashes so that we can split on single slash
    .replace(/\/$/, "") // remove trailing slash
    .replace(/\.git?$/, "") // remove .git or .git/ from the end
    .split("/");

  switch (gitOriginSource) {
    case "bitbucket.org":
      console.log("urlParts: ", urlParts);
      return `${urlParts[0]}//${urlParts[1]}/${urlParts[2]}/${urlParts[3]}/src/${originInfo.headBranch}${originInfo.filePath}#${ranges}`;
    case "self-hosted-bitbucket":
      return `${urlParts[0]}//${urlParts[1]}/projects/${urlParts[3]}/${urlParts[4]}/${urlParts[5]}/browse${originInfo.filePath}#${ranges}`;
    case "github":
      return `${urlParts[0]}//${urlParts[1]}/${urlParts[2]}/${urlParts[3]}/blob/${originInfo.headBranch}${originInfo.filePath}#${ranges}`;
    default:
      return "";
  }
};

/**
 * Returns a string representation of the line ranges in the given selections.
 * @param selections - An array of vscode.Selection objects representing the selected ranges.
 * @param originSource - A string indicating the origin source ('github' or other).
 * @returns A string representing the line ranges in the selections.
 */
export const getRanges = (
  selections: readonly vscode.Selection[],
  originSource: OriginSource
): string => {
  switch (originSource) {
    case "github":
      return selections
        .map((selection: vscode.Selection) => {
          if (selection.isSingleLine) {
            return `L${selection.start.line + 1}`;
          } else {
            return `L${selection.start.line + 1}-L${selection.end.line + 1}`;
          }
        })
        .join(",");
    case "bitbucket.org":
      return selections
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
      return selections
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
