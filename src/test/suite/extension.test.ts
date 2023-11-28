import * as assert from 'assert';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { createLink, getGitOrigin } from '../../extension';
import sinon = require('sinon');
// import * as myExtension from '../../extension';

// suite('Extension Test Suite', () => {
// 	vscode.window.showInformationMessage('Start all tests.');

// 	test('Sample test', () => {
// 		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
// 		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
// 	});
// });

suite('createBitbucketLink', () => {
    const filepath = '/src/main/java/com/fakecompany/money/analysis/nlp/SentenceBreakerMethod.java';
	
    test('should handle SSH git origins', () => {
		const expectedLink = 'https://git.fakecompany.com/projects/ta/repos/money/browse/src/main/java/com/fakecompany/money/analysis/nlp/SentenceBreakerMethod.java#10';
		const ranges = '10';
        const gitOrigin = 'ssh://git@git.fakecompany.com:7999/ta/money.git';
        const originInfo = { filePath: filepath, gitOrigin, headBranch: 'main' };
        const actualLink = createLink(originInfo, ranges, false);
        assert.strictEqual(actualLink, expectedLink);
    });
  
    test('should handle HTTPS git origins', () => {
		const expectedLink = 'https://git.fakecompany.com/projects/ta/repos/money/browse/src/main/java/com/fakecompany/money/analysis/nlp/SentenceBreakerMethod.java#10';
		const ranges = '10';
        const gitOrigin = 'https://git.fakecompany.com/scm/ta/money.git';
        const originInfo = { filePath: filepath, gitOrigin, headBranch: 'main' };
        const actualLink = createLink(originInfo, ranges, false);
        assert.strictEqual(actualLink, expectedLink);
    });

	test('should handle SSH git origins ranges', () => {
		const expectedLink = 'https://git.fakecompany.com/projects/ta/repos/money/browse/src/main/java/com/fakecompany/money/analysis/nlp/SentenceBreakerMethod.java#10-20';
		const ranges = '10-20';	
        const gitOrigin = 'ssh://git@git.fakecompany.com:7999/ta/money.git';
        const originInfo = { filePath: filepath, gitOrigin, headBranch: 'main' };
        const actualLink = createLink(originInfo, ranges, false);
        assert.strictEqual(actualLink, expectedLink);
    });
  
    test('should handle HTTPS git origins with ranges', () => {
		const expectedLink = 'https://git.fakecompany.com/projects/ta/repos/money/browse/src/main/java/com/fakecompany/money/analysis/nlp/SentenceBreakerMethod.java#10-20';
		const ranges = '10-20';
        const gitOrigin = 'https://git.fakecompany.com/scm/ta/money.git';
        const originInfo = { filePath: filepath, gitOrigin, headBranch: 'main' };
        const actualLink = createLink(originInfo, ranges, false);
        assert.strictEqual(actualLink, expectedLink);
    });

	test('should handle empty gitOrigin', () => {
		const ranges = '10';
		const gitOrigin = '';
		const originInfo = { filePath: filepath, gitOrigin, headBranch: 'main' };
		const actualLink = createLink(originInfo, ranges, false);
		assert.strictEqual(actualLink, '');
	  });
	  
});

suite('getGitHubOrigin', () => {
    const filepath = '/src/api/async_resource.cc';

    test('should handle https gitHubOrigin', () => {
		const expectedLink = 'https://github.com/nodejs/node/blob/main/src/api/async_resource.cc#L6';
		const ranges = 'L6';
        const gitOrigin = 'https://github.com/nodejs/node.git';
        const originInfo = { filePath: filepath, gitOrigin, headBranch: 'main' };
        const actualLink = createLink(originInfo, ranges, true);
        assert.strictEqual(actualLink, expectedLink);
	  });

    test('should handle ssh gitHubOrigin', () => {
        const expectedLink = 'https://github.com/nodejs/node/blob/main/src/api/async_resource.cc#L6';
		const ranges = 'L6';
        const gitOrigin = 'ssh://git@github.com:nodejs/node.git';
        const originInfo = { filePath: filepath, gitOrigin, headBranch: 'main' };
        const actualLink = createLink(originInfo, ranges, true);
        console.log('actualLink: ', actualLink);
        assert.strictEqual(actualLink, expectedLink);
    });
});