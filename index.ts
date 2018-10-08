import { debug, debug_int } from './tests/index'
/*================================
=            Typedefs            =
================================*/

export enum JsmnType {
	JSMN_UNDEFINED = 0,
	JSMN_OBJECT = 1,
	JSMN_ARRAY = 2,
	JSMN_STRING = 3,
	JSMN_PRIMITIVE = 4
};

export enum JsmnErr {
	/* Not enough tokens were provided */
	JSMN_ERROR_NOMEM = -1,
	/* Invalid character inside JSON string */
	JSMN_ERROR_INVAL = -2,
	/* The string is not a full JSON packet, more bytes expected */
	JSMN_ERROR_PART = -3
};

/**
 * JSON token description.
 * type		type (object, array, string etc.)
 * start	start position in JSON data string
 * end		end position in JSON data string
 */
export class JsmnToken {
	type: JsmnType;
	start: i32;
	end: i32;
	size: i32;
	parent: i32;
}

/**
 * JSON parser. Contains an array of token blocks available. Also stores
 * the string being parsed now and current position in that string
 */
export class JsmnParser {
	pos: u32; /* offset in the JSON string */
	toknext: u32; /* next token to allocate */
	toksuper: i32; /* superior token node, e.g parent object or array */

	constructor() {
		this.pos = 0;
		this.toknext = 0;
		this.toksuper = -1;
	}
}

/*=====  End of Typedefs  ======*/

/**
 * Allocates a fresh unused token from the token pool.
 */
export function jsmn_alloc_token(parser: JsmnParser, tokens: Array<JsmnToken>, nTokens: u32): JsmnToken {
	if(parser.toknext > nTokens) {
		unreachable();
	}
	let tok: JsmnToken = tokens[parser.toknext++];
	tok.start = -1;
	tok.end = -1;
	tok.size = 0;
	tok.parent = -1;
	return tok;
}

/**
 * Fills token type and boundaries.
 */
export function jsmn_fill_token(token: JsmnToken, type: JsmnType,
                            start: i32, end: i32): void {
	token.type = type;
	token.start = start;
	token.end = end;
	token.size = 0;
}


/**
 * Fills next available token with JSON primitive.
 */
function jsmn_parse_primitive(parser: JsmnParser, js: string,
		len: u32, tokens: Array<JsmnToken>, nTokens: u32): i32 {
	debug("begin parse primitive");
	let token: JsmnToken;
	let start: i32 = parser.pos;
	let found: boolean = false;

	for (; parser.pos < len && js.charCodeAt(parser.pos) != '\0'.charCodeAt(0); parser.pos++) {
		debug(js[parser.pos]);
		switch (js.charCodeAt(parser.pos)) {
			case '\t'.charCodeAt(0): case '\r'.charCodeAt(0): case '\n'.charCodeAt(0): case ' '.charCodeAt(0):
			case ','.charCodeAt(0): case ']'.charCodeAt(0): case '}'.charCodeAt(0):
				// goto found;
				debug("found end of primitive");
				break;
		}
		if (js.charCodeAt(parser.pos) < 32 || js.charCodeAt(parser.pos) >= 127) {
			parser.pos = start;
			return JsmnErr.JSMN_ERROR_INVAL;
		}
	}
	/* In strict mode primitive must be followed by a comma/object/array */
	// This is if the for loop exits without found being flagged
	// parser.pos = start;
	// return JsmnErr.JSMN_ERROR_PART;

// found:
	// if (tokens == NULL) {
	// 	parser.pos--;
	// 	return 0;
	// }
	token = jsmn_alloc_token(parser, tokens, nTokens);
	// if (token == NULL) {
	// 	parser.pos = start;
	// 	return JsmnErr.JSMN_ERROR_NOMEM;
	// }
	jsmn_fill_token(token, JsmnType.JSMN_PRIMITIVE, start, parser.pos);
	token.parent = parser.toksuper;
	parser.pos--;
	return 0;
}


/**
 * Fills next token with JSON string.
 */
function jsmn_parse_string(parser: JsmnParser, js: string,
		len: u32, tokens: Array<JsmnToken>, nTokens: u32): i32 {
	debug("begin parse string");

	let token: JsmnToken;
	let start: i32 = parser.pos;

	parser.pos++;

	/* Skip starting quote */
	for (; parser.pos < len && js.charCodeAt(parser.pos) != '\0'.charCodeAt(0); parser.pos++) {
		let c: i32 = js.charCodeAt(parser.pos);
		debug(js[parser.pos]);
		/* Quote: end of string */
		if (c == '\"'.charCodeAt(0)) {
			debug("Found end of string")
			// if (tokens == NULL) {
			// 	return 0;
			// }
			token = jsmn_alloc_token(parser, tokens, nTokens);
			// if (tokens == NULL) {
			// 	parser.pos = start;
			// 	return JsmnErr.JSMN_ERROR_NOMEM;
			// }
			jsmn_fill_token(token, JsmnType.JSMN_STRING, start+1, parser.pos);
			token.parent = parser.toksuper;
			return 0;
		}

		/* Backslash: Quoted symbol expected */
		if (c == '\\'.charCodeAt(0) && parser.pos + 1 < len) {
			let i: i32;
			parser.pos++;
			switch (js.charCodeAt(parser.pos)) {
				/* Allowed escaped symbols */
				case '\"'.charCodeAt(0): case '/'.charCodeAt(0) : case '\\'.charCodeAt(0) : case 'b'.charCodeAt(0) :
				case 'f'.charCodeAt(0) : case 'r'.charCodeAt(0) : case 'n'.charCodeAt(0)  : case 't'.charCodeAt(0) :
					break;
				/* Allows escaped symbol \uXXXX */
				case 'u'.charCodeAt(0):
					parser.pos++;
					for(i = 0; i < 4 && parser.pos < len && js.charCodeAt(parser.pos) != '\0'.charCodeAt(0); i++) {
						/* If it isn't a hex character we have an error */
						if(!((js.charCodeAt(parser.pos) >= 48 && js.charCodeAt(parser.pos) <= 57) || /* 0-9 */
									(js.charCodeAt(parser.pos) >= 65 && js.charCodeAt(parser.pos) <= 70) || /* A-F */
									(js.charCodeAt(parser.pos) >= 97 && js.charCodeAt(parser.pos) <= 102))) { /* a-f */
							parser.pos = start;
							return JsmnErr.JSMN_ERROR_INVAL;
						}
						parser.pos++;
					}
					parser.pos--;
					break;
				/* Unexpected symbol */
				default:
					parser.pos = start;
					return JsmnErr.JSMN_ERROR_INVAL;
			}
		}
	}
	parser.pos = start;
	return JsmnErr.JSMN_ERROR_PART;
}


export function jsmnParse(parser: JsmnParser, js: string, len: u32,
	tokens: Array<JsmnToken>, nTokens: u32): i32 {
	
	let r: i32;
	let i: i32;
	let token: JsmnToken;
	let count: i32 = parser.toknext;

	for (; parser.pos < len && js.charCodeAt(parser.pos) != '\0'.charCodeAt(0); parser.pos++) {
		let c: i32
		let type: JsmnType;
		debug(js[parser.pos]);
		c = js.charCodeAt(parser.pos);
		switch (c) {
			case '{'.charCodeAt(0): case '['.charCodeAt(0):
				debug("begin object/array")
				count++;
				// if (tokens == NULL) {
				// 	break;
				// }
				token = jsmn_alloc_token(parser, tokens, nTokens);
				// if (tokens == NULL)
				// 	return JsmnErr.JSMN_ERROR_NOMEM;
				if (parser.toksuper != -1) {
					tokens[parser.toksuper].size++;
					token.parent = parser.toksuper;
				}
				token.type = (c == '{'.charCodeAt(0) ? JsmnType.JSMN_OBJECT : JsmnType.JSMN_ARRAY);
				token.start = parser.pos;
				parser.toksuper = parser.toknext - 1;
				break;
			case '}'.charCodeAt(0): case ']'.charCodeAt(0):
				debug("found end of object/array")
				// if (tokens == NULL)
				// 	break;
				type = (c == '}'.charCodeAt(0) ? JsmnType.JSMN_OBJECT : JsmnType.JSMN_ARRAY);
				if (parser.toknext < 1) {
					return JsmnErr.JSMN_ERROR_INVAL;
				}
				token = tokens[parser.toknext - 1];
				for (;;) {
					if (token.start != -1 && token.end == -1) {
						if (token.type != type) {
							return JsmnErr.JSMN_ERROR_INVAL;
						}
						token.end = parser.pos + 1;
						parser.toksuper = token.parent;
						break;
					}
					if (token.parent == -1) {
						if(token.type != type || parser.toksuper == -1) {
							return JsmnErr.JSMN_ERROR_INVAL;
						}
						break;
					}
					token = tokens[token.parent];
				}
				break;
			case '\"'.charCodeAt(0):
				r = jsmn_parse_string(parser, js, len, tokens, nTokens);
				if (r < 0) return r;
				count++;
				if (parser.toksuper != -1)// && tokens != NULL)
					tokens[parser.toksuper].size++;
				break;
			case '\t'.charCodeAt(0) : case '\r'.charCodeAt(0) : case '\n'.charCodeAt(0) : case ' '.charCodeAt(0):
				break;
			case ':'.charCodeAt(0):
				parser.toksuper = parser.toknext - 1;
				break;
			case ','.charCodeAt(0):
				if (parser.toksuper != -1 &&
						tokens[parser.toksuper].type != JsmnType.JSMN_ARRAY &&
						tokens[parser.toksuper].type != JsmnType.JSMN_OBJECT) {
					parser.toksuper = tokens[parser.toksuper].parent;
				}
				break;
			/* In strict mode primitives are: numbers and booleans */
			case '-'.charCodeAt(0): case '0'.charCodeAt(0): case '1'.charCodeAt(0): case '2'.charCodeAt(0): case '3'.charCodeAt(0): case '4'.charCodeAt(0):
			case '5'.charCodeAt(0): case '6'.charCodeAt(0): case '7'.charCodeAt(0): case '8'.charCodeAt(0): case '9'.charCodeAt(0):
			case 't'.charCodeAt(0): case 'f'.charCodeAt(0): case 'n'.charCodeAt(0):
				/* And they must not be keys of the object */
				if (parser.toksuper != -1) {// && tokens != NULL) {
					let t: JsmnToken = tokens[parser.toksuper];
					if (t.type == JsmnType.JSMN_OBJECT ||
							(t.type == JsmnType.JSMN_STRING && t.size != 0)) {
						return JsmnErr.JSMN_ERROR_INVAL;
					}
				}
				r = jsmn_parse_primitive(parser, js, len, tokens, nTokens);
				if (r < 0) return r;
				count++;
				if (parser.toksuper != -1)// && tokens != NULL)
					tokens[parser.toksuper].size++;
				break;

			/* Unexpected char in strict mode */
			default:
				return JsmnErr.JSMN_ERROR_INVAL;
		}
	}

	// if (tokens != NULL) {
	// 	for (i = parser.toknext - 1; i >= 0; i--) {
	// 		 Unmatched opened object or array 
	// 		if (tokens[i].start != -1 && tokens[i].end == -1) {
	// 			return JsmnErr.JSMN_ERROR_PART;
	// 		}
	// 	}
	// }

	return count;

}


