#!/usr/bin/env node

require('colors');
const gun     = require('./gun');
const Table   = require('cli-table');
const R       = require('ramda');

const action = (board, options) => {
    const proxy   = require('./proxy')(options);
    const boardId = gun.examine(board);
    const boardSize = 10;

    var listNames = [];

    proxy.get("/boards/" + boardId + "/lists")
        .then(resp => {
            const lists = JSON.parse(resp.body);
            listNames = lists.map(l => l.name);

            return Promise.all(
                lists.map(({ id }) =>
                    proxy.get("/lists/" + id + "/cards", { qs: { members: true } })));
        })
        .then(resps => {
            const table = new Table({
                chars: { 'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗', 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝', 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼', 'right': '║', 'right-mid': '╢', 'middle': '│' },
                style: { head: ["inverse"]},
                head: listNames
            });

            const summariseCard = (card) => card.shortLink + (card.members.length > 0 ? " [" + card.members.map(m => m.initials.cyan).join(",") + "]" : "");
            const padListTo = (size, val) => (arr) => R.concat(arr, R.repeat(val, size - arr.length));

            const cardLists = resps
                .map(R.prop("body"))
                .map(JSON.parse)
                .map(R.take(boardSize))
                .map(R.map(summariseCard))
                .map(padListTo(boardSize, ""));

            R.transpose(cardLists).forEach(r => table.push(r));

            console.log(table.toString());
        });
};

const command = (program) => {
    program
        .command('board <board>')
        .description("Displays the specified board.")
        .action(action);
};

exports.action  = action;
exports.command = command;