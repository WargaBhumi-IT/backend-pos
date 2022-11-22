import express from "express";
import * as Session from "./sessions";


export async function requireUserSession(req: express.Request, res: express.Response, next: express.NextFunction) {
    const session_id = req.headers.authorization;
    if(!session_id) return res.status(401).json({
        status: "unauthorized",
        content: null
    });

    const session = Session.Sessions.get(session_id);
    if(!session) return res.status(440).json({   // Redirect Instead
        status: "session_expired",
        content: null
    });

    req.session = session;
    next();
}

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