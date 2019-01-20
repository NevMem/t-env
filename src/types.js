export const ADD_STDOUT = 'test stdout'
export const RE_INIT = 're_init'
export const ADD_RECORD = 'add record'
export const TOGGLE_EXPANDING = 'toggle expanding'
export const DISCONNECT = 'disconnect'
export const CHANGE_STATUS = 'change status'
export const CHANGE_FEEDBACK = 'change feedback'

export const changeFeedback = info => {
  return {
    type: CHANGE_FEEDBACK,
    payload: info
  }
}

export const changeStatus = status => {
  return {
    type: CHANGE_STATUS,
    payload: status
  }
}

export const addRecord = (record) => {
  return {
    type: ADD_RECORD,
    payload: { ...record }
  }
}

export const addTestStdout = (queueIndex, testIndex, stdout) => {
  return {
    type: ADD_STDOUT,
    payload: { queueIndex, testIndex, stdout }
  }
}

export const toggleExpanding = index => {
  return {
    type: TOGGLE_EXPANDING,
    payload: { index }
  }
}

export const reInit = () => {
  return {
    type: RE_INIT
  }
}

export const disconnect = () => {
  return {
    type: DISCONNECT
  }
}