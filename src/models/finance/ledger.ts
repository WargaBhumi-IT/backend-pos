import { Schema, model } from "mongoose";


export interface ILedger {
    closed_date: Date,
    journals: Array<string> // Array of Journal Id
}

export const LedgerSchema = new Schema({
    start_date: {
        type: Date,
        required: true
    },
    closing_date: {
        type: Date,
        required: true
    },
    journals: {
        type: [String],
        required: true,
        default: []
    }
});

