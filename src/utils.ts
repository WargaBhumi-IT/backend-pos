import crypto from "crypto";

function generateNewSalt() {
    const buf = new Array<string>();
    for(let j=0; j<32; j++) {
        const randoms = new Array<string>(); 
        for(let i=0; i<8192; i++) {
            randoms.push(crypto.randomBytes(8192).toString("hex"));
        }
        const random_data = randoms.join();

        buf.push(crypto.createHash("sha512").update(random_data).digest("hex"))
    }

    return buf.join("")
}

function hashPassword(password: string, salt: string) {
    return crypto.pbkdf2Sync(password, salt, 500000, 128, "sha512").toString("hex")
}

function comparePassword(savedPassword: string, savedSalt: string, plainTextPassword: string) {
    const hashedPlainPassword = hashPassword(plainTextPassword, savedSalt);
    return hashedPlainPassword == savedPassword;
}

export default {
    generateNewSalt,
    hashPassword,
    comparePassword
}