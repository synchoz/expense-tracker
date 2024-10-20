const path = require('path');
const _filePath = path.join(__dirname,'..','data','data.csv');
const fs = require('node:fs');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function validateOptions(action, options) {
    let isValid = true;
    if(action == 'add' && (options.description == undefined || options.amount == undefined)) {
        isValid = false;
    } else if(action == 'delete' && options.id == undefined) {
        isValid = false;
    }
    return isValid;
}

function writeContentToCSV(content) {
    let isSuccess = true;
    try {
        fs.writeFileSync(_filePath, content, { flag: "w+" });
    } catch (error) {
        console.log(error);
        isSuccess = false;
    }

    return isSuccess;
}

function checkIsDataExists() {
    let isExists = false;
    try {
        isExists = fs.existsSync(_filePath);
    } catch (error) {
        console.log("\nAn error Occured while checking existing file: ", error);
    }

    return isExists;
}

function readContentRetJSON() {
    let data;
    try {
        data = fs.readFileSync(_filePath, { encoding: "utf-8" });
    } catch (error) {
        console.log("\nERROR occured when Reading content: ", error);
    }
    return csvToArr(data);
}

function readContent() {
    let data;
    try {
        data = fs.readFileSync(_filePath, { encoding: "utf-8" });
    } catch (error) {
        console.log("\nERROR occured when Reading content: ", error);
    }
    return data;
}

function csvToArr(stringValue) {
    const [keys, ...rest] = stringValue
      .trim()
      .split("\n")
      .map((item) => item.split(','));
  
    const formedArr = rest.map((item) => {
      const object = {};
      keys.forEach((key, index) => (object[key] = item.at(index)));
      return object;
    });
  
    return formedArr;
}

function JSONToCSV(JSONString) {
    let header = "";
    let restRows = "";
    JSONString.map((object, index) => {
        if(index == 0) {
            return Object.keys(object).map((key, index) => {
                header += `${key},`;
            })
        }
    })
    header = header.substring(0,header.length - 1);
    const headerArr = header.split(',');
    for (let i = 0; i < JSONString.length; i++) {
        for (let j = 0; j < headerArr.length; j++) {
            restRows += `${JSONString[i][headerArr[j]]}`;
            if(j < headerArr.length - 1) {
                restRows += ',';
            }
        }
        if(i < JSONString.length - 1) {
            restRows += "\n";
        }
    }
    return header + "\n" +  restRows;
}

function addExpense(action, currJSONData, options) {
    const newId = getNewId(currJSONData);
    const newJSONDataRow = {
        Id: newId,
        Date: getFormattedDate(),
        Description: options.description,
        Amount: options.amount
    }
    const JSONData = [...currJSONData, newJSONDataRow];
    const CSVData = JSONToCSV(JSONData);
    const isSuccess = writeContentToCSV(CSVData);
    printExpectedOutput(action, isSuccess, newId);
}

function printExpectedOutput(action, isSuccess, id) {
    if(action == 'add' && isSuccess) {
        console.log(`\n# Expense added successfully (ID: ${id})`);
    } else if(action == 'delete' && isSuccess) {
        console.log(`\n# Expense deleted successfully.`)
    } else {
        console.log('\n# Unexpcted error occured.')
    }
}

function getNewId(currJSONData) {
    let maxId = 0
    currJSONData.map(({Id}) => {
        if(parseInt(Id) > maxId) {
            maxId = parseInt(Id);
        }
    })
    return maxId + 1;
}

function getFormattedDate() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() < 9 ? "0" + date.getMonth() + 1  : date.getMonth() + 1}-${date.getDate() > 10 ? date.getDate() : "0" + date.getDate()}`;
}

function printList() {
    const data = readContent();
    const rows = data.split('\n');
    let printRow = "";
    for (let index = 0; index < rows.length; index++) {
        let cols = rows[index].split(',');
        printRow = "# |";
        for (let j = 0; j < cols.length; j++) {
            printRow += `   ${cols[j]}  |`;
        }
        console.log(printRow);
        
    }
}

function getMonthFromStr(str) {
    const date = new Date(str);
    return date.getMonth() + 1;
}

function printSummary(options,data) {
    if(!options.month) {
        let sumAmount = data.reduce((acc, col) => acc + parseFloat(col.Amount), 0);
        console.log(`\n# Total expenses: $${sumAmount}`);
    } else {
        let sumAmountMonth = data.reduce((acc, col) => {
            if(getMonthFromStr(col.Date) == options.month) {
                return acc + parseFloat(col.Amount);
            }
            return acc;

        }, 0)
    console.log(`\n# Total expenses for ${months[parseInt(options.month) - 1]}: $${sumAmountMonth}`);
    }
}

function deleteExpense(action, options,data) {
    const rowExists = data.find((row) => row.Id == options.id);
    if(rowExists) {
        const filteredContent = data.filter((row) => row.Id != options.id);
        const csvFormattedData = JSONToCSV(filteredContent);
        const isSuccess = writeContentToCSV(csvFormattedData);
        printExpectedOutput(action, isSuccess);
    } else {
        console.log("\n# Id doesn't exist")
    }
}

function updateExpense(options, data) {
    const rowExists = data.find((row) => row.Id == options.id);
    if(rowExists) {
        let updatedData = data.map((row) => {
            if(row.Id == options.id) {
                return {
                    ...row,
                    Description: options.description == undefined ? row.Description : `${options.description}`,
                    Amount: options.amount == undefined ? row.Amount : `${options.amount}`,
                }
            } else {
                return row;
            }
        })
        const csvFormattedData = JSONToCSV(updatedData);
        writeContentToCSV(csvFormattedData);
    } else {
        console.log("\n# Id doesn't exist");
    }
}
 
module.exports = {
    writeContentToCSV, readContentRetJSON, JSONToCSV, addExpense, 
    getFormattedDate, checkIsDataExists, printList, printSummary, 
    deleteExpense, updateExpense, validateOptions}