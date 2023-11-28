import * as assert from 'assert';
import * as vscode from 'vscode';
import { getRanges } from '../../commands/links';
import { OriginSource } from '../../models/origins';

suite('getRanges', () => {
    const selections: vscode.Selection[] = [
        new vscode.Selection(5, 0, 5, 0),
        new vscode.Selection(9, 0, 19, 0),
        new vscode.Selection(25, 0, 25, 0)
    ];

    test('should return single line ranges for GitHub origin', () => {
        const originSource = 'github';
        const expectedRanges = 'L6,L10-L20,L26';
        const actualRanges = getRanges(selections, originSource);
        assert.strictEqual(actualRanges, expectedRanges);
    });

    test('should return single line ranges for non-GitHub origin', () => {
        const originSource = 'other' as OriginSource; // doing on purpose to test non-GitHub origin
        const expectedRanges = '6,10-20,26';
        const actualRanges = getRanges(selections, originSource);
        assert.strictEqual(actualRanges, expectedRanges);
    });
});