"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const assert = __importStar(require("assert"));
const ttm = __importStar(require("azure-pipelines-task-lib/mock-test"));
describe('Sample task tests', function () {
    before(function () {
    });
    after(() => {
    });
    it('should succeed with simple inputs', function (done) {
        this.timeout(0);
        let tp = path.join(__dirname, 'success.js');
        let tr = new ttm.MockTestRunner(tp);
        tr.runAsync().then(() => {
            console.log(tr.stdout);
            console.log(tr.succeeded);
            assert.equal(tr.succeeded, true, 'should have succeeded');
            assert.equal(tr.warningIssues.length, 0, "should have no warnings");
            assert.equal(tr.errorIssues.length, 0, "should have no errors");
            assert.equal(tr.stdout.indexOf('sent') >= 0, true, "should display 'sent'");
            done();
        }).catch((error) => {
            done(error); // Ensure the test case fails if there's an error
        });
    });
    /*
        it('it should fail if tool validates invalid JSON file', function(done: Mocha.Done) {
            this.timeout(0);
        
            let tp = path.join(__dirname, 'failure.js');
            let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        
            tr.runAsync().then(() => {
                console.log(tr.succeeded);
                assert.equal(tr.succeeded, false, 'should have failed');
                assert.equal(tr.errorIssues.length > 0, true, "should have error issues");
                assert.equal(tr.stdout.indexOf('The file content is not a valid JSON')>=0, true, "Should display 'The file content is not a valid JSON'");
                done();
            }).catch((error) => {
                done(error); // Ensure the test case fails if there's an error
            });
        });  */
});
