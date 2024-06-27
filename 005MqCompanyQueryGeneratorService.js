const amqp = require('amqplib');
const { faker } = require('@faker-js/faker');

const rabbitMqUrl = 'amqp://u-aad:blablabla@localhost'; // Change this URL to your RabbitMQ server URL
const queue = 'company-aad-consult';

// Function to generate data
function generateData() {
    console.log("generateData");
    let country = faker.location.country();
    return JSON.stringify({
        country: country,
    });
}

// Function to send data to RabbitMQ
async function sendDataToQueue(data) {
    console.log("Trying to obtain the connection with RabbitMQ");
    const connection = await amqp.connect(rabbitMqUrl);
    const channel = await connection.createChannel();

    // Assert the queue to ensure it exists
    await channel.assertQueue(queue, {
        durable: true
    });

    // Create a temporary queue for receiving replies
    const assertQueueResult = await channel.assertQueue('', { exclusive: true });
    const replyQueue = assertQueueResult.queue;

    // Listen for the reply in the reply-to queue
    channel.consume(replyQueue, (msg) => {
        if (msg !== null) {
            console.log("===> Received reply:", msg.content.toString());
            // Acknowledge the message
            channel.ack(msg);
            // Close the connection
            connection.close();
        }
    }, {
        noAck: false
    });

    console.log("Sending message");
    channel.sendToQueue(queue, Buffer.from(data), {
        // Specify the reply-to queue and correlationId
        replyTo: replyQueue,
    });

    console.log(" [x] Sent %s", data);
}

// Function to simulate calling ChatGPT to generate data and send it every minute
function startSendingData() {
    console.log("Starting the service");
    setInterval(async () => {
        const data = generateData();
        await sendDataToQueue(data);
    }, 6000); // every 1 minute
}

startSendingData();