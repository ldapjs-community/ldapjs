# ldapjs-community

[![CI](https://github.com/ldapjs-community/ldapjs/actions/workflows/main.yml/badge.svg?branch=v2)](https://github.com/ldapjs-community/ldapjs/actions/workflows/main.yml)

`ldapjs-community` is a community-maintained, drop-in fork of ldapjs v2. It is
not affiliated with or endorsed by the original ldapjs maintainers.

> [!IMPORTANT]
> **v2 API only.** If your application uses ldapjs v3, do not switch yet.

## Replace ldapjs v2

Your existing `require('ldapjs')` and `import ... from 'ldapjs'` calls can stay
unchanged.

If `ldapjs` is a direct dependency, install the fork under the original name:

```console
npm install ldapjs@npm:ldapjs-community@^2.3.4
```

If `ldapjs` comes through another package such as `passport-ldapauth`, add the
matching top-level field to your project's root configuration, then reinstall.

### npm

Add this field to `package.json`:

```json
"overrides": { "ldapjs": "npm:ldapjs-community@^2.3.4" }
```

### Yarn

Add this field to `package.json`:

```json
"resolutions": { "ldapjs": "npm:ldapjs-community@^2.3.4" }
```

### pnpm

pnpm 11 and newer read overrides from `pnpm-workspace.yaml`:

```yaml
overrides:
  ldapjs: npm:ldapjs-community@^2.3.4
```

For pnpm 10 and earlier, add this field to `package.json`:

```json
"pnpm": { "overrides": { "ldapjs": "npm:ldapjs-community@^2.3.4" } }
```

Verify the replacement after installing:

```console
npm ls ldapjs
```

The resolved entry should point to `ldapjs-community@2.3.4` or newer.

## Usage

```javascript
const ldap = require('ldapjs')

const server = ldap.createServer()

server.search('dc=example', function (req, res, next) {
  const obj = {
    dn: req.dn.toString(),
    attributes: {
      objectclass: ['organization', 'top'],
      o: 'example'
    }
  }

  if (req.filter.matches(obj.attributes)) {
    res.send(obj)
  }

  res.end()
})

server.listen(1389, function () {
  console.log('ldapjs listening at ' + server.url)
})
```

To run that, assuming you have the [OpenLDAP](https://www.openldap.org/)
client on your system:

```console
ldapsearch -H ldap://localhost:1389 -x -b dc=example objectclass=*
```

## Resources

- [API documentation](https://ldapjs.com/docs)
- [Deprecation-warning migration guide](https://ldapjs.com/fix-deprecation-warning)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)
- [Issue tracker](https://github.com/ldapjs-community/ldapjs/issues)

## License

MIT.
