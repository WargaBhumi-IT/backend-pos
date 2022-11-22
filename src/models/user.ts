import { Schema, model } from "mongoose";


export interface IUser {
    username: string;
    salt: string;
    password: string;
    full_name: string;
    is_admin: boolean;
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
    is_admin: {
        type: Boolean,
        required: true
    }
});

export const UserModel = model<IUser>("user", UserSchema);

export default UserModel;