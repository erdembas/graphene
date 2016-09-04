"use strict";
var Handle = (function () {
    function Handle() {
    }
    Handle.toString = function (buffer) {
        var buf = new Buffer(8);
        buf.fill(0);
        for (var i = 0; i < buffer.length; i++)
            buf[i] = buffer[i];
        return buffer_to_hex(revert_buffer(buf));
    };
    Handle.toBuffer = function (hex) {
        return revert_buffer(new Buffer(prepare_hex(hex), "hex"));
    };
    return Handle;
}());
exports.Handle = Handle;
function prepare_hex(hex) {
    var res = hex;
    while (res.length < 16) {
        res = "0" + res;
    }
    return res;
}
function revert_buffer(buffer) {
    if (buffer.length > 8)
        throw new TypeError("Wrong Buffer size");
    var b = new Buffer(8);
    b.fill(0);
    for (var i = 0; i < buffer.length; i++) {
        b[buffer.length - 1 - i] = buffer[i];
    }
    return b;
}
function buffer_to_hex(buffer) {
    return buffer.toString("hex").replace(/^0*/, "");
}
