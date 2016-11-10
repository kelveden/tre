const request = require('request');
const R = require('ramda');
const _ = require('lodash');
const noConfirmation = (callback) => callback();

module.exports = (options, config) => {
    const dryRun = options.parent.dryRun;
    const debug = options.parent.debug;
    const withConfirmation = options.allowUnsafe ?
        R.curry((_, callback) => callback()) :
        require('./confirmer').withConfirmation;

    const sendRequest = (method, confirm) =>
        function (url, opts) {
            const key = config.key;
            const token = config.token;
            const fullUrl = "https://api.trello.com/1" + url;
            const fullOpts = _.merge(opts, { qs: { key: key, token: token }});

            return new Promise((resolve, reject) => {
                const responseHandler = (err, res) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    if (res.statusCode >= 300) {
                        console.log(res.statusCode + ": " + res.statusMessage);
                        console.log(res.body);
                        return;
                    }

                    resolve(res);
                };

                if (dryRun || debug) {
                    console.log(method.toUpperCase() + ": " + fullUrl);
                    console.log(fullOpts);
                }

                if (!dryRun) {
                    confirm(
                        () => request[ method ].call(this, fullUrl, fullOpts, responseHandler)
                    );
                } else {
                    resolve();
                }
            });
        };

    return {
        "get": sendRequest("get", noConfirmation),
        "delete": sendRequest("del", withConfirmation("You are about to delete something. Are you sure you wish to continue?")),
        "post": sendRequest("post", withConfirmation("You are about to post something. Are you sure you wish to continue?")),
        "put": sendRequest("put", withConfirmation("You are about to put something. Are you sure you wish to continue?"))
    };
};