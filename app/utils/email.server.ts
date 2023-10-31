import nodemailer from "nodemailer";

import { AppName } from "~/config";

export interface Address {
  name: string;
  address: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  pool: true,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const devAddresses: Address[] = [
  "oltodo@msn.com",
  "nicolas@bazille.fr",
  "nbazille@synthesio.com",
  "nicolas.bazille@ipsos.com",
  "nicolas.bazille@egliselyongerland.org",
].map((address) => ({ name: "Nicolas Bazille", address }));

export function sendEmail(options: {
  subject: string;
  body: string;
  to: Address | Address[];
  test?: boolean;
  grouped?: boolean;
}) {
  const { subject, body, test = false, grouped = true } = options;

  let { to } = options;

  if (Array.isArray(to)) {
    to.forEach((item) => console.log("Send email to", item));
  } else {
    console.log("Send email to", to);
  }

  if (test) {
    to = devAddresses[0];
  } else if (process.env.NODE_ENV !== "production") {
    to = Array.isArray(to) ? devAddresses.slice(0, to.length) : devAddresses[0];
  }

  const config: Parameters<typeof transporter.sendMail>[0] = {
    subject: test ? `[TEST] ${subject}` : subject,
    html: body,
    from: {
      name: AppName,
      address: `nicolas.bazille+ealp@egliselyongerland.org`,
    },
  };

  if (grouped) {
    config.bcc = to;
  } else {
    config.to = to;
  }

  return transporter.sendMail(config);
}
