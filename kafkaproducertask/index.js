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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const tl = __importStar(require("azure-pipelines-task-lib"));
const fs_1 = __importDefault(require("fs"));
const kafkajs_1 = require("kafkajs");
class TaskConfig {
    filePath = '';
    validateContent = true;
    topic = '';
    key = '';
    headers = '';
    kafkaConfig = '';
    producerConfig = '';
}
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    }
    catch (e) {
        if (e instanceof SyntaxError) {
            return false;
        }
    }
    return false;
}
function variablesToObject(arr) {
    return arr.reduce((obj, item) => {
        obj[item.name] = item.value;
        return obj;
    }, {});
}
function substitute(str, vars) {
    let result = str;
    for (const key in vars) {
        result = result.replace(`\${${key}}`, vars[key]);
    }
    return result;
}
function getFileNameWithoutExtension(filePath) {
    const parts = filePath.split(/[/\\]/);
    const fileName = parts[parts.length - 1];
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1) {
        return fileName;
    }
    return fileName.substring(0, dotIndex);
}
const run = async () => {
    //Get pipeline variables
    const vars = tl.getVariables().length ? variablesToObject(tl.getVariables()) : process.env;
    //Set config
    const taskConfig = new TaskConfig();
    taskConfig.filePath = tl.getInput('filePath') || '';
    taskConfig.validateContent = tl.getBoolInput('validateContent');
    taskConfig.topic = tl.getInput('topic') || '';
    taskConfig.key = tl.getInput('key') || '';
    taskConfig.headers = tl.getInput('headers') || '{}';
    taskConfig.kafkaConfig = tl.getInput('kafkaConfig') || '{}';
    taskConfig.producerConfig = tl.getInput('producerConfig') || '{}';
    //Find files
    const files = tl.findMatch('', taskConfig.filePath);
    //If no files found, return
    if (!files.length) {
        console.log("No files match the specified path.");
        return;
    }
    //Validate Headers JSON Object
    if (!isValidJSON(taskConfig.headers)) {
        console.error(`The task headers is not a valid JSON. Headers: ${taskConfig.headers}`);
        tl.setResult(tl.TaskResult.Failed, `The task headers is not a valid JSON. Headers: ${taskConfig.headers}`);
    }
    //Validate JSON content
    if (taskConfig.validateContent) {
        var hasInvalidJSON = false;
        for (const file of files) {
            const content = await fs_1.default.promises.readFile(file, "utf8");
            if (!isValidJSON(content)) {
                hasInvalidJSON = true;
                console.error(`The file content is not a valid JSON. File: ${file}`);
                tl.setResult(tl.TaskResult.Failed, `The file content is not a valid JSON. File: ${file}`);
            }
        }
        if (hasInvalidJSON) {
            return;
        }
    }
    const kafkaConfig = JSON.parse(substitute(taskConfig.kafkaConfig, vars));
    if (kafkaConfig?.ssl?.ca) {
        kafkaConfig.ssl.ca = [fs_1.default.readFileSync(kafkaConfig.ssl.ca, 'utf-8')];
    }
    const kafka = new kafkajs_1.Kafka(kafkaConfig);
    const producerConfig = JSON.parse(substitute(taskConfig.producerConfig, vars));
    const producer = kafka.producer(producerConfig);
    try {
        await producer.connect();
        for (const file of files) {
            const content = await fs_1.default.promises.readFile(file, "utf8");
            const fileName = getFileNameWithoutExtension(file);
            const obj = { "fileName": fileName, ...vars };
            const topic = substitute(taskConfig.topic, obj);
            const key = substitute(taskConfig.key, obj);
            const headers = JSON.parse(substitute(taskConfig.headers, obj));
            console.info(`Producing the content of ${file} to ${topic}`);
            await producer.send({
                topic: topic,
                compression: kafkajs_1.CompressionTypes.GZIP,
                messages: [
                    { headers: headers,
                        key: key,
                        value: content
                    }
                ]
            });
        }
        console.log('Kafka messages sent!');
        let fileNames = files.map((file) => getFileNameWithoutExtension(file));
        tl.setVariable("filePaths", JSON.stringify(files), false, true);
        tl.setVariable("fileNames", JSON.stringify(fileNames), false, true);
        tl.setVariable("filesCount", files.length.toString(), false, true);
        tl.setResult(tl.TaskResult.Succeeded, 'Kafka messages sent!');
    }
    catch (err) {
        console.error(`[producer-error] ${err.message}`, err);
        tl.setResult(tl.TaskResult.Failed, `Error sending message: ${err.message}`);
    }
    finally {
        await producer.disconnect();
    }
};
run();
