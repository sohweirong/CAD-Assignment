import boto3
from decimal import Decimal
import json
import urllib.request
import urllib.parse
import urllib.error

print('Loading function')

rekognition = boto3.client('rekognition')
dynamodbResource = boto3.resource('dynamodb')
s3Resource = boto3.resource('s3')

def detect_labels(BucketName, ObjectKey, Case_ID):
    tableOne = dynamodbResource.Table('191382s-cad')
    tableTwo = dynamodbResource.Table('191382s-cad-category')
    
    category = tableTwo.scan()
    category = category["Items"]
    
    response = rekognition.detect_labels(Image={"S3Object": {"Bucket": BucketName, "Name": ObjectKey}}, MinConfidence=90)
    
    possibleCategory = response["Labels"][0]["Name"]
    
    tmpData = tableTwo.get_item(Key={"genre": possibleCategory})
    if "Item" in tmpData:
        tableTwo.update_item(Key={"genre": possibleCategory}, AttributeUpdates={
            'count': {
                "Action": "PUT",
                "Value": tmpData["Item"]["count"] + 1
            }
        })
    else:
        tableTwo.update_item(Key={"genre": possibleCategory}, AttributeUpdates={
            'count': {
                "Action": "PUT",
                "Value": 1
            }
        })
        
    
    response = tableOne.update_item(Key={"case_id": Case_ID}, AttributeUpdates={
        'category': {
            "Action": "PUT",
            "Value": possibleCategory
        }
    })
    
    return response

# --------------- Main handler ------------------


def lambda_handler(event, context):
    '''Demonstrates S3 trigger that uses
    Rekognition APIs to detect faces, labels and index faces in S3 Object.
    '''
    #print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
    try:
        s3ObjInitial = s3Resource.Object(bucket_name=bucket, key=key)
        s3Obj = s3ObjInitial.get()
        case_id = s3Obj["Metadata"]["case_id"]
        response = detect_labels(bucket, key, case_id)
        return response
    except Exception as e:
        print(e)