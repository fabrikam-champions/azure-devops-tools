import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('filePath', 'D:/sample.txt');
tmr.setInput('validateContent','false');
tmr.setInput('topic', 'test_topic');
tmr.setInput('key','test-key');
tmr.setInput('headers','{}');
tmr.setInput('kafkaConfig','{"brokers":["10.1.53.103:32102", "10.1.53.104:32102"],  "ssl": { "rejectUnauthorized": false, "ca": "D:/ca.crt" },  "sasl": { "mechanism": "${Kafka.ProducerSettings.Sasl.Mechanism}", "username": "${Kafka.ProducerSettings.SaslUsername}", "password": "${Kafka.ProducerSettings.SaslPassword}"}}');
tmr.setInput('producerConfig','{}');

process.env['Kafka.ProducerSettings.SaslUsername'] = 'kafka-user';
process.env['Kafka.ProducerSettings.SaslPassword'] ='';
process.env['Kafka.ProducerSettings.Sasl.Mechanism'] = 'scram-sha-512';

tmr.run();