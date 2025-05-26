export interface Contact {
    userId: string;
    _id: string | null | undefined;
    id: string;
    name: string;
    phoneNumber: string;
    savedBy: string;
    notes?: string;
    image: string;
}