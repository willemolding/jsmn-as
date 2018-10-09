import { JsmnToken, JsmnParser, JsmnType, JsmnErr, jsmnParse, allocateTokenArray} from  '../index'

declare namespace env {
  function debug(arg: i32, len: i32): void
  function debug_int(msg: i32): void;
}

export function debug(msg: string): void {
  env.debug(changetype<i32>(msg)+4, msg.length);
}

export function debug_int(msg: i32): void {
  env.debug_int(msg);
}

export class TestToken {
	type: JsmnType
	value: string
	size: i32
	start: i32
	end: i32
}


export function tokeq(s: string, tokens: Array<JsmnToken>, numtok: i32, expected: Array<TestToken>): boolean {
	if (numtok > 0) {
		for (let i: i32 = 0; i < numtok; i++) {
			if (tokens[i].type != expected[i].type) {
				debug("token type not correct. Actual type was");
				debug_int(tokens[i].type)
				debug("expecting")
				debug_int(expected[i].type)
				return false;
			}
			if (expected[i].start != -1 && expected[i].end != -1) {
				if (tokens[i].start != expected[i].start) {
					debug("token start not correct. Actual start was");
					debug_int(tokens[i].start)
					debug("expecting")
					debug_int(expected[i].start)
					return false;
				}
				if (tokens[i].end != expected[i].end ) {
					debug("token end not correct. Actual end was");
					debug_int(tokens[i].end)
					debug("expecting")
					debug_int(expected[i].end)
					return false;
				}
			}
			if (expected[i].size != -1 && tokens[i].size != expected[i].size) {
				debug("token size not correct. Actual size was");
				debug_int(tokens[i].size)
				debug("expecting")
				debug_int(expected[i].size)
				return false;
			}

			if (s != '' && expected[i].value != '') {
				if (expected[i].value != s.substring(tokens[i].start, tokens[i].end)) {
					debug("token value not correct. Actual value was");
					debug(s.substring(tokens[i].start, tokens[i].end))
					debug("expecting")
					debug(expected[i].value)
					return false;
				}
			}
		}
	}
	return true;
}


export function parse(s: string, status: i32, numtok: i32, expected: Array<TestToken>): boolean {
	let r: i32;
	let ok: boolean = false;
	let p: JsmnParser = new JsmnParser();
  	let t = allocateTokenArray(numtok);


	r = jsmnParse(p, s, s.length, t, numtok);
	if (r != status) {
		debug("status code not ok. Actual status code:");
		debug_int(r);
		debug("expecting:");
		debug_int(status);
		return false
	}

	if(expected.length == 0) { // no expected to check against
		return true;
	}

	return tokeq(s, t, numtok, expected);
}


export function tokenize(json: string, toks: Array<JsmnToken>): i32 {
  return jsmnParse(
    new JsmnParser(),
    json,
    json.length,
    toks,
    toks.length
  )
}