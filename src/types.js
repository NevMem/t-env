export const ADD_STDOUT = 'test stdout'
export const RE_INIT = 're_init'
export const ADD_RECORD = 'add record'
export const TOGGLE_EXPANDING = 'toggle expanding'
export const DISCONNECT = 'disconnect'
export const CHANGE_STATUS = 'change status'

export const changeStatus = status => {
  return {
    type: CHANGE_STATUS,
    payload: status
  }
}

export let addRecord = (record) => {
  return {
    type: ADD_RECORD,
    payload: { ...record }
  }
}

export let addTestStdout = (queueIndex, testIndex, stdout) => {
  return {
    type: ADD_STDOUT,
    payload: { queueIndex, testIndex, stdout }
  }
}

export let toggleExpanding = index => {
  return {
    type: TOGGLE_EXPANDING,
    payload: { index }
  }
}

export let reInit = () => {
  return {
    type: RE_INIT
  }
}

export let disconnect = () => {
  return {
    type: DISCONNECT
  }
}