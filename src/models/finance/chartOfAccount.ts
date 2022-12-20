import { Schema, model } from "mongoose";


export interface ChartOfAccounts {
    name: string;
    type: string;
    is_debit_balance: boolean;
}

export const chartOfAccountsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [ "asset", "liability", "revenue", "expense" ]
    },
    is_debit_balance: {
        type: Boolean,
        required: true
    },
});

export const ChartOfAccountsModel = model<ChartOfAccounts>("finance.chart_of_account", chartOfAccountsSchema);

export default ChartOfAccountsModel;