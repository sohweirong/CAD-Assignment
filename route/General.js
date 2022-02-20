const router = require('express').Router();
const {ScanCommand} = require("@aws-sdk/client-dynamodb");
const { client: dynamodbClient, commonListItem, commonGetItem } = require("../api/dynamoDBCommonAPI");
const { runSubscribe } = require("../api/snsAPI");

const [todayDate, _] = require("../helper/dateToday");

router.get(["/","/home"],(req,res) => {
    const currentpage = 'home';
    const title = "Home";
    const dynamodbParam = {};
    if (!req.session.user) {        
        dynamodbParam["FilterExpression"] = "#status = :status";
        dynamodbParam["ExpressionAttributeNames"] = {"#status": "status"};
        dynamodbParam["ExpressionAttributeValues"] = {":status":{"S": "PENDING"}};
    };
    const dataForFrontend = {
        currentpage,
        title,
        todayDate
    };

    commonListItem(dynamodbParam).then(dyanomodbResult => {
        dynamodbClient.send(new ScanCommand({
            TableName: "191382s-cad-category"
        })).then(categoryResult => {
            dataForFrontend["data"] = dyanomodbResult.Items;
            dataForFrontend["categories"] = categoryResult.Items.map(x => x.genre.S);
            return res.render("components/home", dataForFrontend);
        }).catch(err => {
            console.log(err);
            return res.render("components/home", dataForFrontend);
        });
    }).catch(err => {
        console.log(err);
        return res.render("components/home", dataForFrontend);
    });
});

router.post("/", (req,res) => {
    const currentpage = 'home';
    const title = "Home";
    const {search, category, status, date} = req.body;
    let filterExp = "";
    let attrName = {};
    let attrVal = {};

    if (search.length > 0) {
        filterExp += "begins_with(#search,:search)";
        attrName["#search"] = "itemName";
        attrVal[":search"] = { "S": search };
    };

    if (category && category !== "ALL") {
        if (search.length > 0) {
            filterExp += " AND #category = :category";
        } else {
            filterExp += "#category = :category";
        };

        attrName["#category"] = "category";
        attrVal[":category"] = { "S": category }
    };

    if (status && status !== "ALL") {
        if ((search.length > 0) || (category && category !== "ALL")) {
            filterExp += " AND #status = :status";
        } else {
            filterExp += "#status = :status";
        };
        
        attrName["#status"] = "status";
        attrVal[":status"] = { "S": status };
    } else if (!status && !req.session.user) {
        if ((search.length > 0) || (category && category !== "ALL")) {
            filterExp += " AND #status = :status";
        } else {
            filterExp += "#status = :status";
        };
        
        attrName["#status"] = "status";
        attrVal[":status"] = { "S": "PENDING" };
    };

    if (date.length > 0){
        if ((search.length > 0) || (category && category !== "ALL") || (status && status !== "ALL")) {
            filterExp += " AND #date = :date";
        } else {
            filterExp += "#date = :date";
        };
        
        attrName["#date"] = "lostDate";
        attrVal[":date"] = { "S": date };
    };

    if (Object.keys(req.body).length < 1) {
        return res.redirect("/");
    } else {
        const dynamodbParam = {};
        if (filterExp.length > 0) {
            dynamodbParam["FilterExpression"] = filterExp;
            dynamodbParam["ExpressionAttributeNames"] = attrName;
            dynamodbParam["ExpressionAttributeValues"] = attrVal;
        }

        const dataForFrontend = {
            currentpage,
            title,
            todayDate,
            currentGenre: category,
            status: status,
            search: search,
            filterDate: date
        };

        commonListItem(dynamodbParam).then(dyanomodbResult => {
            dynamodbClient.send(new ScanCommand({
                TableName: "191382s-cad-category"
            })).then(categoryResult => {
                dataForFrontend["data"] = dyanomodbResult.Items;
                dataForFrontend["categories"] = categoryResult.Items.map(x => x.genre.S);
                return res.render("components/home", dataForFrontend);
            }).catch(err => {
                console.log(err);
                return res.render("components/home", dataForFrontend);
            });
        }).catch(err => {
            console.log(err);
            return res.render("components/home", dataForFrontend);
        });
    };
});

router.get("/about", (req,res) => {
    return res.render("components/about");
});

router.post("/addnotif", (req,res) => {
    const {notificationEmail} = req.body;

    runSubscribe({
        TopicArn: "arn:aws:sns:us-east-1:832581092596:misplaced",
        Protocol: "email",
        Endpoint: notificationEmail
    }).then(resp => {
        return res.status(200).json({
            result: resp,
            error: null
        })
    }).catch(err => {
        return res.status(500).json({
            result: null,
            error: err
        });
    });
});

router.post("/getitem",(req,res) => {
    const {case_id} = req.body;
    const dynamodbParam = {
        Key: {
            case_id: {
                S: case_id
            }
        }
    };

    commonGetItem(dynamodbParam).then(resp => {
        return res.status(200).json({
            result: resp.Item,
            error: null
        });
    }).catch(error => {
        return res.status(500).json({
            result: null,
            error: error
        });
    });
});

module.exports = router;