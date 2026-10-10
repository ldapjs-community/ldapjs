# ldapjs Changelog

## 2.4.0 (2026-10-10)

### Added

- Add LDAP result codes 118–122 and their generated error classes from RFC
  3909 and RFC 4528 ([#15](https://github.com/ldapjs-community/ldapjs/pull/15)).
- Document request logging with `req.logId`, `req.connection.remoteAddress`,
  and `req.connection.remotePort`
  ([#16](https://github.com/ldapjs-community/ldapjs/pull/16)).

### Fixed

- Preserve the numeric code, diagnostic message, and matched DN when a server
  returns an unknown LDAP result code
  ([#15](https://github.com/ldapjs-community/ldapjs/pull/15)).
- Route search entries and references by message type instead of constructor
  name ([#17](https://github.com/ldapjs-community/ldapjs/pull/17)).
- Clear request timers when an operation is abandoned, preventing a later
  timeout callback ([#18](https://github.com/ldapjs-community/ldapjs/pull/18)).
- Report malformed client packets through `clientError`, close only the
  offending connection, and keep the server available
  ([#19](https://github.com/ldapjs-community/ldapjs/pull/19)).

### Maintenance

- Modernize the development toolchain with Tap 20 and ESLint 9, remove Husky
  4, and retain the Node.js 18, 20, 22, and 24 CI matrix
  ([#22](https://github.com/ldapjs-community/ldapjs/pull/22)).
- Update GitHub Actions and documentation dependencies, improve release and
  contributor guidance, and remove deprecated Tap assertions
  ([#7](https://github.com/ldapjs-community/ldapjs/pull/7),
  [#14](https://github.com/ldapjs-community/ldapjs/pull/14),
  [#21](https://github.com/ldapjs-community/ldapjs/pull/21),
  [#23](https://github.com/ldapjs-community/ldapjs/pull/23)).

## 2.0.0

- Going foward, please see https://github.com/ldapjs/node-ldapjs/releases

## 1.0.2

- Update dtrace-provider dependency

## 1.0.1

- Update dependencies
  * assert-plus to 1.0.0
  * bunyan to 1.8.3
  * dashdash to 1.14.0
  * backoff to 2.5.0
  * once to 1.4.0
  * vasync to 1.6.4
  * verror to 1.8.1
  * dtrace-provider to 0.7.0
- Drop any semblence of support for node 0.8.x

## 1.0.0

- Update dependencies
  * asn1 to 0.2.3
  * bunyan to 1.5.1
  * dtrace-provider to 0.6.0
- Removed pooled client
- Removed custom formatting for GUIDs
- Completely overhaul DN parsing/formatting
  - Add options for format preservation
  - Removed `spaced()` and `rndSpaced` from DN API
  - Fix parent/child rules regarding empty DNs
- Request routing overhaul
    * #154 Route lookups do not depend on object property order
    * #111 Null ('') DN will act as catch-all
- Add StartTLS support to client (Sponsored by: DoubleCheck Email Manager)
- Improve robustness of client reconnect logic
- Add 'resultError' event to client
- Update paged search automation in client
- Add Change.apply method for modifying objects
- #143 Preserve raw Buffer value in Control objects
- Test code coverage with node-istanbul
- Convert tests to node-tape
- Add controls for server-side sorting
- #201 Replace nopt with dashdash
- #134 Allow configuration of derefAliases client option
- #197 Properly dispatch unbind requests
- #196 Handle string ports properly in server.listen
- Add basic server API tests
- Store EqualityFilter value as Buffer
- Run full test suite during 'make test'
- #190 Add error code 123 from RFC4370
- #178 Perform strict presence testing on attribute vals
- #183 Accept buffers or strings for cert/key in createServer
- #180 Add '-i, --insecure' option and to all ldapjs-\* CLIs
- #254 Allow simple client bind with empty credentials

## 0.7.1

- #169 Update dependencies
    * asn1 to 0.2.1
    * pooling to 0.4.6
    * assert-plus to 0.1.5
    * bunyan to 0.22.1
- #173 Make dtrace-provider an optional dependency
- #142 Improve parser error handling
- #161 Properly handle close events on tls sockets
- #163 Remove buffertools dependency
- #162 Fix error event handling for pooled clients
- #159 Allow ext request message to have a buffer value
- #155 Make \*Filter.matches case insensitive for attrs

## 0.7.0

- #87 Minor update to ClientPool event pass-through
- #145 Update pooling to 0.4.5
- #144 Fix unhandled error during client connection
- Output ldapi:// URLs for UNIX domain sockets
- Support extensible matching of caseIgnore and caseIgnoreSubstrings
- Fix some ClientPool event handling
- Improve DN formatting flexibility
    * Add 'spaced' function to DN objects allowing toggle of inter-RDN when
      rendering to a string.  ('dc=test,dc=tld' vs 'dc=test, dc=tld')
    * Detect RDN spacing when parsing DN.
- #128 Fix user can't bind with inmemory example
- #139 Bump required tap version to 0.4.1
- Allow binding ldap server on an ephemeral port

## 0.6.3

- Update bunyan to 0.21.1
- Remove listeners on the right object (s/client/res/)
- Replace log4js with bunyan for binaries
- #127 socket is closed issue with pools
- #122 Allow changing TLS connection options in client
- #120 Fix a bug with formatting digits less than 16.
- #118 Fix "failed to instantiate provider" warnings in console on SmartOS

## 0.6.2 - 0.1.0

**See git history**
