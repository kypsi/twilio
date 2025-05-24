export interface Contact {
    _id: string | null | undefined;
    id: string;
    name: string;
    phoneNumber: string;
    savedBy: string;
    notes?: string;
    image: string;
}