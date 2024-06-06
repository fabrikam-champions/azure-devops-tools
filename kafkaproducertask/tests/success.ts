import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('filePath', 'D:\\sample.txt');
tmr.setInput('validateContent','false');
tmr.setInput('topic', 'test_topic');
tmr.setInput('key','test-key');
tmr.setInput('headers','{}');
tmr.setInput('kafkaConfig','{"brokers":["192.168.1.60:31661"],  "ssl": { "rejectUnauthorized": false, "ca": [fs.readFileSync("kafka-secret/ca.crt", "utf-8")] },  "sasl": { "mechanism": "${Kafka.ProducerSettings.Sasl.Mechanism}", "username": "${Kafka.ConsumerSettings.SaslUsername}", "password": "${Kafka.ConsumerSettings.SaslPassword}"}}');
tmr.setInput('producerConfig','{}');
tmr.setVariableName('Kafka.ProducerSettings.SaslUsername','kafka-user');
tmr.setVariableName('Kafka.ProducerSettings.SaslPassword','*****');
tmr.setVariableName('Kafka.ProducerSettings.Sasl.Mechanism','scram-sha-512');

tmr.run();