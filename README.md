# JSMN-AS

A port of the [JSMN JSON parser](https://github.com/zserge/jsmn) to Assemblyscript

## Usage

This is a JSON tokenizer that operates on a string in-place and fills an array of **tokens** which give the start and end index in the string as well as hint at the type (array/object/primitive). 

Parsing of the tokens in to their correct data types must be handled by the consuming code.

JSMN will not allocate any memory so all of this must be done in advance. This is by design so the consumer can have complete control over memory management. A simple tokenization can be implemented in assemblyscript as follows:

```typescript
import {JsmnToken, JsmnParser, jsmnParse, allocateTokenArray, freeTokenArray } from 'jsmn-as/index'

const jsonString: string = `{"Day": 26, "Month": 9, "Year": 12}`
let maxNTokens: i32 = 10;
let tokens: Array<JsmnToken> = allocateTokenArray(maxNTokens);
let parser: JsmnParser = new JsmnParser();

let result: i32 = jsmnParse(parser, jsonString, jsonString.length, tokens, maxNTokens);

// result will be the number of parsed token if successful or an error code (JsmnErr)

// do whatever with the tokens
print(tokens[1].value); // Day
...

freeTokenArray(tokens);
```

## Running the tests

After cloning the repo tests can be run by
```
npm install
npm run build:tests
npm run test
```
This is a port of the original test suite from the JSMN repo

## Built With

* [Assemblyscript](https://github.com/AssemblyScript) - Typescript to WASM compiler

## Authors

* [**Willem Olding**](https://github.com/willemolding)

## License

This project is licensed under the GPL-3 License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [Original authors of JSMN](https://github.com/zserge/jsmn/graphs/contributors)

