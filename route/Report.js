const router = require('express').Router();
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { userIsValid } = require("../api/cognitoCommonAPI");
const { commonPutItem, commonUpdateItem, commonGetItem } = require("../api/dynamoDBCommonAPI");
const { commonPutObject } = require("../api/s3CommonAPI");

const filefilter = (req, file, cb) => {
    const mimetype = file.mimetype;
    const ext = path.extname(file.originalname).toLowerCase();
    var amt, amt_regex;
    amt = ['image/png', 'image/jpeg', 'image/jpg'];
    amt_regex = /.png|.jpeg|.jpg/;
    if (amt.indexOf(mimetype) > -1 && amt_regex.test(ext)) {
        cb(null, true);
    } else {
        cb(null, false);
    };
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync("./private")) {
            fs.mkdirSync("./private");
            if (!fs.existsSync("./private/tmp")) {
                fs.mkdirSync("./private/tmp");
                cb(null, "./private/tmp");
            };
        } else {
            cb(null, "./private/tmp");
        };
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + Date.now() + ext);
    },
});

const upload = multer({ storage: storage, fileFilter: filefilter }).fields([{ name: 'uploadThumbnail', maxCount: 1 }]);

const [todayDate, timeNow] = require("../helper/dateToday");
const { runPublish } = require('../api/snsAPI');

router.get("/lost", userIsValid, (req, res) => {
    const currentpage = 'lost';
    const title = "Report Lost";

    const dataForFrontend = {
        currentpage,
        title,
        todayDate,
        timeNow
    };

    return res.render("components/lost", dataForFrontend);
});

router.get("/lost/edit/:id", userIsValid, (req,res) => {
    return res.render("components/lost_edit");
});

router.get("/found/:id/", userIsValid, (req, res) => {
    const { id } = req.params;
    const currentpage = 'found';
    const title = "Claim Item";

    if (!id) {
        return res.redirect("/");
    };

    const dynamodbParam = {
        Key: {
            case_id: {
                S: id
            },
        }
    };

    const dataForFrontend = {
        currentpage,
        title,
        todayDate,
        timeNow,
    };

    commonGetItem(dynamodbParam).then(dynamodbResult => {
        if (dynamodbResult.Item.status.S === "COMPLETE") {
            return res.redirect("/");
        };
        dataForFrontend["data"] = dynamodbResult.Item;
        return res.render("components/found", dataForFrontend);
    }).catch(err => {
        console.log("DynamoDB Get Item Error: ",err);
        return res.redirect("/");
    });
});

router.post("/lost", userIsValid, upload, async (req, res) => {
    const { destination, filename, mimetype } = req.files["uploadThumbnail"][0];
    const { lostLocation, lostFloor, lostDate, lostTime, itemName, itemDescription, founderName, founderEmail } = req.body;
    
    // -------------- Data for exception handling --------------
    const currentpage = 'lost';
    const title = "Report Lost";
    const dataForFrontend = {
        currentpage,
        title,
        maxDate: todayDate,
        todayDate: lostDate,
        timeNow: lostTime,
        lostLocation,
        itemName,
        itemDescription,
        founderName,
        founderEmail
    };

    const id = uuidv4();
    // -------------- Data to run params --------------
    const dynamodbParam = {
        Item: {
            case_id: {
                S: id
            },
            status: {
                S: "PENDING"
            },
            lostDate: {
                S: lostDate
            },
            lostTime: {
                S: lostTime
            },
            lostLocation: {
                S: lostLocation
            },
            lostFloor: {
                S: lostFloor
            },
            itemName: {
                S: itemName
            },
            itemDescription: {
                S: itemDescription
            },
            bucket_information: {
                M: {
                    bucketName: {
                        S: "191382s-cad",
                    },
                    key: {
                        S: filename,
                    },
                }
            },
            personnel_information: {
                M: {
                    founderName: {
                        S: founderName
                    },
                    founderEmail: {
                        S: founderEmail.trim().toLowerCase()
                    },
                }
            },
        },
    };
    const s3Param = {
        Bucket: "191382s-cad",
        CacheControl: "max-age=30",
        Key: filename,
        Body: fs.readFileSync(`${destination}/${filename}`),
        ContentType: mimetype,
        Metadata: {
            case_id: id
        },
    };

    commonPutItem(dynamodbParam).then(dynamodbResult => {
        commonPutObject(s3Param).then(s3Result => {
            if (fs.existsSync(`${destination}/${filename}`)) {
                fs.unlinkSync(`${destination}/${filename}`);
            };
            if (dynamodbResult["$metadata"]["httpStatusCode"] === 200 && s3Result["$metadata"]["httpStatusCode"] === 200) {
                runPublish({
                    Subject: "Misplaced - Latest Item Reported",
                    Message: `Hello! A new lost item has been returned to the office.`,
                    TopicArn: "arn:aws:sns:us-east-1:832581092596:misplaced",
                }).then(_ => {
                    return res.redirect("/");
                }).catch(error => {
                    console.log(error);
                    return res.redirect("/");
                });
            } else {
                return res.render("components/lost", dataForFrontend);
            };
        }).catch(err => {
            console.log("S3 Put Object Error: ", err);
            return res.render("components/lost", dataForFrontend);
        });
    }).catch(err => {
        console.log("DynamoDB Put Item Error: ", err);
        return res.render("components/lost", dataForFrontend);
    });
});

router.post("/found/:id", userIsValid, (req, res) => {
    const {id} = req.params;
    const {collectionDate, collectionTime, ownerName, ownerEmail} = req.body;
    
    if (!id) {
        return res.redirect("/");
    };

    if (typeof id === "object") {
        return res.redirect("/");
    };

    const currentpage = 'found';
    const title = "Claim Item";
    const dataForFrontend = {
        currentpage,
        title,
        maxDate: todayDate,
        todayDate: collectionDate,
        timeNow: collectionTime,
        ownerName,
        ownerEmail
    };

    const dynamodbGetParam = {
        Key: {
            case_id: {
                S: id
            },
        }
    };

    commonGetItem(dynamodbGetParam).then(dynamodbGetResult => {
        const data = dynamodbGetResult.Item;
        if (data.personnel_information.M.founderEmail.S === ownerEmail) {
            return res.render("components/found", dataForFrontend);
        };
        dataForFrontend["data"] = data;

        const dynamodbUpdateParam = {
            Key: {
                case_id: {
                    S: id
                },
            },
            AttributeUpdates: {
                status: {
                    Action: "PUT",
                    Value: {"S": "COMPLETE"}
                },
                personnel_information: {
                    Action: "PUT",
                    Value: {"M": {
                        ...data.personnel_information.M,
                        ownerName: {S: ownerName},
                        ownerEmail: {S: ownerEmail.trim().toLowerCase()}
                    }}
                },
                collectionDate: {
                    Action: "PUT",
                    Value: {S: collectionDate}
                },
                collectionTime: {
                    Action: "PUT",
                    Value: {S: collectionTime}
                }
            },
        };

        commonUpdateItem(dynamodbUpdateParam).then(dynamodbUpdateResult => {
            console.log(dynamodbUpdateResult);
            return res.redirect("/");
        }).catch(err => {
            console.log("DynamoDB Update Item Error: ",err);
            return res.render("components/found", dataForFrontend);
        });
    }).catch(err => {
        console.log(err);
        console.log("DynamoDB Get Item Error: ",err);
        return res.render("components/found", dataForFrontend);
    });
});

module.exports = router;