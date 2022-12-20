import { Schema, model } from "mongoose";
import utils from "../utils";

export enum UserLevel {
    SUPER_ADMIN = 0,
    ADMIN = 1,
    USER = 2
}

export interface IUser {
    username: string;
    salt: string;
    password: string;
    full_name: string;

    /* 0 = Super Admin
     * 1 = Admin
     * 2 = User
     */
    user_level: UserLevel;
}

export const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    salt: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    full_name: {
        type: String,
        required: true
    },
    user_level: {
        type: Number,
        required: true,
        enum: Object.values(UserLevel)
    },
});

export const UserModel = model<IUser>("user", UserSchema);

const __user_memo = new Map<string, User>();
const __user_username_memo = new Map<string, string>();
export class User implements IUser {
    public id: string;
    public username: string;
    public salt: string;
    public password: string;
    public full_name: string;
    public user_level: UserLevel;

    private constructor(id: string, username: string, salt: string, password: string, full_name: string, user_level: UserLevel) {
        this.id = id;
        this.username = username;
        this.salt = salt;
        this.password = password;
        this.full_name = full_name;
        this.user_level = user_level;
    }

    public get objectified() {
        return {
            id: this.id,
            username: this.username,
            full_name: this.full_name,
            user_level: this.user_level,
        }
    }

    public static async getById(id: string) {
        const _user = __user_memo.get(id);
        if(_user) return _user;
        
        const user = await UserModel.findById(id);
        if(!user) throw new Error(`Cannot Retrieve User with id: ${id}`);


        const ruser = new User(
            user._id.toString(),
            user.username,
            user.salt,
            user.password,
            user.full_name,
            user.user_level,
        );

        __user_memo.set(ruser.id, ruser);
        __user_username_memo.set(ruser.username, ruser.id);

        return ruser
    }

    public static async getByUsername(username: string) {
        const _user_id = __user_username_memo.get(username);
        if(_user_id) {
            const _user = __user_memo.get(_user_id);
            if(_user) return _user;
        }

        const user = await UserModel.findOne({ username: username });
        if(!user) throw new Error(`Cannot Retrieve User with username: ${username}`);

        return new User(
            user._id.toString(),
            user.username,
            user.salt,
            user.password,
            user.full_name,
            user.user_level,
        )
    }

    public static async usernameIsExist(username: string) {
        return await User.getByUsername(username).then(() => true).catch(() => false);
    }

    public static async createNewUser(username: string, plainTextPassword: string, full_name: string, user_level: UserLevel) {
        if(await User.usernameIsExist(username)) throw new Error(`Username of ${username} already exist`);

        const salt = utils.generateNewSalt();
        const password = utils.hashPassword(plainTextPassword, salt);
        const user = new UserModel({
            username,
            salt,
            password,
            full_name,
            user_level
        });

        await user.save();

        return new User(
            user._id.toString(),
            user.username,
            user.salt,
            user.password,
            user.full_name,
            user.user_level,
        );
    }

    public static async verifyIdentity(username: string, plainTextPassword: string) {
        if(!User.usernameIsExist(username)) throw new Error("Credentials Invalid");

        const user = await User.getByUsername(username);
        if(!utils.comparePassword(user.password, user.salt, plainTextPassword)) throw new Error("Credentials Invalid");

        return user
    }
}

export default User;