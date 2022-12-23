import { Schema, model } from "mongoose";

export interface IEmployee {
    fullname: string;
    contacts: string;            // id of contact
    employment_date: Date;
    user_id: string;
}