import express from "express";
import * as Session from "./session";


const API_KEY = "WargaBhumi-POS-HEHEHEHEHE"
export async function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
    if(!req.headers["xxx-api-key"]) return res.status(401).json({
        status: "unauthorized",
        content: null
    });

    if(req.headers["xxx-api-key"] != API_KEY) return res.status(401).json({
        status: "unauthorized",
        content: null
    })

    next();
}

export async function requireSession(req: express.Request, res: express.Response, next: express.NextFunction) {
    const auth = req.headers.authorization;
    if(!auth) return res.status(401).json({
        status: "unauthorized",
        content: null
    });

    const session_id = auth.replace("Bearer ", "");
    const session = Session.Sessions.get(session_id);
    if(!session || !session.valid) return res.status(440).json({   // Redirect Instead
        status: "session_expired",
        content: null
    });

    session.updateExpirationDate();
    req.session = session;
    next();
}

export function setUserLevelAccess(user_levels: Array<number>) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if(!req.session) return res.status(500).json({status: "internal_server_error", content: null });
        if(user_levels.includes(req.session.user_level)) return next();
        return res.status(401).json({
            status: "user_level_unauthorized",
            content: null
        })
    }
}

export default {
    requireApiKey,
    requireSession,
    setUserLevelAccess
}