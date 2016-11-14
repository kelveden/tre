#!/usr/bin/env node
const Printer = require('./printer');
const R = require("ramda");
const gun = require('./gun');

const action = ( config ) => ( board, options ) => {
    const proxy = require('./proxy')(options, config);
    const printer = new Printer(options);
    const boardId = gun.examine(board) || config.defaultBoard;

    const sortAlphabetically = R.sortBy(R.compose(R.toLower, R.prop('fullName')))

    proxy.get("/boards/" + boardId + "/members", proxy)
        .then(printer.printResponse(users =>
            sortAlphabetically(users)
                .map(({ fullName, username }) => fullName.cyan + ": " + username)
                .forEach(line => console.log(line))
        ))
        .catch(e => console.error(e));
};

const command = ( program, config ) => {
    program
        .command('users [<board>]')
        .description("List users.")
        .action(action(config));
};

exports.action = action;
exports.command = command;