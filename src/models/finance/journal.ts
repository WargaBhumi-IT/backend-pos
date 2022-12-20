import { Schema, model } from "mongoose";


export interface IJournal {
    date: Date,
    description: string
}

export const JournalSchema = new Schema({
    date: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    description: {
        type: String,
        required: true,
        default: ""
    }
});

class Journal implements IJournal {
    public id: string;
    public date: Date;
    public description: string;

    private constructor(id: string, date: Date, description: string) {
        this.id = id;
        this.date = date;
        this.description = description;
    }
}


export const JournalModel = model<IJournal>("finance.journal", JournalSchema);

export default Journal;