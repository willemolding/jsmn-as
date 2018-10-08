var test_passed: i32 = 0;
var test_failed: i32 = 0;

/* Terminate current test with error */
@inline
function fail(): i32 {
	return -1;
}

/* Successful end of the test case */
@inline
function done(): i32 {
	return 0;
}


/* Check single condition */
@inline
function check(cond: boolean): void {
	do { 
		if (!(cond)) fail(); 
	} while (0);
}

/* Test runner */
function test(func: () => i32, name: string): void {
	const r = func();
	if (r == 0) {
		test_passed++;
	} else {
		test_failed++;
		// console.log("FAILED: %s (at line %d)\n", name, r);
	}
}