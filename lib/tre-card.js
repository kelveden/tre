#!/usr/bin/env node

const colors = require('colors');
colors.setTheme({
    purple: "magenta",
    sky: "cyan"
})

const Printer = require('./printer');
const gun = require('./gun');
const Card = require('./card');
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
        .then(printer.printResponse(story => {
            var card = new Card({ width: 120, colour: "blue" }),
                cardContents = [
                    [
                        { content: story.idShort, width: 7, colour: "cyan" },
                        { content: story.list, width: 30, colour: "magenta" },
                        { content: story.name, width: 63, colour: "cyan" },
                        { content: story.members.length > 0 ? story.members.map(m => m.initials).join(",") : "Unassigned", colour: "green" }
                    ],
                    [
                        { content: story.desc }
                    ]
                ];

            story.comments.forEach(c => {
                cardContents.push([
                    { content: c.data.text, width: 110, colour: "yellow" },
                    { content: c.memberCreator.initials, colour: "green" }
                ]);
            });

            console.log(story.labels.map(l => l.name[l.color].inverse).join(" "))

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