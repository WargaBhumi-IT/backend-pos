import UserModel, { User } from "./models/user";
import utils from "./utils";
import crypto from "crypto";

export interface ISession {
    session_id: string;
    user_id: string;
    user_level: number;
    logged_in_at: Date;
    expiration_date: Date;
    data: Map<string, unknown>;
}

export class Session {
    public session_id: string;
    public user_id: string;
    public user_level: number;
    public logged_in_at: Date;
    public expiration_date: Date;
    public data: Map<string, unknown>;

    constructor(session_id: string, user_id: string, user_level: number, logged_in_at: Date, expiration_date: Date) {
        this.session_id = session_id;
        this.user_id = user_id;
        this.user_level = user_level;
        this.logged_in_at = logged_in_at;
        this.expiration_date = expiration_date;
        this.data = new Map<string, unknown>();
    }

    static async generateNewSession(username: string, plainTextPassword: string) {
        const user = await User.verifyIdentity(username, plainTextPassword);

        const session_id = crypto.createHash("sha512").update(utils.generateNewSalt()).digest("hex");
        const logged_in_at = new Date();
        const expiration_date = new Date();
        expiration_date.setHours(expiration_date.getHours() + 1);

        return new Session(session_id, user.id, user.user_level, logged_in_at, expiration_date);
    }
}

export const Sessions = new Map<string, Session>();
export async function login(username: string, plainTextPassword: string) {
    const session = await Session.generateNewSession(username, plainTextPassword);
    if(!session) return null;

    Sessions.set(session.session_id, session);

    return session.session_id;
}