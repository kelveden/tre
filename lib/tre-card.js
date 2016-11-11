#!/usr/bin/env node

const Printer = require('./printer');
const gun = require('./gun');
const R = require('ramda');

const action = (config) => (cardShortId, board, options) => {
    const proxy   = require('./proxy')(options, config);
    const printer = new Printer(options);
    const boardId = gun.examine(board) || config.defaultBoard;

    proxy.get("/boards/" + boardId + "/cards/" + cardShortId, { qs: { members: true }})
        .then(({ body }) => JSON.parse(body))
        .then(card => proxy.get("/cards/" + card.id + "/actions", { qs: { filter: "commentCard" }})
            .then(({ body }) => {
                return R.assoc("comments", JSON.parse(body), card)
            }))
        .then(card => proxy.get("/cards/" + card.id + "/list")
            .then(({ body }) => {
                return R.assoc("list", JSON.parse(body).name, card);
            }))
        .then(printer.printResponse(printer.printCard))
        .catch(e => console.error(e));
};

const command = (program, config) => {
    program
        .command('card <card> [<board>]')
        .description("Displays the specified card.")
        .action(action(config));
};

exports.action  = action;
exports.command = command;