export {}

declare global {
    namespace Express {
        export interface Request {
            session?: {
                session_id: string;
                user_id: string;
                user_level: number;
                logged_in_at: Date;
                expiration_date: Date;
                data: Map<string, unknown>;
            };
        }
    }
}