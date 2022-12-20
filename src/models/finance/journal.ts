import { Schema, model } from "mongoose";


export interface IJournal {
    date: Date,
    description: string,
    is_settled: boolean
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
    },
    is_settled: {
        type: Boolean,
        required: true,
        default: false
    }
});

class Journal implements IJournal {
    public id: string;
    public date: Date;
    public description: string;
    public is_settled: boolean;

    private constructor(id: string,date: Date,description: string,is_settled: boolean) {
        this.id = id;
        this.date = date;
        this.description = description;
        this.is_settled = is_settled;
    }


}


export const JournalModel = model<IJournal>("finance.journal", JournalSchema);

export default Journal;