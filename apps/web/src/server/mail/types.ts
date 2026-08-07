export type OutgoingEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type MailSender = {
  send: (email: OutgoingEmail) => Promise<void>;
};
