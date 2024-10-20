#!/usr/bin/env node
const { Command } = require('commander');
const program = new Command();
const utils = require('../src/utils');
const headerLine = "Id,Date,Description,Amount";
let newStr = "";
let data = utils.checkIsDataExists() ? utils.readContentRetJSON() : [];
if(data.length == 0) {
    newStr = headerLine 
    utils.writeContentToCSV(newStr);
}

const allowedActions = ['add', 'list', 'summary', 'delete', 'update'];

program
  .name('expense-tracker')
  .description('CLI to run your expenses.').version('0.0.1')
  .argument('<action>', `the action to run can be one of this: ${allowedActions}`)
  .option('--description <value>', 'add description')
  .option('--amount <value>','the amount value')
  .option('--month <value>','the month value')
  .option('--id <value>','the id that needs to be deleted')
  .action((action, options) => {

    if(!allowedActions.includes(action)) {
        console.log(`\nthe action: ${action} is not something that is allowed in this CLI the valid actions are: ${allowedActions.join(', ')}`);
        process.exit(1);
    }

    const isValid = utils.validateOptions(action, options)

    if(!isValid){
        console.log('\noption or options are not valid for the chosen action');
        process.exit(1);
    }

    switch (action) {
        case 'add':
            utils.addExpense(action, data, options);
            break;
        case 'list':
            utils.printList();
            break;
        case 'summary':
            utils.printSummary(options, data);
            break;
        case 'delete':
            utils.deleteExpense(action, options, data);
            break;
        case 'update':
            utils.updateExpense(options, data);
            break;
        default:
            break;
    }
  });


program.parse();


