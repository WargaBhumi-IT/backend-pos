import { Schema, model } from "mongoose";


export interface IJournalEntry {
    id: string,
    description: string,
    account: string,
    debit: number,
    credit: number,
}

export interface IJournal {
    date: Date,
    description: string;
    entries: Array<IJournalEntry>;
    last_edited: Date;
}

export const JournalSchema = new Schema<IJournal>({
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
    entries: {
        type: [{
            id: {
                type: Schema.Types.ObjectId,
                required: true,
                auto: true
            },
            description: {
                type: String,
                required: true
            },
            account: {
                type: String,
                required: true
            },
            debit: {
                type: Number,
                required: true
            },
            credit: {
                type: Number,
                required: true
            },
        }],
        required: true,
        default: []
    },
    last_edited: {
        type: Date,
        required: true,
        default: () => new Date()
    }
});


export const JournalModel = model<IJournal>("finance.journal", JournalSchema);

const __journal_memo = new Map<string, Journal>();
class Journal implements IJournal {
    private __is_deleted: boolean = false;

    private _id: string;
    private _date: Date;
    private _description: string;
    private _entries: Array<IJournalEntry>;
    private _last_edited: Date;

    private constructor(id: string, date: Date, description: string, entries: Array<IJournalEntry>, last_edited: Date) {
        this._id = id;
        this._date = date;
        this._description = description;
        this._entries = entries;
        this._last_edited = last_edited;


        __journal_memo.set(id, this);
    }

    public static async getById(id: string) {
        const _j = __journal_memo.get(id); 
        if (_j) return _j;

        const j = await JournalModel.findById(id);
        if (!j) throw new Error(`Journal By id ${id} not found`);

        return new Journal(
            j._id.toString(),
            j.date,
            j.description,
            j.entries,
            j.last_edited
        )
    }

    public get id()             { if(this.__is_deleted) throw new Error(`Journal with id ${this.id} already deleted`); return this._id; }
    public get date()           { if(this.__is_deleted) throw new Error(`Journal with id ${this.id} already deleted`); return this._date; }
    public get description()    { if(this.__is_deleted) throw new Error(`Journal with id ${this.id} already deleted`); return this._description; }
    public get entries()        { if(this.__is_deleted) throw new Error(`Journal with id ${this.id} already deleted`); return this._entries; }
    public get last_edited()    { if(this.__is_deleted) throw new Error(`Journal with id ${this.id} already deleted`); return this._last_edited; }
    
    public get objectified() {
        const entries = new Array<IJournalEntry>();
        for(const entry of entries) {
            entries.push({
                id: entry.id,
                description: entry.description,
                account: entry.account,
                debit: entry.debit,
                credit: entry.credit
            })
        }
        return {
            id: this._id,
            date: this._date,
            description: this._description,
            last_edited: this._last_edited,
            entries
        }
    }

    public async update(date?: Date, description?: string) {
        if(this.__is_deleted) throw new Error(`Journal with id ${this.id} already deleted`);

        let u_date = date ?? this.date;
        let u_description = description ?? this.description;
        
        const j = await JournalModel.findByIdAndUpdate(this.id, { last_updated: new Date(), date: u_date, description: u_description }, { new: true });
        if(!j) throw new Error(`Failed to add Entry Journal with id ${this.id}`);

        this._id = j._id.toString();
        this._date = j.date;
        this._description = j.description;
        this._entries = j.entries;
        this._last_edited = j.last_edited

        __journal_memo.set(this.id, this);
        return this;
    }

    public async addEntry(description: string, account: string, debit: number, credit: number) {
        if(this.__is_deleted) throw new Error(`Journal with id ${this.id} already deleted`);

        const entry = {
            description,
            account,
            debit,
            credit
        }
        const j = await JournalModel.findByIdAndUpdate(this.id, { last_updated: new Date(), $push: { entries: entry } }, { new: true });
        if(!j) throw new Error(`Failed to add Entry Journal with id ${this.id}`);

        this._id = j._id.toString();
        this._date = j.date;
        this._description = j.description;
        this._entries = j.entries;
        this._last_edited = j.last_edited

        __journal_memo.set(this.id, this);
        return this;
    }
    
    public async deleteEntry(entry_id: string) {
        if(this.__is_deleted) throw new Error(`Journal with id ${this.id} already deleted`);

        const j = await JournalModel.findByIdAndUpdate(this.id, { last_updated: new Date(), $pull: { entries: { id: entry_id } }}, { new: true });
        if(!j) throw new Error(`Failed to add Entry Journal with id ${this.id}`);

        this._id = j._id.toString();
        this._date = j.date;
        this._description = j.description;
        this._entries = j.entries;
        this._last_edited = j.last_edited;

        __journal_memo.set(this.id, this);
        return this;
    }
}

export default Journal;