import { Schema, model } from "mongoose";


export interface IJournalEntry {
    date: Date,
    description: string,
    account: string,
    debit: number,
    credit: number,
}

export const JournalEntrySchema = new Schema({
    date: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    description: {
        type: String,
        requried: true,
        default: ""
    },
    account: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "accounting.chart_of_account"
    },
    debit: {
        type: Number,
        required: true,
        default: 0
    },
    credit: {
        type: Number,
        required: true,
        default: 0
    }
});


export const JournalEntryModel = model<IJournalEntry>("finance.journal.entry", JournalEntrySchema);