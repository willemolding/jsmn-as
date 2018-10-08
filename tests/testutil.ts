import { JsmnToken, JsmnParser, JsmnType, JsmnErr, jsmnInit, jsmnParse } from  '../index'

function vtokeq(s: string, tokens: Array<JsmnToken>, numtok: i32, va_list ap): i32 {
	if (numtok > 0) {
		int i, start, end, size;
		int type;
		char *value;

		size = -1;
		value = NULL;
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

function tokeq(s: string, tokens: Array<JsmnToken>, numtok: i32, ...): i32 {
	var ok: i32;
	va_list args;
	va_start(args, numtok);
	ok = vtokeq(s, tokens, numtok, args); 
	va_end(args);
	return ok;
}

function parse(s: string, status: i32, numtok: i32, ...): i32 {
	var r: i32;
	var ok: i32 = 1;
	va_list args;
	const p: JsmnParser = new JsmnParser();
	const t: Array<JsmnToken> = new Array<JsmnToken>(numtok);

	jsmnInit(p);
	r = jsmnParse(p, s, s.length, t, numtok);
	if (r != status) {
		// printf("status is %d, not %d\n", r, status);
		return 0;
	}

	if (status >= 0) {
		va_start(args, numtok);
		ok = vtokeq(s, t, numtok, args); 
		va_end(args);
	}

	// memory.free(); // free the stuff we allocated
	return ok;
}