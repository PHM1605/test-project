let scope = "global";
function constructFunction() {
    let scope = "local";
    return new Function("return scope"); // Doesn't capture local scope!
}
// This line returns "global" because the function returned by the
// Function() constructor does not use the local scope.
constructFunction()() // => "global"