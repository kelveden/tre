#!/usr/bin/env node

require('colors');
const Printer = require('./printer');
const gun = require('./gun');
const Card = require('./card');

const action = (config) => (card, board, options) => {
    const proxy   = require('./proxy')(options, config);
    const printer = new Printer(options);
    const boardId = gun.examine(board) || config.defaultBoard;

    proxy.get("/boards/" + boardId + "/cards/" + card, { qs: { members: true }})
        .then(printer.printResponse(story => {
            var card = new Card({ width: 120, colour: "blue" }),
                cardContents = [
                    [
                        { content: story.idShort, width: 8, colour: "cyan" },
                        { content: story.idList, width: 30 },
                        { content: story.members.length > 0 ? story.members.map(m => m.initials).join(",") : "Unassigned", colour: "green" }
                    ],
                    [
                        { content: story.desc }
                    ]
                ];

            card.render(cardContents);
        }))
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