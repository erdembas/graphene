"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CommandError = (function (_super) {
    __extends(CommandError, _super);
    function CommandError(command, message) {
        _super.call(this);
        this.message = "CommandError: " + message;
        this.command = command;
        this.stack = (new Error(this.message)).stack;
    }
    return CommandError;
}(Error));
exports.CommandError = CommandError;
