import 'allocator/arena'

import { tokeq, parse, TestToken } from './testutil'
import { JsmnToken, JsmnParser, JsmnType, JsmnErr, jsmnParse } from  '../index'

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

function check(val: boolean): i32 {
  return val ? 0 : -1;
}

export function debug(msg: string): void {
  env.debug(changetype<i32>(msg)+4, msg.length);
}

export function test_something(): i32 {
  return tokeq('{}', [token], 1, [testToken]) ? 0 : -1;
}

export function test_call_parse(): i32 {
  return jsmnParse(new JsmnParser(), "", 0, [], 0);
}

/*====================================
=            Ported Tests            =
====================================*/

export function test_empty(): i32 {
  let result = true;
  result = result && parse("{}", 1, 1,
        [{type: JsmnType.JSMN_OBJECT, start: 0, end: 2, size: 0, value: ''}]);
  result = result && parse("[]", 1, 1,
        [{type: JsmnType.JSMN_ARRAY, start: 0, end: 2, size: 0, value: ''}]);
  // result = result && parse("[{},{}]", 3, 3,
  //       [{type: JsmnType.JSMN_ARRAY, start: 0, end: 7, size: 2, value: ''},
  //         {type: JsmnType.JSMN_OBJECT, start: 1, end: 3, size: 0, value: ''},
  //         {type: JsmnType.JSMN_OBJECT, start: 4, end: 6, size: 0, value: ''}]);
  return result ? 0 : -1;
}

/*=====  End of Ported Tests  ======*/
