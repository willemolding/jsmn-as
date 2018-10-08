
/*================================
=            Typedefs            =
================================*/

export enum jsmnType {
	JSMN_UNDEFINED = 0,
	JSMN_OBJECT = 1,
	JSMN_ARRAY = 2,
	JSMN_STRING = 3,
	JSMN_PRIMITIVE = 4
};

export enum jsmnErr {
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
export class jsmnToken {
	type: jsmnType;
	start: i32;
	end: i32;
	size: i32;
	parent: i32;
}

/**
 * JSON parser. Contains an array of token blocks available. Also stores
 * the string being parsed now and current position in that string
 */
export class jsmnParser {
	pos: u32; /* offset in the JSON string */
	toknext: u32; /* next token to allocate */
	toksuper: i32; /* superior token node, e.g parent object or array */
}

/*=====  End of Typedefs  ======*/





