#!/usr/bin/env node

require('colors');
const Printer = require('./printer');
const gun     = require('./gun');

const action = (options) => {
    const printer = new Printer(options);
    const proxy   = require('./proxy')(options);

    proxy.get("/members/me/boards")
        .then(printer.printResponse(boards => {
            gun.empty();
            boards.forEach(board => {
                gun.fire(
                    board.name + " [" + board.url.cyan + "]", board.id
                );
            });
            gun.save();
        }))
        .catch(e => console.error(e));
};

const command = (program) => {
    program
        .command('boards')
        .description("Displays the boards to which I belong.")
        .action(action);
};

exports.action  = action;
exports.command = command;