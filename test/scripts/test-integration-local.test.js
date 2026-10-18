'use strict'

const { test } = require('tap')
const { EventEmitter } = require('events')
const os = require('os')
const path = require('path')
const pkg = require('../../package.json')
const { run } = require('../../scripts/test-integration-local')

const UP = 'docker compose up --detach --wait'
const TESTS = 'npm run test:integration'
const DOWN = 'docker compose down'

// Builds a fake child_process.spawn. `behaviors` maps a command line to either
// an exit code, an Error (emitted as 'error'), the string 'hang' (the child
// only exits when killed) or a function invoked with the fake child.
function fakeSpawn (behaviors) {
  const calls = []
  const spawn = (command, args, options) => {
    const line = [command].concat(args).join(' ')
    calls.push({ line, options })
    const child = new EventEmitter()
    child.killed = []
    child.kill = (signal) => {
      child.killed.push(signal)
      setImmediate(() => child.emit('close', null, signal))
    }
    const behavior = Object.prototype.hasOwnProperty.call(behaviors, line)
      ? behaviors[line]
      : 0
    setImmediate(() => {
      if (typeof behavior === 'function') {
        behavior(child)
      } else if (behavior instanceof Error) {
        child.emit('error', behavior)
        child.emit('close', -2, null)
      } else if (behavior !== 'hang') {
        child.emit('close', behavior, null)
      }
    })
    return child
  }
  return { spawn, calls }
}

function runWith (behaviors, extra) {
  const fake = fakeSpawn(behaviors)
  const logs = []
  const proc = new EventEmitter()
  const promise = run(Object.assign({
    spawn: fake.spawn,
    log: (msg) => logs.push(msg),
    process: proc,
    platform: 'linux',
    cwd: '/project'
  }, extra))
  return { promise, calls: fake.calls, logs, proc }
}

test('package script uses the helper instead of legacy docker-compose', async t => {
  const script = pkg.scripts['test:integration:local']
  t.equal(script, 'node scripts/test-integration-local.js')
  t.notMatch(script, /docker-compose/)
})

test('starts OpenLDAP, waits for health, runs tests, and cleans up', async t => {
  const { promise, calls, logs } = runWith({})
  const code = await promise
  t.equal(code, 0)
  t.same(calls.map(c => c.line), [UP, TESTS, DOWN])
  for (const call of calls) {
    t.equal(call.options.cwd, '/project')
    t.equal(call.options.stdio, 'inherit')
  }
  t.same(logs, [])
})

test('defaults to the repository root as the compose project directory', async t => {
  const { promise, calls } = runWith({}, { cwd: undefined })
  await promise
  t.equal(calls[0].options.cwd, path.resolve(__dirname, '..', '..'))
})

test('cleans up and preserves the exit status when tests fail', async t => {
  const { promise, calls } = runWith({ [TESTS]: 3 })
  const code = await promise
  t.equal(code, 3)
  t.same(calls.map(c => c.line), [UP, TESTS, DOWN])
})

test('test failure is not masked by a failed cleanup', async t => {
  const { promise, logs } = runWith({ [TESTS]: 1, [DOWN]: 2 })
  t.equal(await promise, 1)
  t.match(logs.join('\n'), /docker compose down" failed/)
})

test('a failed cleanup fails an otherwise successful run', async t => {
  const { promise } = runWith({ [DOWN]: 2 })
  t.equal(await promise, 2)
})

test('skips tests but still cleans up when OpenLDAP does not become healthy', async t => {
  const { promise, calls, logs } = runWith({ [UP]: 1 })
  const code = await promise
  t.equal(code, 1)
  t.same(calls.map(c => c.line), [UP, DOWN])
  t.match(logs.join('\n'), /did not start or become healthy/)
})

test('reports a non-zero status when docker cannot be spawned', async t => {
  const enoent = Object.assign(new Error('spawn docker ENOENT'), { code: 'ENOENT' })
  const { promise, calls, logs } = runWith({ [UP]: enoent, [DOWN]: enoent })
  const code = await promise
  t.equal(code, 1)
  t.same(calls.map(c => c.line), [UP, DOWN])
  t.match(logs.join('\n'), /Unable to run "docker compose up --detach --wait": spawn docker ENOENT/)
})

test('reports a non-zero status when spawn throws synchronously', async t => {
  const logs = []
  const code = await run({
    spawn: () => { throw new Error('spawn EINVAL') },
    log: (msg) => logs.push(msg),
    process: new EventEmitter(),
    cwd: '/project'
  })
  t.equal(code, 1)
  t.equal(logs.filter(l => /spawn EINVAL/.test(l)).length, 2)
})

test('cleans up when interrupted while tests are running', async t => {
  let testChild
  const fake = runWith({
    [TESTS]: (child) => {
      testChild = child
      fake.proc.emit('SIGINT')
    }
  })
  const code = await fake.promise
  t.equal(code, 128 + os.constants.signals.SIGINT)
  t.same(testChild.killed, ['SIGINT'])
  t.same(fake.calls.map(c => c.line), [UP, TESTS, DOWN])
})

test('does not run tests when interrupted during startup', async t => {
  const fake = runWith({
    [UP]: () => fake.proc.emit('SIGTERM')
  })
  // The startup child keeps running until killed by the forwarded signal.
  const code = await fake.promise
  t.equal(code, 128 + os.constants.signals.SIGTERM)
  t.same(fake.calls.map(c => c.line), [UP, DOWN])
})

test('does not forward signals to the cleanup step', async t => {
  let downChild
  const fake = runWith({
    [DOWN]: (child) => {
      downChild = child
      fake.proc.emit('SIGINT')
      child.emit('close', 0, null)
    }
  })
  const code = await fake.promise
  t.same(downChild.killed, [])
  t.equal(code, 128 + os.constants.signals.SIGINT)
})

test('removes its signal handlers when finished', async t => {
  const { promise, proc } = runWith({ [TESTS]: 1 })
  t.equal(proc.listenerCount('SIGINT'), 1)
  t.equal(proc.listenerCount('SIGTERM'), 1)
  await promise
  t.equal(proc.listenerCount('SIGINT'), 0)
  t.equal(proc.listenerCount('SIGTERM'), 0)
})

test('spawns npm through a shell only on Windows', async t => {
  const linux = runWith({})
  await linux.promise
  t.equal(linux.calls[1].options.shell, false)

  const windows = runWith({}, { platform: 'win32' })
  await windows.promise
  t.equal(windows.calls[1].options.shell, true)
  t.notOk(windows.calls[0].options.shell)
  t.notOk(windows.calls[2].options.shell)
})
