import User, { UserLevel } from "../models/user";
import express from "express";
import Auth from "../auth";
import * as Session from "../sessions"

const UserRouter = express.Router();


UserRouter.post("/new_employee", Auth.requireApiKey, Auth.setUserLevelAccess([UserLevel.SUPER_ADMIN, UserLevel.ADMIN]), async (req, res) => {
    const username = req.body.username;
    const plainTextPassword = req.body.plainTextPassword;
    const fullname = req.body.fullname;

    User
        .createNewUser(username, plainTextPassword, fullname, UserLevel.USER)
        .then(user => res.status(201).json({
            status: "success",
            content: user.objectified
        }))
        .catch(() => res.status(501).json({
            status: "internal_server_error",
            content: null
        }))
});

UserRouter.post("/new_admin", Auth.requireApiKey, Auth.setUserLevelAccess([UserLevel.SUPER_ADMIN]), async (req, res) => {
    const username = req.body.username;
    const plainTextPassword = req.body.plainTextPassword;
    const fullname = req.body.fullname;

    User
        .createNewUser(username, plainTextPassword, fullname, UserLevel.ADMIN)
        .then(user => res.status(201).json({
            status: "success",
            content: user.objectified
        }))
        .catch(() => res.status(501).json({
            status: "internal_server_error",
            content: null
        }))
});

UserRouter.post("/login", Auth.requireApiKey, async (req, res) => {
    const username = req.body.username;
    const plainTextPassword = req.body.plainTextPassword;

    const userIsExist = await User.getByUsername(username).then(() => true).catch(() => false);
    if (! userIsExist) return res.status(404).json({
        status: "credentials_invalid"
    });

    const login = await Session.login(username, plainTextPassword);
    if(!login) return res.status(401).json({
        status: "credentials_invalid",
        content: null
    });

    res.status(200).json({
        status: "success",
        content: {
            session_id: login
        }
    });
})