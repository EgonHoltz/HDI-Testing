const amqp = require('amqplib');
const { faker } = require('@faker-js/faker');

const rabbitMqUrl = 'amqp://u-aaf:hdi-pass@localhost'; // Change this URL to your RabbitMQ server URL
const queue = 'client-aaf';

// Function to generate data
function generateData() {
    console.log("generateData");
    return JSON.stringify({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        birthDate: faker.date.past(),
        birthCity: faker.location.city(),
        nif: faker.finance.bic(),
        nationality: faker.location.country()
    });
}

// Function to send data to RabbitMQ
async function sendDataToQueue(data) {
    console.log("Trying to obtain the connection with rabbit");
    const connection = await amqp.connect(rabbitMqUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, {
        durable: true
    });

    console.log("Sending message");
    channel.sendToQueue(queue, Buffer.from(data));
    console.log(" [x] Sent %s", data);

    setTimeout(() => {
        connection.close();
    }, 500); // Close the connection after a short delay
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