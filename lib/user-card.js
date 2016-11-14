const R = require('ramda');

module.exports = (userId, proxy) => {
    return proxy.get("/members/" + userId + "/cards/open", { qs: { members: true } })
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
};