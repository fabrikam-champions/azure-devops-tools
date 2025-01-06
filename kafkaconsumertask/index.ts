// Import dependencies
import * as tl from "azure-pipelines-task-lib";
import fs from "fs";
import { IHeaders, Kafka, KafkaMessage } from 'kafkajs';

class TaskConfig {
    topic: string = '';
    kafkaConfig: string = '';
    consumerConfig: string = '';
    filters: string = '';
    count: string = '1';
}
function isValidJSON (str: string) : boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      if (e instanceof SyntaxError) {
        return false;
      }
    }
    return false;
}

function variablesToObject(arr: tl.VariableInfo[]): Record<string, string> {
    return arr.reduce((obj, item) => {
      obj[item.name] = item.value;
      return obj;
    }, {} as Record<string, string>);
}
function substitute(str: string, vars: any): string {
    let result = str;
    for (const key in vars) {
      result = result.replace(`\${${key}}`, vars[key]);
    }
    return result;
  }
function isSubset(superObj:any, subObj:any) : boolean {
    return Object.keys(subObj).every(ele => {
        if (typeof subObj[ele] == 'object') {
            return isSubset(superObj[ele], subObj[ele]);
        }
        return subObj[ele] == superObj[ele]
    });
}
function stringifyBufferValues(obj:any) : any {
    if(obj == undefined)
        return {};
    let result : any = {};
    Object.keys(obj).forEach(key => {
        result[key] = obj[key]?.toString();
    });
    return result;
}
const run = async()=> {
    //Get pipeline variables
    const vars = tl.getVariables().length ? variablesToObject(tl.getVariables()) :  process.env;
    //Set config
    const taskConfig = new TaskConfig();
    taskConfig.topic = tl.getInput('topic') || '';
    taskConfig.kafkaConfig = tl.getInput('kafkaConfig') || '{}';
    taskConfig.consumerConfig = tl.getInput('consumerConfig') || '{}';
    taskConfig.filters = tl.getInput('filters') || '{}';
    taskConfig.count = tl.getInput('count') || '1';

    //Validate Filters JSON Object
    if(!isValidJSON(taskConfig.filters)){
        console.error(`The task filters is not a valid JSON. Filters: ${taskConfig.filters}`);
        tl.setResult(tl.TaskResult.Failed, `The task filters is not a valid JSON. Filters: ${taskConfig.filters}`);
    }

    const kafkaConfig = JSON.parse(substitute(taskConfig.kafkaConfig, vars));
    if(kafkaConfig?.ssl?.ca) {
        kafkaConfig.ssl.ca = [fs.readFileSync(kafkaConfig.ssl.ca, 'utf-8')]
    }
    const kafka = new Kafka(kafkaConfig);
    const consumerConfig = JSON.parse(substitute(taskConfig.consumerConfig, vars));
    const filters = JSON.parse(substitute(taskConfig.filters, vars));
    const consumer = kafka.consumer(consumerConfig);
    const count = parseInt(substitute(taskConfig.count, vars));
    let consumed = 0;
    let messages : KafkaMessage[] = [];
    let messageKeys : string[] = [];
    let messageValues : string[] = [];
    let messageHeaders : any[]  = [];

    try
    {
        await consumer.connect();
        await consumer.subscribe({ topics: [taskConfig.topic] })

        await consumer.run({
            eachMessage: async ({ topic, partition, message,heartbeat, pause }) => {
                try
                {
                    const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
                    console.log(`- ${prefix} ${message.key}#${message.value}`);
            
                    if((filters.key == undefined || filters.key == message.key) && (filters.headers == undefined || isSubset(message.headers, filters.headers)))
                    {
                        consumed++;
                        let messageKey = message.key?.toString() || '';
                        let messageValue = message.value?.toString() || '';
                        let messageHeader = stringifyBufferValues(message.headers);
                        messages.push(message)
                        messageKeys.push(messageKey);
                        messageValues.push(messageValue);
                        messageHeaders.push(messageHeader);
                        tl.setVariable("message", JSON.stringify(message),false,true);
                        tl.setVariable("messageKey", messageKey,false,true);
                        tl.setVariable("messageValue", messageValue,false,true);
                        tl.setVariable("messageHeader", JSON.stringify(messageHeader),false,true);
                        tl.setVariable("messages", JSON.stringify(messages),false,true);
                        tl.setVariable("messageKeys", JSON.stringify(messageKeys),false,true);
                        tl.setVariable("messageValues", JSON.stringify(messageValues),false,true);
                        tl.setVariable("messageHeaders", JSON.stringify(messageHeaders),false,true);
                        tl.setVariable("messagesCount", consumed.toString(),false,true);

                        if(consumed>=count)
                        {
                            tl.setResult(tl.TaskResult.Succeeded, 'Kafka message received', true);
                            setTimeout(async () => {
                                await consumer.disconnect();
                                process.exit(0);
                            }, 0);
                        }
                    }
                }            
                catch(err:any)
                {
                    console.error(`[consumer-error] ${err.message}`, err);
                    tl.setResult(tl.TaskResult.Failed, `Error processing message: ${err.message}`);
                    process.exit(1);
                }
            }
        });
    }
    catch(err:any){
        console.error(`[consumer-error] ${err.message}`, err);
        tl.setResult(tl.TaskResult.Failed, `Consumer error: ${err.message}`);
        process.exit(1);
    }
}    
run();


