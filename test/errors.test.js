'use strict'

const { test } = require('tap')
const {
  LDAPError,
  ConnectionError,
  AbandonedError,
  TimeoutError,
  ConstraintViolationError,
  LDAPResult,
  getError,
  LDAP_OTHER
} = require('../lib')

test('basic error', function (t) {
  const msg = 'mymsg'
  const err = new LDAPError(msg, null, null)
  t.ok(err)
  t.equal(err.name, 'LDAPError')
  t.equal(err.code, LDAP_OTHER)
  t.equal(err.dn, '')
  t.equal(err.message, msg)
  t.end()
})

test('exports ConstraintViolationError', function (t) {
  const msg = 'mymsg'
  const err = new ConstraintViolationError(msg, null, null)
  t.ok(err)
  t.equal(err.name, 'ConstraintViolationError')
  t.equal(err.code, 19)
  t.equal(err.dn, '')
  t.equal(err.message, msg)
  t.end()
})

test('exports cancel and assertion result errors', function (t) {
  const expected = [
    ['CanceledError', 118],
    ['NoSuchOperationError', 119],
    ['TooLateError', 120],
    ['CannotCancelError', 121],
    ['AssertionFailedError', 122]
  ]

  expected.forEach(function ([name, code]) {
    const ErrorClass = require('../lib')[name]
    const err = new ErrorClass()
    t.equal(err.name, name)
    t.equal(err.code, code)
  })

  t.end()
})

test('getError preserves unknown result details', function (t) {
  const err = getError(new LDAPResult({
    status: 999,
    matchedDN: 'dc=example,dc=com'
  }))

  t.type(err, LDAPError)
  t.equal(err.code, 999)
  t.equal(err.message, 'Unknown LDAP error (999)')
  t.equal(err.dn, 'dc=example,dc=com')
  t.equal(Object.getOwnPropertyDescriptor(err, 'code').writable, false)
  t.end()
})

test('getError preserves an unknown result diagnostic', function (t) {
  const err = getError(new LDAPResult({
    status: 999,
    errorMessage: 'server diagnostic'
  }))

  t.equal(err.message, 'server diagnostic')
  t.end()
})

test('"custom" errors', function (t) {
  const errors = [
    { name: 'ConnectionError', Func: ConnectionError },
    { name: 'AbandonedError', Func: AbandonedError },
    { name: 'TimeoutError', Func: TimeoutError }
  ]

  errors.forEach(function (entry) {
    const msg = entry.name + 'msg'
    const err = new entry.Func(msg)
    t.ok(err)
    t.equal(err.name, entry.name)
    t.equal(err.code, LDAP_OTHER)
    t.equal(err.dn, '')
    t.equal(err.message, msg)
  })

  t.end()
})
