#!/usr/bin/env node
const Printer = require('./printer');
const R = require('ramda');

const action = ( config ) => ( options ) => {
    const proxy = require('./proxy')(options, config);
    const printer = new Printer(options);
    const doneLists = config.doneLists;

    proxy.get("/members/me/cards/open", { qs: { members: true } })
        .then(( resp ) => {
            const body = JSON.parse(resp.body);
            return Promise.all(
                body.map(( card ) => proxy.get("/cards/" + card.id + "/list")
                    .then(( { body } ) => {
                        return R.assoc("list", JSON.parse(body).name, card);
                    })
                )
            )
        })

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