const { parallel } = require('async');
const hyperdrive = require('hyperdrive');
const ram = require('random-access-memory');
const { keyPair, sign } = require('sodium-signatures');
const assert = require('assert');

const { createInterceptor } = require('./lib/index');

const feed = hyperdrive(filename => ram(filename));

feed.ready(() => {
    const keys = keyPair();

    const created = Date.now() - Math.round(Math.random() * 3888000000);
    const updated = created;

    const domainMetadata = {
        created,
        updated,
        title: "My Test Website",
        description: "Some description text for my test website",
        uri: "https://example.com"
    };

    parallel([
        done => feed.writeFile('tld.json', Buffer.from(JSON.stringify({
            "name": "tld",
            "domain-expire-time": 7776000000
        }), 'utf8'), done),
        done => feed.mkdir('tld', done),
        done => feed.writeFile('tld/example.json', Buffer.from(JSON.stringify({
            owner: keys.publicKey.toString('hex'),
            sig: sign(Buffer.from(JSON.stringify(domainMetadata), 'utf8'), keys.secretKey).toString('hex'),
            ...domainMetadata
        }), 'utf8'), done)
    ], async (err) => {
        assert.ifError(err);

        const interceptor = createInterceptor(feed, (info, socket) => {
            assert.ok(info, "info must not be empty.");

            // any interception server can be attached here!

        });

        try {
            // following functions will be called internally in the router.
            await interceptor.initialize();

            const info = { dstAddr: 'www.example.tld' };
            const result = await interceptor.validate(info);
            assert.ok(result, 'signature must match!');

            await interceptor.intercept(info);

        } catch (err) {
            assert.ifError(err);
        }

    });
});
