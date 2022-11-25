import nodemailer from "nodemailer";

export type Address = {
  name: string;
  address: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export function sendEmail({
  subject,
  body,
  recipients,
}: {
  subject: string;
  body: string;
  recipients: Address[];
}) {
  return transporter.sendMail({
    from: {
      name: "En Avent la prière !",
      address: `${process.env.GMAIL_USERNAME}`,
    },
    to:
      process.env.NODE_ENV === "production"
        ? recipients
        : { name: "Nicolas Bazille", address: "oltodo@msn.com" },
    subject,
    html: body,
  });
}
