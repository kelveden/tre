#!/usr/bin/env node
const Printer = require('./printer');
const R = require('ramda');
const loadUserCard = require('./user-card')

const action = ( config ) => ( user, options ) => {
    const proxy = require('./proxy')(options, config);
    const printer = new Printer(options);
    const doneLists = config.doneLists;

    loadUserCard(user, proxy)
        .then(R.filter((card) => !doneLists || !R.contains(card.list, doneLists)))
        .then((cards) => cards.forEach(printer.printResponse(printer.printCard)))
        .catch(e => console.error(e));
};

const command = ( program, config ) => {
    program
        .command('you <user>')
        .description("Displays cards assigned to a specific user.")
        .action(action(config));
};

exports.action = action;
exports.command = command;