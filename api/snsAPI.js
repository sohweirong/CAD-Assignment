const { SNSClient } = require('@aws-sdk/client-sns');
// const {getParameter} = require('./SSM');
const { credential } = require("../config/setup.js");
const { SubscribeCommand, PublishCommand } = require("@aws-sdk/client-sns");

// Create an Amazon S3 service client object.
const client = new SNSClient(credential);

const runPublish = async (params) => {
    const data = await client.send(new PublishCommand(params));
    return data;
};

const runSubscribe = async (params) => {
    const data = await client.send(new SubscribeCommand(params));
    return data;
};

exports.snsClient = client;
exports.runPublish = runPublish;
exports.runSubscribe = runSubscribe;