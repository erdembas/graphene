"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var fs = require("fs");
var graphene = require("../../graphene");
__export(require("../../graphene"));
var mech_1 = require("../../mech");
exports.Mechanism = mech_1.Mechanism;
var commander_1 = require("../lib/commander");
exports.commander = commander_1.commander;
exports.Command = commander_1.Command;
__export(require("./print"));
var print = require("./print");
__export(require("../lib/timer"));
__export(require("../../core"));
var handle_1 = require("../lib/handle");
exports.Handle = handle_1.Handle;
var handle_2 = require("../lib/handle");
exports.CAPTION_UNDERLINE = "==============================";
exports.MODULE_NOTE = "all commands require you to first load the PKCS #11 module";
exports.MODULE_EXAMPLE = "> module load -l {/path/to/pkcs11/lib/name.so} -n {LibName}";
exports.NOTE = exports.MODULE_NOTE + "\n\n    Example:\n\n      " + exports.MODULE_EXAMPLE;
exports.NOTE_SESSION = "all commands require you to first load the PKCS #11 module and log in." + "\n\n" +
    "    Example:" + "\n\n" +
    "      " + exports.MODULE_EXAMPLE + "\n" +
    "      > slot open --slot 0 --pin {YourPIN}";
exports.ERROR_MODULE_NOT_INITIALIZED = "Module is not initialized\n\n" +
    "Note:\n" +
    "  " + exports.MODULE_NOTE + "\n\n" +
    "Example:\n" +
    "  " + exports.MODULE_EXAMPLE;
exports.consoleApp = {
    module: null,
    session: null,
    slots: null
};
function check_module() {
    if (!exports.consoleApp.module)
        throw new Error(exports.ERROR_MODULE_NOT_INITIALIZED);
}
exports.check_module = check_module;
function check_file(v) {
    if (!fs.existsSync(v) || !fs.statSync(v).isFile())
        throw new Error("File is not found");
    return v;
}
exports.check_file = check_file;
exports.options = {
    slot: {
        description: "Slot index in Module",
        set: function (v) {
            check_module();
            if (!exports.consoleApp.slots)
                get_slot_list();
            var slot = exports.consoleApp.slots.items(v);
            if (!slot)
                throw new Error("Can not find Slot by index '" + v + "'");
            return slot;
        },
        isRequired: true
    },
    pin: {
        description: "The PIN for the slot",
        type: "pin"
    }
};
function get_slot_list() {
    check_module();
    exports.consoleApp.slots = exports.consoleApp.module.getSlots(true);
}
exports.get_slot_list = get_slot_list;
function check_session() {
    if (!(exports.consoleApp.session)) {
        var error = new Error("Session is not opened" + "\n\n" +
            "  " + exports.NOTE_SESSION);
        throw error;
    }
}
exports.check_session = check_session;
function print_module_info(mod) {
    print.print_caption("Module info");
    console.log("  Library: " + mod.libFile);
    console.log("  Name: " + mod.libName);
    console.log("  Cryptoki version: " + mod.cryptokiVersion.major + "." + mod.cryptokiVersion.minor);
    console.log();
}
exports.print_module_info = print_module_info;
function print_slot_info(slot) {
    print.print_caption("Slot info");
    console.log("  Handle: " + handle_2.Handle.toString(slot.handle));
    console.log("  Description: " + slot.slotDescription);
    console.log("  Manufacturer ID: " + slot.manufacturerID);
    console.log("  Firm version: " + slot.firmwareVersion.major + "." + slot.firmwareVersion.minor);
    console.log("  Hardware version: " + slot.hardwareVersion.major + "." + slot.hardwareVersion.minor);
    console.log("  Flags:");
    console.log("      HW: " + !!(slot.flags & graphene.SlotFlag.HW_SLOT));
    console.log("      Removable device: " + !!(slot.flags & graphene.SlotFlag.REMOVABLE_DEVICE));
    console.log("      Token present: " + !!(slot.flags & graphene.SlotFlag.TOKEN_PRESENT));
    if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
        console.log("  Token:");
        var token = slot.getToken();
        console.log("      Label: " + token.label);
        console.log("      Manufacturer ID: " + token.manufacturerID);
        console.log("      Model: " + token.model);
        console.log("      Serial number: " + token.serialNumber);
        console.log("      Max PIN length: " + token.maxPinLen);
        console.log("      Min PIN length: " + token.minPinLen);
        console.log("      Max session count: " + token.maxSessionCount);
        console.log("      Session count: " + token.sessionCount);
        console.log("      Max RW session count: " + token.maxRwSessionCount);
        console.log("      RW session count: " + token.rwSessionCount);
        console.log("      Total private memory: " + token.totalPrivateMemory);
        console.log("      Free private memory: " + token.freePrivateMemory);
        console.log("      Total public memory: " + token.totalPublicMemory);
        console.log("      Free public memory: " + token.freePublicMemory);
        console.log("      Firm version: " + slot.firmwareVersion.major + "." + slot.firmwareVersion.minor);
        console.log("      Hardware version: " + slot.hardwareVersion.major + "." + slot.hardwareVersion.minor);
        console.log("      Flags:");
        console.log("          Initialized: " + !!(token.flags & graphene.TokenFlag.TOKEN_INITIALIZED));
        console.log("          Logged in: " + !!(token.flags & graphene.TokenFlag.USER_PIN_INITIALIZED));
    }
    console.log();
}
exports.print_slot_info = print_slot_info;
