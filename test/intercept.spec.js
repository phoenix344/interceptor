const { createArchive, createFakeServer } = require('./intercept.mock');
const { createInterceptor } = require('../lib/index');
const { createRouter } = require('@outtacontrol/socks-router');
const assert = require("assert");

module.exports = [

    async function testTldInterception() {
        const archive = createArchive();
        const interceptor = createInterceptor(archive);
        const router = createRouter([interceptor]);
        const server = createFakeServer(null, router);

        let correct = false;
        server.on("accept:intercept", () => correct = true);
        server.on("accept:default", () => assert.fail("expected interception, but it's only accepted"));
        server.on("deny", () => assert.fail("expected interception, but not a deny"));

        server.fakeRequest(80, 'example.tld');
        assert.ok(correct, "expected an interception");
    },

    async function testTldAccept() {
        const archive = createArchive();
        const interceptor = createInterceptor(archive);
        const router = createRouter([interceptor]);
        const server = createFakeServer(null, router);

        let correct = false;
        server.on("accept:interception", () => assert.fail("expected accept, but not an interception"));
        server.on("accept:default", () => correct = true);
        server.on("deny", () => assert.fail("expected accept, but not a deny"));

        server.fakeRequest(80, 'example.xyz');
        assert.ok(correct, "expected accept");
    },

    async function testTldDeny() {
        const archive = createArchive();
        const interceptor = createInterceptor(archive);
        const router = createRouter([{
            async validate() {
                return false;
            }
        }, interceptor]);
        const server = createFakeServer(null, router);

        let correct = false;
        server.on("accept:interception", () => assert.fail("expected deny, but not an interception"));
        server.on("accept:default", () => assert.fail("expected deny. Must not be accepted"));
        server.on("deny", () => correct = true);

        server.fakeRequest(80, 'example.tld');
        assert.ok(correct, "expected deny");
    }

];