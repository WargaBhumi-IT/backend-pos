import { Schema, model } from "mongoose";
import Journal from "./journal";
import crypto from "crypto";
import * as DEBUG from "../../debug";

export interface ILedger {
    index: number
    start_date: Date
    closing_date: Date
    journals: Array<string>
    nonce: number
    previous_ledger_signature: string
}

export const LedgerSchema = new Schema({
    index: {
        type: Number,
        required: true,
        unique: true
    },
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
    },
    nonce: {
        type: Number,
        required: true
    },
    previous_ledger_signature: {
        type: String,
        required: true
    }
});

const LedgerModel = model<ILedger>("finance.ledger", LedgerSchema);

class Ledger {
    private _id: string;
    private _index: number;
    private _start_date: Date;
    private _closing_date: Date;
    private _journals: Array<Journal>;
    private _nonce: number;
    private _previous_ledger_signature: string;

    private constructor(id: string, index: number, start_date: Date, closing_date: Date, journals: Array<Journal>, nonce: number, previous_ledger_signature: string) {
        this._id = id;
        this._index = index
        this._start_date = start_date;
        this._closing_date = closing_date;
        this._journals = journals
        this._nonce = nonce;
        this._previous_ledger_signature = previous_ledger_signature;
    }

    public static async getLastIndex() {
        const ledgers = await LedgerModel.find();
        let last_ledger = ledgers[0];

        for(const ledger of ledgers) {
            if(ledger.index >= last_ledger.index) {
                last_ledger = ledger;
            }
        }

        const journals = new Array<Journal>();
        for(const id of last_ledger.journals) {
            const journal = await Journal.getById(id);
            journals.push(journal);
        }

        return new Ledger(
            last_ledger.id,
            last_ledger.index,
            last_ledger.start_date,
            last_ledger.closing_date,
            journals,
            last_ledger.nonce,
            last_ledger.previous_ledger_signature,
        )
    }

    public static async newLedger(start_date: Date, closing_date: Date, journal_ids: Array<string>, nonce: number) {
        const journals = new Array<Journal>();
        for(const id of journal_ids) {
            const journal = await Journal.getById(id);
            journals.push(journal);
        }

        const previous_ledger = await Ledger.getLastIndex()
        
        return new Ledger(
            crypto.createHash("sha512").update(crypto.randomBytes(512)).digest("hex"),
            previous_ledger.index + 1,
            start_date,
            closing_date,
            journals,
            nonce,
            previous_ledger.signature,
        )
    }

    public static async getByIndex(target_index: number): Promise<Ledger> {
        const ledger = await LedgerModel.findOne({ index: target_index });
        if(!ledger) throw new Error(`ledger index of ${target_index} not found`);

        const journals = new Array<Journal>();
        for(const id of ledger.journals) {
            const journal = await Journal.getById(id);
            journals.push(journal);
        }

        return new Ledger(
            ledger._id.toString(),
            ledger.index,
            ledger.start_date,
            ledger.closing_date,
            journals,
            ledger.nonce,
            ledger.previous_ledger_signature
        )
    }

    public static async getById(target_id: string) {
        const ledger = await LedgerModel.findById(target_id);
        if(!ledger) throw new Error(`ledger id of ${target_id} not found`);

        const journals = new Array<Journal>();
        for(const id of ledger.journals) {
            const journal = await Journal.getById(id);
            journals.push(journal);
        }

        return new Ledger(
            ledger._id.toString(),
            ledger.index,
            ledger.start_date,
            ledger.closing_date,
            journals,
            ledger.nonce,
            ledger.previous_ledger_signature
        )
    }

    public get id() { return this._id; }
    public get index() { return this._index; }
    public get start_date() { return this._start_date; }
    public get closing_date() { return this._closing_date; }
    public get journals() { return this._journals; }
    public get nonce() { return this._nonce; }
    public get previous_ledger_signature() { return this._previous_ledger_signature; }

    public get objectified() {
        const parsed_journals = this._journals.map(journal => journal.objectified)
        return {
            id: this._id,
            index: this._index,
            start_date: this._start_date,
            closing_date: this._closing_date,
            journals: parsed_journals,
            nonce: this._nonce,
            previous_ledger_signature: this._previous_ledger_signature,
        }
    }

    public trySignature(target_nonce: number) {
        const parsed_journals = this._journals.map(journal => journal.objectified)
        return crypto.createHash("sha512").update(JSON.stringify({
            id: this._id,
            index: this._index,
            start_date: this._start_date,
            closing_date: this._closing_date,
            journals: parsed_journals,
            nonce: target_nonce,
            previous_ledger_signature: this._previous_ledger_signature,
        })).digest("hex");
    }

    public trySign(target_nonce: number) {
        return this.trySignature(target_nonce).slice(-4) == "0000";
    }

    public async sign(target_nonce: number) {
        if(!this.trySign(target_nonce)) throw new Error(`failed to sign ledger id ${this._id}`);

        this._nonce = target_nonce;
        DEBUG.log(`Ledger Id ${this.id} mined with nonce ${target_nonce} and signature: ${this.signature}`);

        (new LedgerModel({
            _id: this._id,
            index: this._index,
            start_date: this._start_date,
            closing_date: this._closing_date,
            journals: this._journals,
            nonce: this._nonce,
            previous_ledger_signature: this._previous_ledger_signature,
        }).save()).then(ledger => DEBUG.log(`Ledger Id ${ledger._id.toString()} Saved to Database`)).catch(() => DEBUG.error(`Failed to save Ledger Id ${this.id} to database`));
    }

    public get signature() {
        return this.trySignature(this._nonce);
    }

    public get isValid() {
        return this.signature.slice(-4) == "0000"
    }
}

async function mineLedger(ledger: Ledger) {
    const id = crypto.createHash("md5").update(crypto.randomBytes(128));

    let nonce = 0;
    DEBUG.log(`Mining ledger id ${ledger.id} with miner id ${id}`);
    while(true) {
        const status = ledger.trySign(nonce);
        if(status) {
            ledger.sign(nonce);
            return;
        }

        nonce += 1;
    }
}