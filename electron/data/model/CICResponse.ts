import PersonalData from "./PersonalData";

export default class CICResponse {
    success?: {
        personalData: PersonalData,
        validationData: {
            id: string, // "4ccb6a15-70d5-4bda-ab33-b436f3b2a57f",
            cardIntegrityResult: boolean, // true,
            cardIntegrityMessage: string, // null,
            cardLegitimacyResult: boolean, // true,
            cardLegitimacyMessage: string, // "Xác minh thành công",
            faceCompareResult: string, // null,
            faceCompareMessage: string, // null,
            faceCompareAccuracy: string, // null,
            faceLivenessResult: string, // null,
            faceLivenessMessage: string, // null,
            createdDate: string, // "16:36 28/03/2024"
          },
    };
    error?: {
        status: number,
        message: string
    };
    timestamp: Date = new Date();
}
