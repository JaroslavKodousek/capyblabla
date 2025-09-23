
export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  feedback?: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum ConversationPartner {
  Teacher = 'Strict Teacher',
  Friend = 'Funny Friend',
  Colleague = 'Fine Colleague',
}
