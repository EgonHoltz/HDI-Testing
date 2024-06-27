const fs = require('fs');
const { faker } = require('@faker-js/faker');

const fileName = 'outputFile.txt';
const numberOfCompanies = 10; // You can adjust this number as needed

// Generate the content
let content = 'HDI_company-aae-1_aae\n';

for (let i = 0; i < numberOfCompanies; i++) {
    const company = {
        name: faker.company.name(),
        country: faker.location.country()
    };
    content += JSON.stringify(company) + '\n';
}

// Add the last line with the number of lines, not considering the first line
content += (numberOfCompanies).toString(); // last line itself

// Write the content to a file
fs.writeFile(fileName, content, (err) => {
    if (err) {
        console.error('An error occurred:', err);
        return;
    }
    console.log(`File was successfully generated: ${fileName}`);
});