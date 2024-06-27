const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { faker } = require('@faker-js/faker');

// Simulate the proto file content
const PROTO_CONTENT = `
syntax = "proto3";

package grpc;

service SendRetrieveDataService {
  rpc retrieveRqst(RetrieveDataRequest) returns(RetrieveDataResponse) {}
}

message RetrieveDataRequest {
  string clientId = 1;
  string jsonMsg = 2;
}

message RetrieveDataResponse {
  string clientId = 1;
  string jsonMsg = 2;
}
`;
var grpcObject = null;
var grpcPackage = null;
const PROTO_FILE = 'service.proto';

function createProtoFile(){
    fs.writeFileSync(PROTO_FILE, PROTO_CONTENT);
}

function loadProtobuf(){
    // Load the proto definitions
    const packageDefinition = protoLoader.loadSync(
      PROTO_FILE, 
      { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
    );
    grpcObject = grpc.loadPackageDefinition(packageDefinition);
    grpcPackage = grpcObject.grpc;
}

// Generate fake data for clientId and jsonMsg
// Function to generate data
function generateData() {
    return JSON.stringify({
        country: faker.location.country()
    });
}
async function sendDataBygRPC(jsonMsg) {
    console.log("Sending message");
    const clientId = "client-aaf-retrieve";
    const client = new grpcPackage.SendRetrieveDataService('localhost:8070', grpc.credentials.createInsecure());
    console.log(" [x] Sent %s", jsonMsg );
    client.retrieveRqst({ clientId, jsonMsg }, (error, response) => {
      if (!error) {
        console.log('Response from server:', response);
      } else {
        console.error(error);
      }
    });
}

// Function to simulate calling ChatGPT to generate data and send it every minute
function startSendingData() {
    console.log("Starting the service");
    createProtoFile();
    loadProtobuf();
    setInterval(async () => {
        const data = generateData();
        await sendDataBygRPC(data);
    }, 6000); // every 1 minute
}

startSendingData();