import 'allocator/arena'

import { tokeq, parse, tokenize, TestToken } from './testutil'
import { JsmnToken, JsmnParser, JsmnType, JsmnErr, jsmnParse, allocateTokenArray, freeTokenArray } from  '../index'
import { debug, debug_int } from './testutil'
export { debug, debug_int } from './testutil'

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
  let tok = allocateTokenArray(nTokens);

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
  let tok = allocateTokenArray(nTokens);
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
  let tokSmall = allocateTokenArray(nTokens);
  let tokLarge = allocateTokenArray(nTokens);



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


export function test_issue_22(): i32 {
  const nTokens = 128;
  let tok = allocateTokenArray(nTokens);

  const js: string = `{ "height":10, "layers":[ { "data":[6,6], "height":10, \
   "name":"Calque de Tile 1", "opacity":1, "type":"tilelayer", \
   "visible":true, "width":10, "x":0, "y":0 }], \
   "orientation":"orthogonal", "properties": { }, "tileheight":32, \
   "tilesets":[ { "firstgid":1, "image":"..\\/images\\/tiles.png", \
   "imageheight":64, "imagewidth":160, "margin":0, "name":"Tiles", \
   "properties":{}, "spacing":0, "tileheight":32, "tilewidth":32 }], \
   "tilewidth":32, "version":1, "width":10 }`;

    let p = new JsmnParser();

    let r: i32 = jsmnParse(p, js, js.length, tok, 128);
    debug_int(r);
    return(check(r>0));
}

export function test_issue_27(): i32 {
  return check(
    parse('{ "name" : "Jack", "age" : 27 } { "name" : "Anna", ',
    JsmnErr.JSMN_ERROR_PART, 8, []));
}


export function test_input_length(): i32 {
  const nTokens = 10;
  let tok = allocateTokenArray(nTokens);


  const js: string = '{"a": 0}garbage';

  let p = new JsmnParser();

  let r: i32 = jsmnParse(p, js, js.length, tok, nTokens);
  return check(tokeq(js, tok, 3,
        [{type: JsmnType.JSMN_OBJECT, start: -1, end: -1, size: 1, value: ''},
      {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'a'},
      {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '0'}]));
}


export function test_count(): i32 {

  const nTokens = 10;
  let tok = allocateTokenArray(nTokens);


  let js: string;
  let fails: i32 = 0;
  let p: JsmnParser

  js = "{}";
  p = new JsmnParser();
  fails += check(jsmnParse(p, js, js.length, tok, nTokens) == 1);

  js = "[]";
  p = new JsmnParser();
  fails += check(jsmnParse(p, js, js.length, tok, nTokens) == 1);

  js = "[[]]";
  p = new JsmnParser();
  fails += check(jsmnParse(p, js, js.length, tok, nTokens) == 2);

  js = "[[], []]";
  p = new JsmnParser();
  fails += check(jsmnParse(p, js, js.length, tok, nTokens) == 3);

  js = "[[], []]";
  p = new JsmnParser();
  fails += check(jsmnParse(p, js, js.length, tok, nTokens) == 3);

  js = "[[], [[]], [[], []]]";
  p = new JsmnParser();
  fails += check(jsmnParse(p, js, js.length, tok, nTokens) == 7);

  js = "[\"a\", [[], []]]";
  p = new JsmnParser();
  fails += check(jsmnParse(p, js, js.length, tok, nTokens) == 5);

  js = "[[], \"[], [[]]\", [[]]]";
  p = new JsmnParser();
  fails += check(jsmnParse(p, js, js.length, tok, nTokens) == 5);

  js = "[1, 2, 3]";
  p = new JsmnParser();
  fails += check(jsmnParse(p, js, js.length, tok, nTokens) == 4);

  js = "[1, 2, [3, \"a\"], null]";
  p = new JsmnParser();
  fails += check(jsmnParse(p, js, js.length, tok, nTokens) == 7);

  return fails;
}

export function test_unmatched_brackets(): i32 {

  let js: string;
  let fails: i32 = 0;

  js = '"key 1": 1234}';
  fails += check(parse(js, JsmnErr.JSMN_ERROR_INVAL, 2, []));
  js = '{"key 1": 1234';
  fails += check(parse(js, JsmnErr.JSMN_ERROR_PART, 3, []));
  js = '{"key 1": 1234}}';
  fails += check(parse(js, JsmnErr.JSMN_ERROR_INVAL, 3, []));
  js = '"key 1"}: 1234';
  fails += check(parse(js, JsmnErr.JSMN_ERROR_INVAL, 3, []));
  js = '{"key {1": 1234}';
  fails += check(parse(js, 3, 3,
        [{type: JsmnType.JSMN_OBJECT, start: 0, end: 16, size: 1, value: ''},
      {type: JsmnType.JSMN_STRING, start: -1, end: -1, size: 1, value: 'key {1'},
      {type: JsmnType.JSMN_PRIMITIVE, start: -1, end: -1, size: -1, value: '1234'}]));
  js = "{{\"key 1\": 1234}";
  fails += check(parse(js, JsmnErr.JSMN_ERROR_PART, 4, []));
  return fails;
}

/*=====  End of Ported Tests  ======*/

/*======================================
=            Test stringify            =
======================================*/

import { stringify } from '../stringify'

export function test_stringify_string(): i32 {
  return check(stringify('abc') == '"abc"');
}

export function test_stringify_int(): i32 {
  return check(stringify(10) == '10');
}

export function test_stringify_float(): i32 {
  return check(stringify(10.123) == '10.123');
}

export function test_stringify_true(): i32 {
  debug(stringify(true));
  return check(stringify(true) == 'true');
}

export function test_stringify_false(): i32 {
  debug(stringify(false));
  return check(stringify(false) == 'false');
}

export function test_stringify_null(): i32 {
  return check(stringify(null) == 'null');
}

export function test_stringify_array_int(): i32 {
  let x: Array<i32> = [1,2,3];
  return check(stringify(x) == '[1,2,3]');
}

export function test_stringify_array_float(): i32 {
  let x: Array<f64> = [1.0,2.5,3.33333];
  return check(stringify(x) == '[1.0,2.5,3.33333]');
}

export function test_stringify_array_array_int(): i32 {
  let x: Array<Array<i32>> = [[1,2,3],[4,5,6]];
  return check(stringify(x) == '[[1,2,3],[4,5,6]]');
}

class X {
  a: string = "hi"
  b: i32 = 10
  toString(): string {
    return '{"a":'+stringify(this.a)
          +',"b":'+stringify(this.b)+'}'
  }
}
export function test_stringify_object(): i32 {
  let x: X = new X();
  debug(stringify(x));
  return check(stringify(x) == '{"a":"hi","b":10}');
}


class A {
  a: string
  b: B
  constructor(a: string, p: string, q: i32) {
    this.a = a
    this.b = new B()
    this.b.p = p;
    this.b.q = q
  }
  toString(): string {
    return '{"a":'+stringify(this.a)
          +',"b":'+stringify(this.b)+'}'
  }
}
class B {
  p: string
  q: i32
  toString(): string {
    return '{"p":'+stringify(this.p)
          +',"q":'+stringify(this.q)+'}'
  }
}

export function test_stringify_nested_objects(): i32 {
  let a: A = new A("hi_a", "hi_b", 20);
  debug(stringify(a));
  return check(stringify(a) == '{"a":"hi_a","b":{"p":"hi_b","q":20}}');
}


/*=====  End of Test stringify  ======*/



/*====================================
=            Test marshal            =
====================================*/

@deserializable
class C1 {
  a: i32
}

@deserializable
class C2 {
  b: C1;
  x: string;
}

@deserializable
class C3 {
  c: Array<i32>;
  d: Array<C1>;
}

export function test_marshal_C1(): i32 {
  let toks = allocateTokenArray(3)
  const json = `{"a": 12345}`
  tokenize(json, toks)
  let o = marshal_C1(json, toks)
  return check(o.a == 12345)
}

export function test_marshal_C2(): i32 {
  let toks = allocateTokenArray(20)  // too many but who's counting?
  const json = `{"x": "fooooo", "b": {"a": -32}}`
  tokenize(json, toks)
  let o = marshal_C2(json, toks)
  return check(o.b.a == -32) || check(o.x.length === 6)
}

export function test_marshal_C3(): i32 {
  let toks = allocateTokenArray(30)  // too many but who's counting?
  const json = `{"c": [1,2,3], "d": [{"a": -1}, {"a": -2}]}`
  tokenize(json, toks)
  let o = marshal_C3(json, toks)
  return check(o.c[1] == 2) || check(o.d[1].a == -2)
}

/*=====  End of Test marshal  ======*/

