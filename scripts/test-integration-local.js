'use strict'

// Runs the integration suite against a local OpenLDAP container:
//
//   1. `docker compose up --detach --wait` starts OpenLDAP and waits for the
//      health check declared in docker-compose.yml.
//   2. `npm run test:integration` runs the suite (skipped if step 1 failed).
//   3. `docker compose down` always runs, even if a prior step failed or the
//      run was interrupted.
//
// The process exits with the status of the first failing step, so a failed
// test run is never masked by a successful cleanup.

const childProcess = require('child_process')
const os = require('os')
const path = require('path')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const SIGNALS = ['SIGINT', 'SIGTERM']

function signalExitCode (signal) {
  const number = os.constants.signals[signal]
  return typeof number === 'number' ? 128 + number : 1
}

function runCommand (spawn, command, args, options, log, onChild) {
  return new Promise((resolve) => {
    let settled = false
    const finish = (code) => {
      if (settled) return
      settled = true
      onChild(null)
      resolve(code)
    }
    const display = [command].concat(args).join(' ')

    let child
    try {
      child = spawn(command, args, options)
    } catch (err) {
      log(`Unable to run "${display}": ${err.message}`)
      finish(1)
      return
    }
    onChild(child)

    child.on('error', (err) => {
      log(`Unable to run "${display}": ${err.message}`)
      finish(1)
    })
    child.on('close', (code, signal) => {
      if (typeof code === 'number') {
        finish(code)
      } else {
        finish(signal ? signalExitCode(signal) : 1)
      }
    })
  })
}

async function run (opts = {}) {
  const spawn = opts.spawn || childProcess.spawn
  const log = opts.log || ((msg) => console.error(msg))
  const proc = opts.process || process
  const platform = opts.platform || process.platform
  const cwd = opts.cwd || PROJECT_ROOT

  const spawnOptions = { cwd, stdio: 'inherit' }
  // npm is a .cmd shim on Windows, which cannot be spawned without a shell.
  const npmOptions = Object.assign({}, spawnOptions, { shell: platform === 'win32' })

  let current = null
  let interrupted = null
  let cleaningUp = false
  const trackChild = (child) => { current = child }
  const onSignal = (signal) => {
    if (interrupted === null) interrupted = signal
    // Stop the running step, but never interrupt the cleanup step.
    if (current && !cleaningUp) current.kill(signal)
  }
  const handlers = SIGNALS.map((signal) => {
    const handler = () => onSignal(signal)
    proc.on(signal, handler)
    return [signal, handler]
  })

  try {
    let status = await runCommand(spawn, 'docker',
      ['compose', 'up', '--detach', '--wait'], spawnOptions, log, trackChild)

    if (interrupted !== null) {
      log(`Received ${interrupted}; skipping integration tests.`)
    } else if (status !== 0) {
      log('OpenLDAP did not start or become healthy; skipping integration tests.')
    } else {
      status = await runCommand(spawn, 'npm',
        ['run', 'test:integration'], npmOptions, log, trackChild)
    }

    cleaningUp = true
    const downStatus = await runCommand(spawn, 'docker',
      ['compose', 'down'], spawnOptions, log, trackChild)
    if (downStatus !== 0) {
      log('"docker compose down" failed; the OpenLDAP container may still be running.')
    }

    if (interrupted !== null) return signalExitCode(interrupted)
    return status !== 0 ? status : downStatus
  } finally {
    for (const [signal, handler] of handlers) {
      proc.removeListener(signal, handler)
    }
  }
}

module.exports = { run }

if (require.main === module) {
  run().then((code) => {
    process.exitCode = code
  }, (err) => {
    console.error(err)
    process.exitCode = 1
  })
}
