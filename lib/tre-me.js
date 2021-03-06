#!/usr/bin/env node
const Printer = require('./printer');
const R = require('ramda');
const loadUserCard = require('./user-card')

const action = ( config ) => ( options ) => {
    const proxy = require('./proxy')(options, config);
    const printer = new Printer(options);
    const doneLists = config.doneLists;

    loadUserCard("me", proxy)
        .then(R.filter((card) => !doneLists || !R.contains(card.list, doneLists)))
        .then((cards) => cards.forEach(printer.printResponse(printer.printCard)))
        .catch(e => console.error(e));
};

const command = ( program, config ) => {
    program
        .command('me')
        .description("Displays cards assigned to you.")
        .action(action(config));
};

exports.action = action;
exports.command = command;