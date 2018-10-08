import 'allocator/arena'

import { tokeq, parse, TestToken } from './testutil'
import { fail, done, check, test } from './test'
import { JsmnToken, JsmnParser, JsmnType, JsmnErr, jsmnInit, jsmnParse } from  '../index'

declare namespace env {
  function debug(arg: i32, len: i32): void
}

let token: JsmnToken = {
  type: JsmnType.JSMN_OBJECT,
  start: 0,
  end: 2,
  size: 2,
  parent: 0,
}

let testToken: TestToken = {
  type: JsmnType.JSMN_OBJECT,
  start: 0,
  end: 2,
  size: 2,
  value: '{}'
}

export function debug(msg: string): void {
  env.debug(changetype<i32>(msg)+4, msg.length);
}

export function test_something(): i32 {
  return tokeq('{}', [token], 1, [testToken]) ? 0 : -1;
}