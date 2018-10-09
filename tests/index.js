var test = require('tape');
var fs = require("fs");


// Instantiate the module
var mod = new WebAssembly.Module(fs.readFileSync(__dirname + "/build/untouched.wasm"));
var ins = new WebAssembly.Instance(mod, {
  env: {
    abort: function(msg, file, line, column) { throw Error(`abort called at ${line}:${column}`); },
    debug: function(offset, length) {
        console.log(String.fromCharCode.apply(
            null,
            new Uint16Array(ins.exports.memory.buffer.slice(offset, offset+(length*2))))
        );
    },
    debug_int: function(msg) {
        console.log(msg);
    }
  }
});


// Run all the functions that start with test that are exported from the wasm code
Object.keys(ins.exports).forEach((key) => {
    if(key.startsWith('test')) {
        // console.log(key);
        test(key, function (t) {
            t.equal(ins.exports[key](), 0);
            t.end()
        });
    }
});


