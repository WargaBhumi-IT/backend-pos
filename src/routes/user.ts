import User from "../models/user";
import express from "express";
import Utils from "../utils";

const UserRouter = express.Router();

async function createNewUser(username: string, plainTextPassword: string, full_name: string, is_admin: boolean) {
    const salt = Utils.generateNewSalt();
    const password = Utils.hashPassword(plainTextPassword, salt);
    const user = new User({
        username,
        salt,
        password,
        full_name,
        is_admin
    });

    return user;
}

UserRouter.post("/new_employee", async (req, res) => {
    const username = req.body.username;
    const plainTextPassword = req.body.plainTextPassword;
    const fullname = req.body.fullname;

    const user = (await createNewUser(username, plainTextPassword, fullname, false)).save();
    res.status(201).json({
        status: "success",
        content: user
    });
});

UserRouter.post("/new_admin", async (req, res) => {
    const username = req.body.username;
    const plainTextPassword = req.body.plainTextPassword;
    const fullname = req.body.fullname;

    const user = (await createNewUser(username, plainTextPassword, fullname, true)).save();
    res.status(201).json({
        status: "success",
        content: user
    });
});

UserRouter.get("/", async (req, res) => {
    
})