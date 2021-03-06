var assert = require('assert');
var config = require("./config.json");
var graphene = require("../build/graphene");

var Module = graphene.Module;

describe("ECDSA", function () {
    var mod, slot, session, keys, skey;

    var MSG = "1234567890123456";
    var MSG_WRONG = MSG + "!";

    function test_manufacturer(manufacturerID) {
        if (mod.manufacturerID == manufacturerID) {
            console.warn("    \x1b[33mWARN:\x1b[0m Test is not supported for %s", manufacturerID);
            return true;
        }
        return false;
    }

    function isSoftHSM() {
        return test_manufacturer("SoftHSM");
    }

    before(function () {
        mod = Module.load(config.init.lib, config.init.libName);
        mod.initialize();
        slot = mod.getSlots(0);
        session = slot.open();
        session.login(config.init.pin);
        if (config.init.vendor) {
            graphene.Mechanism.vendor(config.init.vendor);
        }
    })

    after(function () {
        if (session)
            session.logout();
        mod.finalize();
    })

    it("generate AES", function () {
        skey = session.generateKey(graphene.KeyGenMechanism.AES, {
            keyType: graphene.KeyType.AES,
            valueLen: 256 / 8
        });
    })

    function test_generate(paramsEc) {
        return session.generateKeyPair(graphene.KeyGenMechanism.EC, {
            keyType: graphene.KeyType.EC,
            paramsEC: paramsEc,
            token: false,
            verify: true,
            encrypt: true,
            wrap: true,
            derive: true
        }, {
                keyType: graphene.KeyType.EC,
                token: false,
                sign: true,
                decrypt: true,
                unwrap: true,
                derive: true
            });
    }

    it("generate ECDSA secp192r1 by OID", function () {
        test_generate(graphene.NamedCurve.getByOid("1.2.840.10045.3.1.1").value);
    })

    it("generate ECDSA secp256r1 by name", function () {
        keys = test_generate(graphene.NamedCurve.getByName("secp256r1").value);
    })

    it("generate ECDSA secp192r1 by Buffer", function () {
        test_generate(new Buffer("06082A8648CE3D030101", "hex"));
    })

    function test_sign_verify(_key, alg) {
        var sign = session.createSign(alg, _key.privateKey);
        sign.update(MSG);
        var sig = sign.final();
        var verify = session.createVerify(alg, _key.publicKey);
        verify.update(MSG);
        assert.equal(verify.final(sig), true, "Correct");
        verify = session.createVerify(alg, _key.publicKey);
        verify.update(MSG_WRONG);
        assert.throws(function () {
            verify.final(sig)
        });
    }

    function test_encrypt_decrypt(_key, alg) {
        var cipher = session.createCipher(alg, _key.publicKey);
        var enc = cipher.update(MSG);
        enc = Buffer.concat([enc, cipher.final()]);
        var decipher = session.createDecipher(alg, _key.privateKey);
        var dec = decipher.update(enc);
        assert.equal(Buffer.concat([dec, decipher.final()]).toString(), MSG, "Correct");
    }

    function test_derive(_key, alg, template) {
        var dkey = session.deriveKey(alg, _key.privateKey, template);
        assert.equal(!!dkey, true, "Empty derived key");
    }

    it("sign/verify SHA-1", function () {
        if (isSoftHSM()) return;
        test_sign_verify(keys, "ECDSA_SHA1");
    });

    it("sign/verify SHA-224", function () {
        if (isSoftHSM()) return;
        test_sign_verify(keys, "ECDSA_SHA224");
    });

    it("sign/verify SHA-256", function () {
        if (isSoftHSM()) return;
        test_sign_verify(keys, "ECDSA_SHA256");
    });

    it("sign/verify SHA-384", function () {
        if (isSoftHSM()) return;
        test_sign_verify(keys, "ECDSA_SHA384");
    });

    it("sign/verify SHA-512", function () {
        if (isSoftHSM()) return;
        test_sign_verify(keys, "ECDSA_SHA512");
    });

    it("derive AES", function () {
        test_derive(
            keys,
            {
                name: "ECDH1_DERIVE",
                params: new graphene.EcdhParams(
                    graphene.EcKdf.NULL,
                    null,
                    keys.publicKey.getAttribute({ pointEC: null }).pointEC
                )
            },
            {
                "class": graphene.ObjectClass.SECRET_KEY,
                "token": false,
                "keyType": graphene.KeyType.AES,
                "valueLen": 256 / 8,
                "encrypt": true,
                "decrypt": true
            });
    });

    it("derive AES async", function (done) {
        session.deriveKey(
            {
                name: "ECDH1_DERIVE",
                params: new graphene.EcdhParams(
                    graphene.EcKdf.NULL,
                    null,
                    keys.publicKey.getAttribute({ pointEC: null }).pointEC
                )
            },
            keys.privateKey,
            {
                "class": graphene.ObjectClass.SECRET_KEY,
                "token": false,
                "keyType": graphene.KeyType.AES,
                "valueLen": 256 / 8,
                "encrypt": true,
                "decrypt": true
            },
            function (err, dKey) {
                assert.equal(!!dKey, true, err ? err.message : "Empty dKey");
                done();
            });
    });

})