import PersonalData from "./PersonalData";

export default class CICResponse {
    timestamp: Date = new Date();
    success?: { personalData: PersonalData, validation: any };
    error?: { status: number, message: string };
}
