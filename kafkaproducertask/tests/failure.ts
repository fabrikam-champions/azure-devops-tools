import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('filePath', 'D:\\sample.txt');
tmr.setInput('validateContent','true');
tmr.setInput('topic', 'test_topic');
tmr.setInput('key','test-key');
tmr.setInput('headers','{}');
tmr.setInput('kafkaConfig','{"brokers":["192.168.1.60:31661"]}');
tmr.setInput('producerConfig','{}');

tmr.run();