import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Sample task tests', function () {

    before( function() {

    });

    after(() => {

    });

    it('should succeed with simple inputs', function(done: Mocha.Done) {
        this.timeout(0);
    
        let tp: string = path.join(__dirname, 'success.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    
        tr.runAsync().then(() => {
            console.log(tr.stdout);
            console.log(tr.succeeded);
            assert.equal(tr.succeeded, true, 'should have succeeded');
            assert.equal(tr.warningIssues.length, 0, "should have no warnings");
            assert.equal(tr.errorIssues.length, 0, "should have no errors");
            assert.equal(tr.stdout.indexOf('received') >= 0, true, "should display 'received'");
            done();
        }).catch((error) => {
            done(error); // Ensure the test case fails if there's an error
        });
    });

    // it('it should fail if timeout', function(done: Mocha.Done) {
    //     this.timeout(0);
    
    //     let tp = path.join(__dirname, 'failure.js');
    //     let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    
    //     tr.runAsync().then(() => {
    //         console.log(tr.succeeded);
    //         assert.equal(tr.succeeded, false, 'should have failed');
    //         assert.equal(tr.errorIssues.length > 0, true, "should have error issues");
    //         assert.equal(tr.stdout.indexOf('Timeout')>=0, true, "Should display 'Timeout error'");
    //         done();
    //     }).catch((error) => {
    //         done(error); // Ensure the test case fails if there's an error
    //     });
    // });  
});