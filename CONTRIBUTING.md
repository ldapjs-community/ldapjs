# Contributing

Thank you for helping maintain `ldapjs-community`.

## Scope

This package is a drop-in replacement for [ldapjs](https://github.com/ldapjs/node-ldapjs) v2. API compatibility with
ldapjs v2 is the contract, so changes must not introduce breaking API or
behavior changes in the 2.x release line.

Bug fixes, security fixes, documentation improvements, test coverage, and
compatible maintenance updates are welcome. Discuss larger changes in an
issue before starting work.

## Set up and test

Install dependencies with:

```console
npm ci
```

Run the unit tests and lint checks with:

```console
npm test
npm run lint:ci
```

Integration tests require Docker. The local helper starts OpenLDAP, runs the
tests, and stops the container:

```console
npm run test:integration:local
```

To manage the container yourself, run:

```console
docker compose up -d --wait
npm run test:integration
docker compose down
```

## Pull requests

1. Create a focused branch and keep the change limited to one concern.
2. Add or update tests when behavior changes.
3. Run the relevant checks described above.
4. Open a pull request against `v2` and explain what changed, why it is
   compatible with ldapjs v2, and how it was tested.

Use short, imperative commit subjects. Prefer the existing `type: summary`
style when it fits, for example `fix: close socket on destroy` or
`docs: clarify client errors`. Keep commits reviewable; maintainers may squash
them when merging.

## Security reports

Do not report suspected vulnerabilities in a public issue. Follow
[SECURITY.md](SECURITY.md) to submit a private report.

## Releases

Releases are cut by maintainers:

1. Update the package version and release notes, then merge the release change.
2. Publish a GitHub release whose tag exactly matches the package version, such
   as `v2.3.4`.
3. The publish workflow verifies the tag, installs dependencies, runs the test
   suite, publishes to npm with provenance, and runs the installation smoke
   test.

Maintainers with release access must use two-factor authentication as required
by [SECURITY.md](SECURITY.md).
