import 'allocator/arena'

import { tokeq, parse, TestToken } from './testutil'
import { JsmnToken, JsmnParser, JsmnType, JsmnErr, jsmnParse, jsmn_fill_token, jsmn_alloc_token } from  '../index'

declare namespace env {
  function debug(arg: i32, len: i32): void
  function debug_int(msg: i32): void;
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

export function debug_int(msg: i32): void {
  env.debug_int(msg);
}




export function test_jsmn_fill_token(): i32 {
  let token: JsmnToken = new JsmnToken();
  jsmn_fill_token(token, JsmnType.JSMN_PRIMITIVE, 1, 2);
  return check(
    token.type == JsmnType.JSMN_PRIMITIVE 
    && token.start == 1 
    && token.end == 2
    && token.size == 0)
}

export function test_jsmn_alloc_token(): i32 {
  let tokens: Array<JsmnToken> = new Array<JsmnToken>(1);
  tokens[0] = new JsmnToken();
  let parser = new JsmnParser();
  let allocToken = jsmn_alloc_token(parser, tokens, 1);
  return check(
    allocToken.start == -1
    && allocToken.end == -1
    && allocToken.size == 0
    && allocToken.parent == -1)
}

export function test_call_parse(): i32 {
  return jsmnParse(new JsmnParser(), "", 0, [], 0);
}

/*====================================
=            Ported Tests            =
====================================*/

/*----------  test_empty  ----------*/


export function test_empty_1(): i32 {
  return check(parse('{}', 1, 1,
        [{type: JsmnType.JSMN_OBJECT, start: 0, end: 2, size: 0, value: ''}]));
}
export function test_empty_2(): i32 {
  return check(parse('[]', 1, 1,
        [{type: JsmnType.JSMN_ARRAY, start: 0, end: 2, size: 0, value: ''}]));
}
export function test_empty_3(): i32 {
  return check(parse('[{},{}]', 3, 3,
        [{type: JsmnType.JSMN_ARRAY, start: 0, end: 7, size: 2, value: ''},
          {type: JsmnType.JSMN_OBJECT, start: 1, end: 3, size: 0, value: ''},
          {type: JsmnType.JSMN_OBJECT, start: 4, end: 6, size: 0, value: ''}]));
}

/*----------  test_object  ----------*/

// export function test_object_1(): i32 {
//   return check(parse('{"a":0}', 3, 3,
//         [{type: JsmnType.JSMN_OBJECT, start: 0, end: 7, size: 1, value: ''},
//           {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
//           {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '0'}]));
// }
export function test_object_2(): i32 { 
  return check(parse('{"a":[]}', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: 0, end: 8, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
          {type: JsmnType.JSMN_ARRAY, start: 5, end: 7, size: 0, value: ''}]));
}

/*----------  test_array  ----------*/

// export function test_array_1(): i32 {
//   return check(parse('[123]', 2, 2,
//         [{type: JsmnType.JSMN_ARRAY, start: 0, end: 5, size: 1, value: ''},
//         {type: JsmnType.JSMN_PRIMITIVE, start: 0, end: 0, size: 0, value: '123'}]));
// }

/*----------  test_string  ----------*/

export function test_string_1(): i32 {
  return check(parse('{"strVar" : "hello world"}', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'strVar'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: 'hello world'}]));
}
export function test_string_2(): i32 {
  return check(parse('{\"strVar\" : \"escapes: \\/\\r\\n\\t\\b\\f\\\"\\\\\"}', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'strVar'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: 'escapes: \\/\\r\\n\\t\\b\\f\\\"\\\\'}]));
}
export function test_string_3(): i32 {
  return check(parse('{"strVar": ""}', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'strVar'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: ''}]));
}
export function test_string_4(): i32 {
  return check(parse('{"a":"\\uAbcD"}', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: '\\uAbcD'}]));
}
export function test_string_5(): i32 {
  return check(parse('{"a":"\\uAbcD"}', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: '\\uAbcD'}]));
}
export function test_string_6(): i32 {
  return check(parse('{"a":"str\\u0000"}', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: 'str\\u0000'}]));
}
export function test_string_7(): i32 {
  return check(parse('{"a":"\\uFFFFstr"}', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: '\\uFFFFstr'}]));
}
export function test_string_8(): i32 {
  return check(parse('{"a":["\\u0280"]}', 4, 4,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
          {type: JsmnType.JSMN_ARRAY, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: '\\u0280'}]));
}


/*=====  End of Ported Tests  ======*/
