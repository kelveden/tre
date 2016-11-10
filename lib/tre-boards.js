#!/usr/bin/env node

require('colors');
const Printer = require('./printer');
const gun     = require('./gun');

const action = (config) => (options) => {
    const printer = new Printer(options);
    const proxy   = require('./proxy')(options, config);

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

const command = (program, config) => {
    program
        .command('boards')
        .description("Displays the boards to which I belong.")
        .action(action(config));
};

exports.action  = action;
exports.command = command;