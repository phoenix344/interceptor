# socks-domain-registry
Reads a hyperdrive archive by the given domain name. The saved domain must contain a signature and a public key for the verification.


A toplevel domain (tld) contains a configuration file called <code>tld.json</code>.

<code>./tld.json</code>
```json
{
    "name": "toplevel-domain-name",
    "domain-expire-time": 7776000000
}
```

The name is the toplevel domain name. If you have a domain <code>example</code> and your tld is <code>code</code> then you call it in the browser as <code>example.code</code>.

The domain-expire-time is the lifetime of the domain until it gets expired and must be renewed. This field is optional. If you
leave it blank or set it to null, it will be ignored.

A domain entry is not a DNS call. It's a JSON file that can contain various information about the page. Signing is using the
ed25519 curve and I'm using the sodium library.

<code>./&lt;tld-name&gt;/mydomain.json</code>
```json
{
    "sig": "... 128 byte hex string ...",
    "owner": "... 64 byte hex string ...",
    "created": 1234567890123,
    "title": "custom page title for search engines and stuff",
    "description": "custom page description",
    "tags": ["custom", "tags", "for the sake of satan of course"],
    "uri": "target URI (depends on the proxy)"
}
```

