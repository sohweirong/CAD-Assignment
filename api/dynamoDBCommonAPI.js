const { 
    DynamoDBClient,
    PutItemCommand,
    GetItemCommand,
    ScanCommand,
    UpdateItemCommand,
    DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const credential = require("../config/setup");

const client = new DynamoDBClient(credential);
const tablename = "191382s-cad";

const commonPutItem = async (addParams) => {
    const params = {
        TableName: tablename,
        ...addParams
    };

    const command = new PutItemCommand(params);

    try {
        const data = await client.send(command);
        return data;
    } catch (err) {
        return err;
    };
};

const commonUpdateItem = async (addParams) => {
    const params = {
        TableName: tablename,
        ...addParams
    };

    const command = new UpdateItemCommand(params);

    try {
        const data = await client.send(command);
        return data;
    } catch (err) {
        return err;
    };
};

const commonDeleteItem = async (addParams) => {
    const params = {
        TableName: tablename,
        ...addParams
    };

    const command = new DeleteItemCommand(params);

    try {
        const data = await client.send(command);
        return data;
    } catch (err) {
        return err;
    };
};

const commonListItem = async (addParams) => {
    const params = {
        TableName: tablename,
        ...addParams
    };

    const command = new ScanCommand(params);

    try {
        const data = await client.send(command);
        return data;
    } catch (err) {
        return err;
    };
};

const commonGetItem = async (addParams) => {
    const params = {
        TableName: tablename,
        ...addParams
    };

    const command = new GetItemCommand(params);

    try {
        const data = await client.send(command);
        return data;
    } catch (err) {
        return err;
    };
};

exports.client = client;
exports.commonPutItem = commonPutItem;
exports.commonGetItem = commonGetItem;
exports.commonListItem = commonListItem;
exports.commonDeleteItem = commonDeleteItem;
exports.commonUpdateItem = commonUpdateItem;