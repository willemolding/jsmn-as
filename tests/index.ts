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

export function test_object_1(): i32 {
  return check(parse('{"a":0}', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: 0, end: 7, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '0'}]));
}
export function test_object_2(): i32 { 
  return check(parse('{"a":[]}', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: 0, end: 8, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
          {type: JsmnType.JSMN_ARRAY, start: 5, end: 7, size: 0, value: ''}]));
}
export function test_object_3(): i32 { 
  return check(parse('{"a":{},"b":{}}', 5, 5,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 2, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
          {type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 0, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'b'},
          {type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 0, value: ''}]));
}
export function test_object_4(): i32 { 
  return check(parse('{\n "Day": 26,\n "Month": 9,\n "Year": 12\n }', 7, 7,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 3, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'Day'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '26'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'Month'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '9'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'Year'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '12'}]));
}
export function test_object_5(): i32 { 
  return check(parse('{"a": 0, "b": "c"}', 5, 5,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 2, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '0'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'b'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: 'c'}]));
}
export function test_object_invalid(): i32 {
  return check(
    parse('{"a"\n0}', JsmnErr.JSMN_ERROR_INVAL, 3, []) &&
    parse('{"a"\n0}', JsmnErr.JSMN_ERROR_INVAL, 3, []) &&
    parse('{"a", 0}', JsmnErr.JSMN_ERROR_INVAL, 3, []) &&
    parse('{"a": {2}}', JsmnErr.JSMN_ERROR_INVAL, 3, []) &&
    parse('{"a": {2: 3}}', JsmnErr.JSMN_ERROR_INVAL, 3, []) &&
    parse('{"a": {"a": 2 3}}', JsmnErr.JSMN_ERROR_INVAL, 5, [])
  );
}

/*----------  test_array  ----------*/

export function test_array_1(): i32 {
  return check(parse('[10]', 2, 2,
        [{type: JsmnType.JSMN_ARRAY, start: -1, end: -1, size: 1, value: ''},
        {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: 0, value: '10'}]));
}
export function test_array_2(): i32 {
  return check(parse('{"a": 1]', JsmnErr.JSMN_ERROR_INVAL, 3, []));
}

/*----------  test_primitive  ----------*/

export function test_primitive_1(): i32 {
  return check(parse('{"boolVar" : true }', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'boolVar'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: 'true'}]));
}
export function test_primitive_2(): i32 {
  return check(parse('{"boolVar" : false }', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'boolVar'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: 'false'}]));
}
export function test_primitive_3(): i32 {
  return check(parse('{"nullVar" : null }', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'nullVar'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: 'null'}]));
}
export function test_primitive_4(): i32 {
  return check(parse('{"intVar" : 12 }', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'intVar'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '12'}]));
}
export function test_primitive_5(): i32 {
  return check(parse('{"floatVar" : 12.345 }', 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'floatVar'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '12.345'}]));
}


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
export function test_string_invalid(): i32 {
  return check(
    parse('{\"a\":\"str\\uFFGFstr\"}', JsmnErr.JSMN_ERROR_INVAL, 3, []) &&
    parse('{\"a\":\"str\\u@FfF\"}', JsmnErr.JSMN_ERROR_INVAL, 3, []) &&
    parse('{{\"a\":[\"\\u028\"]}', JsmnErr.JSMN_ERROR_INVAL, 4, [])
  );
}

export function test_partial_string(): i32 {
  let r: i32;
  let p = new JsmnParser();
  let fails: i32 = 0;
  let success: i32 = 0;

  const nTokens = 5;
  let tok = new Array<JsmnToken>(nTokens);
  // allocate tokens...
  for(let j=0; j<nTokens; ++j) tok[j] = new JsmnToken();

  const js: string = '{"x": "va\\\\ue", "y": "value y"}';

  for (let i: i32 = 1; i <= js.length; i++) {
    r = jsmnParse(p, js, i, tok, nTokens);
    if (i == js.length) {
      fails += check(r == nTokens);
      fails += check(tokeq(js, tok, nTokens,
          [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 2, value: ''},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'x'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: 'va\\\\ue'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'y'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: 'value y'}]));
    } else {
      fails += check(r == JsmnErr.JSMN_ERROR_PART);
    }
  }
  return fails;
}

export function test_partial_array(): i32 {
  let r: i32;
  let p = new JsmnParser();
  let fails: i32 = 0;
  let success: i32 = 0;

  const nTokens = 6;
  let tok = new Array<JsmnToken>(nTokens);
  // allocate tokens...
  for(let j=0; j<nTokens; ++j) tok[j] = new JsmnToken();

  const js: string = '[ 1, true, [123, "hello"]]';

  for (let i: i32 = 1; i <= js.length; i++) {
    r = jsmnParse(p, js, i, tok, nTokens);
    if (i == js.length) {
      fails += check(r == nTokens);
      fails += check(tokeq(js, tok, nTokens,
          [{type: JsmnType.JSMN_ARRAY, start: -1, end: -1, size: 3, value: ''},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '1'},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: 'true'},
          {type: JsmnType.JSMN_ARRAY, start: -1, end: -1, size: 2, value: ''},
          {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '123'},
          {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: 'hello'}]));
    } else {
      fails += check(r == JsmnErr.JSMN_ERROR_PART);
    }
  }
  return fails;
}

export function test_array_nomem(): i32 {
  let r: i32;

  let fails: i32 = 0;
  let success: i32 = 0;

  const nTokens = 6;
  let tokSmall = new Array<JsmnToken>(nTokens);
  let tokLarge = new Array<JsmnToken>(nTokens);

  // allocate tokens...
  for(let j=0; j<nTokens; ++j) tokSmall[j] = new JsmnToken();
  for(let j=0; j<nTokens; ++j) tokLarge[j] = new JsmnToken();


  const js: string = '[ 1, true, [123, "hello"]]';

  for (let i: i32 = 0; i < nTokens; i++) {
    let p = new JsmnParser();

    r = jsmnParse(p, js, js.length, tokSmall, i);

    fails += check(r == JsmnErr.JSMN_ERROR_NOMEM);
    debug_int(r);

    p = new JsmnParser();

    r = jsmnParse(p, js, js.length, tokLarge, nTokens);

    fails += check(tokeq(js, tokLarge, nTokens,
      [{type: JsmnType.JSMN_ARRAY, start: -1, end: -1, size: 3, value: ''},
      {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '1'},
      {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: 'true'},
      {type: JsmnType.JSMN_ARRAY, start: -1, end: -1, size: 2, value: ''},
      {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '123'},
      {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 0, value: 'hello'}]));

  }
  return fails;
}


/*=====  End of Ported Tests  ======*/
