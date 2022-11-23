import { Schema, model } from "mongoose";

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
    user_level: number;
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
        required: true
    },
});

export const UserModel = model<IUser>("user", UserSchema);

export default UserModel;