var _     = require('lodash'),
    chars = {
        border: {
            top: '═',
            topmid: '╤',
            topleft: '╔',
            topright: '╗',
            bottom: '═',
            bottommid: '╧',
            bottomleft: '╚',
            bottomright: '╝',
            left: '║',
            leftmid: '╟',
            right: '║',
            rightmid: '╢'
        },
        internal: {
            horizontal: '─',
            vertical: '│',
            bothup: '┴',
            bothdown: '┬',
            bothboth: '┼'
        }
    }

module.exports = function (config) {
    var cardWidth  = config.width,
        cardColour = config.colour,
        wrap       = require('wordwrap')(cardWidth - 4);

    require('colors');

    this.render = function (rows) {
        function repeatChar (char, times) {
            return (new Array(times)).join(char);
        }

        function pad (text, minimumWidth) {
            if (text.length >= minimumWidth) {
                return text;
            } else {
                return text + repeatChar(" ", minimumWidth - text.length);
            }
        }

        function addSeparatorIndexes (row) {
            var totalWidth = 1;

            row.separators = row.slice(0, row.length - 1).map(function (col) {
                if (!col.width) {
                    throw new Error("Cell " + JSON.stringify(col) + " did not have a width specified.");
                }

                totalWidth = totalWidth + col.width + 2; // 1 padding each side of cell content

                return totalWidth;
            });
        }

        function lastColumnWidth (row) {
            return cardWidth - row.reduce(function (total, col) {
                    if (col.width) {
                        return total + col.width + 2;
                    } else {
                        return total;
                    }
                }, 0) - 3;
        }

        function columnChars (char) {
            return function (col) {
                return repeatChar(char, col.width + 2);
            };
        }

        function renderRow (row, index) {
            function renderBottom (nextRow) {

                if (!nextRow) {
                    // Render border bottom
                    console.log(
                        (chars.border.bottomleft +
                        row.map(columnChars(chars.border.bottom)).join(chars.border.bottommid) +
                        chars.border.bottomright)[ cardColour ]);
                } else {
                    var internals = _.union(row.separators, nextRow.separators, [ cardWidth ]).sort((a,b) => a - b)
                        .reduce(function (line, separatorIndex) {
                            var separatorChar = chars.internal.bothboth;

                            if (separatorIndex === cardWidth) {
                                separatorChar = chars.border.rightmid;

                            } else if (_.includes(row.separators, separatorIndex) && !_.includes(nextRow.separators, separatorIndex)) {
                                separatorChar = chars.internal.bothup;

                            } else if (!_.includes(row.separators, separatorIndex) && _.includes(nextRow.separators, separatorIndex)) {
                                separatorChar = chars.internal.bothdown;
                            }

                            return line + repeatChar(chars.internal.horizontal, separatorIndex - line.length - 1) + separatorChar;
                        }, "");

                    console.log((chars.border.leftmid + internals)[ cardColour ]);
                }
            }

            var nextRow   = rows.length > (index + 1) ? rows[ index + 1 ] : null,
                rowHeight = _.max(row.map(function (col) {
                    return col.content.length;
                }));

            for (var i = 0; i < rowHeight; i++) {
                console.log(
                    chars.border.left[ cardColour ] +
                    row.map(function (col) {
                        var content = col.content.length > i ? col.content[ i ] : "";

                        return " " + pad(content, col.width)[ col.colour || "white" ] + " ";
                    }).join(chars.internal.vertical[ cardColour ]) +
                    chars.border.right[ cardColour ]);
            }

            renderBottom(nextRow);
        }

        function setLastColumnWidth (row) {
            var width = lastColumnWidth(row);

            if (width > 0) {
                row[ row.length - 1 ].width = width;
            } else {
                throw new Error("One or more rows exceeds the card width of " + cardWidth);
            }
        }

        function wrapColumnContent (row) {
            row.forEach(function (col) {
                col.content = wrap(col.content, col.width).split("\n");
            });
        }

        if (arguments.length === 0) {
            return;
        }

        rows.forEach(function (row) {
            addSeparatorIndexes(row);
            setLastColumnWidth(row);
            wrapColumnContent(row);
        });

        console.log(
            chars.border.topleft[ cardColour ] +
            rows[ 0 ].map(columnChars(chars.border.top[ cardColour ])).join(chars.border.topmid[ cardColour ]) +
            chars.border.topright[ cardColour ]);

        rows.forEach(renderRow);
    }
}
