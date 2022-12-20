import { Schema, model } from "mongoose";


export interface IFinanceSettings {
    salesTaxPercentage: number,

    // --------------------- Metadata
    effective_date: Date,
    set_date: Date
}

export const FinanceSettingsSchema = new Schema ({
    salesTaxPercentage: {
        type: Number,
        required: true
    },

    // --------------------- Metadata
    effective_date: {
        type: Date,
        required: true
    },
    set_date: {
        type: Date,
        required: true,
        default: () => new Date()
    }
});

export const FinanceSettingsModel = model<IFinanceSettings>("finance.settings", FinanceSettingsSchema); 

export class Setting {
    salesTaxPercentage: number

    private constructor(salesTaxPercentage: number) {
        this.salesTaxPercentage = salesTaxPercentage;
    }

    public static async getEffectiveSetting() {
        const settings = await FinanceSettingsModel.find();
        let latestSetting = settings[0];
        for(const setting of settings) if(setting.effective_date >= latestSetting.effective_date) {
            latestSetting = setting;
        }

        return new Setting(
            latestSetting.salesTaxPercentage
        );
    }

    public async updateSetting(
        effective_date: Date = new Date(),
        salesTaxPercentage?: number
    ) {
        // Fetch Latest Setting, to became a default value
        let latestSetting = await Setting.getEffectiveSetting()

        const updateDocument: IFinanceSettings = {
            salesTaxPercentage: salesTaxPercentage ?? latestSetting.salesTaxPercentage,

            effective_date,
            set_date: new Date()
        }

        return await new FinanceSettingsModel(updateDocument)
            .save()
            .then(async () => await Setting.getEffectiveSetting())
    }
}