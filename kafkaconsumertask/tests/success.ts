import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import fs from "fs";

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);


tmr.setInput('topic', 'test_topic');
tmr.setInput('kafkaConfig','{"brokers":["192.168.1.60:31661"]}');
tmr.setInput('consumerConfig','{"groupId":"test_group_id"}');
tmr.setInput('filters','{"headers":{"module":"test_module"}}');

tmr.run();