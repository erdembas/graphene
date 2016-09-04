"use strict";
var defs = require("./defs");
var consoleApp = defs.consoleApp;
defs.commander.createCommand("?", "output usage information")
    .on("call", function (v) {
    console.log();
    console.log("  Commands:");
    for (var i in defs.commander.commands) {
        var cmd = defs.commander.commands[i];
        console.log("    " + defs.pud(cmd.name, 10) + cmd.description);
    }
    console.log();
    console.log(print_module_note());
    console.log();
});
exports.cmdModule = defs.commander.createCommand("module", {
    description: "load and retrieve information from the PKCS#11 module",
    note: defs.MODULE_NOTE,
    example: defs.MODULE_EXAMPLE
})
    .on("call", function (cmd) {
    this.help();
});
function print_module_note() {
    var msg = "  Note:" + "\n";
    msg += "    all commands require you to first load the PKCS #11 module" + "\n\n";
    msg += "      > module load -l /path/to/pkcs11/lib/name.so -n LibName";
    return msg;
}
exports.cmdModuleVendor = exports.cmdModule.createCommand("vendor", {
    description: "get additional algorithms from JSON file",
    example: defs.MODULE_EXAMPLE
})
    .option("file", {
    description: "Path to json file",
    set: defs.check_file,
    isRequired: true
})
    .on("call", function (cmd) {
    console.log();
    defs.Mechanism.vendor(cmd.file);
    console.log("Algorithms was added");
    console.log(defs.MechanismEnum);
    console.log();
});
exports.cmdModuleLoad = exports.cmdModule.createCommand("load", {
    description: "loads a specified PKCS#11 module",
    example: defs.MODULE_EXAMPLE
})
    .option("name", {
    description: "Name of module",
    isRequired: true
})
    .option("lib", {
    description: "Path to library",
    set: defs.check_file,
    isRequired: true
})
    .on("call", function (cmd) {
    consoleApp.module = defs.Module.load(cmd.lib, cmd.name);
    consoleApp.module.initialize();
    defs.print_module_info(consoleApp.module);
});
exports.cmdModuleInit = exports.cmdModule.createCommand("init", {
    description: "initialize pkcs11 module by config file (graphene.json)",
    example: ""
})
    .option("path", {
    description: "Path to config file",
    isRequired: true
})
    .on("call", function (cmd) {
    console.log();
    console.log("Initializing module by config file...");
    console.log();
    if (!cmd || !cmd.path) {
        cmd = { path: "graphene.json" };
    }
    var config = null;
    try {
        config = require(cmd.path);
        if (config) {
            consoleApp.module = defs.Module.load(config.lib, config.libName);
            consoleApp.module.initialize();
            var slot = consoleApp.module.getSlots(config.slot);
            consoleApp.session = slot.open();
            consoleApp.session.login(config.pin);
            for (var i in config.vendor) {
                defs.Mechanism.vendor(config.vendor[i]);
            }
            console.log("Ok");
        }
    }
    catch (e) {
        console.log("Error om module initialize");
        console.log(e);
    }
    console.log();
});
exports.cmdModuleInfo = exports.cmdModule.createCommand("info", {
    description: "returns info about Module",
    note: defs.NOTE
})
    .on("call", function (cmd) {
    defs.check_module();
    defs.print_module_info(consoleApp.module);
});
