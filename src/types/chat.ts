export interface Message {
    id: string;
    sender: string;
    receiver: string;
    message: string;
    time: string;
}

export interface Chat {
    number: string;
    message: string;
    time: string;
}

export type Chats = {
    sender_number: string;
    receiver_number: string;
    message_text: string;
    time_stamp: string;
  }