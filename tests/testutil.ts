import { JsmnToken, JsmnParser, JsmnType, JsmnErr, jsmnParse } from  '../index'
import { debug } from './index'


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
				// printf("token %d type is %d, not %d\n", i, tokens[i].type, expected[i].type);
				debug("token type not correct");
				return false;
			}
			if (expected[i].start >= 0 && expected[i].end >= 0) {
				if (tokens[i].start != expected[i].start) {
					// printf("token %d start is %d, not %d\n", i, tokens[i].start, expected[i].start);
					debug("token start not correct");
					return false;
				}
				if (tokens[i].end != expected[i].end ) {
					// printf("token %d end is %d, not %d\n", i, tokens[i].end, expected[i].end);
					debug("token end not correct");
					return false;
				}
			}
			if (expected[i].size && tokens[i].size != expected[i].size) {
				debug("token size not correct");
				// printf("token %d size is %d, not %d\n", i, tokens[i].size, expected[i].size);
				return false;
			}

			if (s != '' && expected[i].value != '') {
				if (expected[i].value != s.substring(tokens[i].start, tokens[i].end)) {
					// printf("token %d value is %.*s, not %s\n", i, tokens[i].end-tokens[i].start,
					// 		s+tokens[i].start, value);
					debug("token value not correct");
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
	let t: Array<JsmnToken> = new Array<JsmnToken>(numtok);

	r = jsmnParse(p, s, s.length, t, numtok);
	if (r != status) {
		// printf("status is %d, not %d\n", r, status);
		return false
	}

	if (status >= 0) {
		ok = tokeq(s, t, numtok, expected); 
	}

	// memory.free(); // free the stuff we allocated
	return ok;
}