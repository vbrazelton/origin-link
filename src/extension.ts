// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {execSync} from 'child_process';

import { OriginSource } from './models/origins';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export const createLink = (originInfo: {filePath: string, gitOrigin: string, headBranch: string | undefined }, ranges: string, isGithub: boolean): string => {
    if (!originInfo.gitOrigin) {
        return '';
    }

    let url = originInfo.gitOrigin;
    
    if (url.startsWith('ssh://')) {
        url = url.replace(/:/g, '/').replace('ssh///', 'https://').replace('git@', '');
    }

    const urlParts = url.replace('//','/') // remove double slashes so that we can split on single slash
                        .replace(/\/$/, '') // remove trailing slash
                        .replace(/\.git?$/, '') // remove .git or .git/ from the end
                        .split('/');
            
    if(isGithub){
        return `${urlParts[0]}//${urlParts[1]}/${urlParts[2]}/${urlParts[3]}/blob/${originInfo.headBranch}${originInfo.filePath}#${ranges}`;
    }
    return `${urlParts[0]}//${urlParts[1]}/projects/${urlParts[3]}/${urlParts[4]}/${urlParts[5]}/browse${originInfo.filePath}#${ranges}`; 
  };
  
export const getGitOrigin = async (workspaceFolder: string): Promise<{ origin: string | undefined; branch: string | undefined }> => {
    try {
        const originStdout = execSync('git config --get remote.origin.url', { cwd: workspaceFolder });
        const origin = originStdout.toString().trim();

        if (!origin) {
            vscode.window.showInformationMessage('No git origin');
            return { origin: undefined, branch: undefined };
        }

        let branchStdout = execSync('git rev-parse --abbrev-ref HEAD', { cwd: workspaceFolder });
        let branch = branchStdout.toString().trim();

        // Check if the current branch has been pushed to the remote
        try {
            execSync(`git show-ref --verify --quiet refs/remotes/origin/${branch}`, { cwd: workspaceFolder });
        } catch (error) {
            // If the current branch is not pushed, use the HEAD branch name
            branchStdout = execSync('git remote show origin | grep \'HEAD branch\' | cut -d\' \' -f5', { cwd: workspaceFolder });
            branch = branchStdout.toString().trim();
        }

        if (origin.startsWith('ssh://')) {
            // Convert SSH URL to HTTPS
            const matches = origin.match(/^ssh:\/\/git@([^:]+):([\d]+)\/([^\/]+)\/([^\.]+).git$/);
            console.log('matches: ', matches);
            if (matches) {
                const domain = matches[1];
                const project = matches[3];
                const repo = matches[4];
                return { origin: `https://${domain}/projects/${project}/repos/${repo}`, branch };
            } else {
                vscode.window.showErrorMessage('Could not convert SSH origin to HTTPS.');
                return { origin: undefined, branch: undefined };
            }
        }

        if (origin.startsWith('git@')) {
            // Convert SSH URL to HTTPS
            const matches = origin.match(/^git@([^:]+):([^\/]+)\/([^\/]+).git$/);
            
            if (matches) {
                console.log('matches: ', matches);
                const domain = matches[1];
                const project = matches[2];
                const repo = matches[3];
                return { origin: `https://${domain}/${project}/${repo}`, branch };
            } else {
                vscode.window.showErrorMessage('Could not convert SSH origin to HTTPS.');
                return { origin: undefined, branch: undefined };
            }
        }

        return { origin, branch };
    } catch (error: any) {
        vscode.window.showErrorMessage('Error getting Git origin or branch: ' + error.message);
        return { origin: undefined, branch: undefined };
    }
};


const getOriginInfo = async (): Promise<{filePath: string, gitOrigin: string, headBranch: string} | null> => {

	if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0){
		vscode.window.showErrorMessage('No workspace folder found.');
		return null;
	}

	if (!vscode.window.activeTextEditor){
		vscode.window.showErrorMessage('No workspace folder found.');
		return null;
	}

	const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const filePath = vscode.window.activeTextEditor.document.uri.fsPath.replace(workspaceFolder,'');
	console.log(filePath);
	const gitInfo = await getGitOrigin(workspaceFolder);

	if(!gitInfo || !gitInfo.origin || !gitInfo.branch){
		vscode.window.showInformationMessage('Unable to get git origin');
		return null;
	}

	return { filePath, gitOrigin: gitInfo.origin, headBranch: gitInfo.branch };
}; 


const getRanges = (editor: vscode.TextEditor, originSource: OriginSource): string => {
    if(originSource === 'github'){
        return editor.selections.map((selection: vscode.Selection) => {
            if(selection.isSingleLine){
                return `L${selection.start.line +1}`;
            }
            else {return `L${selection.start.line +1}-L${selection.end.line +1}`;};
        }).join(',');
    } else {
        return editor.selections.map((selection: vscode.Selection) => {
            if(selection.isSingleLine){
                return `${selection.start.line +1}`;
            }
            else {return `${selection.start.line +1}-${selection.end.line +1}`;};
        }).join(',');
    }
};

const getOriginSource = (gitOrigin: string): OriginSource => {
    return gitOrigin.includes('github.com') ? 'github' : 'bitbucket';
};

const disposable =  vscode.commands.registerCommand('origin-link.getOriginLinkAtLine', async () => {
    
    const originInfo = await getOriginInfo();
    
	if(!originInfo || !originInfo.gitOrigin || !originInfo.filePath){
        vscode.window.showInformationMessage('Unable to get git origin');
		return;
	}
    
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const originSource = getOriginSource(originInfo.gitOrigin);

    const ranges = getRanges(editor, originSource);

    const isGithub = originInfo.gitOrigin.includes('github.com');

    const url = createLink(originInfo, ranges, isGithub);

	await vscode.env.clipboard.writeText(url);
	vscode.window.showInformationMessage('Origin Link copied to clipboard.');
  });

  const disposable2 =  vscode.commands.registerCommand('origin-link.openOriginLinkAtLine', async () => {
    const originInfo = await getOriginInfo();

	if(!originInfo || !originInfo.gitOrigin || !originInfo.filePath){
		vscode.window.showInformationMessage('Unable to get git origin');
		return;
	}

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const originSource = getOriginSource(originInfo.gitOrigin);

    const ranges = getRanges(editor, originSource);

    const isGithub = originInfo.gitOrigin.includes('github.com');

	const url = createLink(originInfo, ranges, isGithub);
	await vscode.env.openExternal(vscode.Uri.parse(url));
	vscode.window.showInformationMessage('Origin Link copied to clipboard.');
  });


export function activate(context: vscode.ExtensionContext) {
	console.log('"origin-link" is now active!');
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
