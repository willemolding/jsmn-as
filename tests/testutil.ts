import { JsmnToken, JsmnParser, JsmnType, JsmnErr, jsmnInit, jsmnParse } from  '../index'

export class TestToken {
	type: JsmnType
	value?: string
	size?: i32
	start?: i32
	end?: i32
}


function vtokeq(s: string, tokens: Array<JsmnToken>, numtok: i32, expected: Array<TestToken>): i32 {
	if (numtok > 0) {
		let i: i32, 
		start: i32, 
		end: i32, 
		size: i32 = -1,
		type: i32;

		let value: string = ''; // should really be a character

		for (i = 0; i < numtok; i++) {
			type = va_arg(ap, int);
			if (type == JSMN_STRING) {
				value = va_arg(ap, char *);
				size = va_arg(ap, int);
				start = end = -1;
			} else if (type == JSMN_PRIMITIVE) {
				value = va_arg(ap, char *);
				start = end = size = -1;
			} else {
				start = va_arg(ap, int);
				end = va_arg(ap, int);
				size = va_arg(ap, int);
				value = NULL;
			}
			if (t[i].type != type) {
				printf("token %d type is %d, not %d\n", i, t[i].type, type);
				return 0;
			}
			if (start != -1 && end != -1) {
				if (t[i].start != start) {
					printf("token %d start is %d, not %d\n", i, t[i].start, start);
					return 0;
				}
				if (t[i].end != end ) {
					printf("token %d end is %d, not %d\n", i, t[i].end, end);
					return 0;
				}
			}
			if (size != -1 && t[i].size != size) {
				printf("token %d size is %d, not %d\n", i, t[i].size, size);
				return 0;
			}

			if (s != NULL && value != NULL) {
				const char *p = s + t[i].start;
				if (strlen(value) != t[i].end - t[i].start ||
						strncmp(p, value, t[i].end - t[i].start) != 0) {
					printf("token %d value is %.*s, not %s\n", i, t[i].end-t[i].start,
							s+t[i].start, value);
					return 0;
				}
			}
		}
	}
	return 1;
}

function tokeq(s: string, tokens: Array<JsmnToken>, numtok: i32, expected: Array<TestToken>): i32 {
	let ok: i32;
	ok = vtokeq(s, tokens, numtok, expected); 
	return ok;
}

function parse(s: string, status: i32, numtok: i32, expected: Array<TestToken>): i32 {
	let r: i32;
	let ok: i32 = 1;
	const p: JsmnParser = new JsmnParser();
	const t: Array<JsmnToken> = new Array<JsmnToken>(numtok);

	jsmnInit(p);
	r = jsmnParse(p, s, s.length, t, numtok);
	if (r != status) {
		// printf("status is %d, not %d\n", r, status);
		return 0;
	}

	if (status >= 0) {
		ok = vtokeq(s, t, numtok, expected); 
	}

	// memory.free(); // free the stuff we allocated
	return ok;
}