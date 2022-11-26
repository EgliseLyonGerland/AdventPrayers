import nodemailer from "nodemailer";

export type Address = {
  name: string;
  address: string;
};

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

const devAddresses = [
  "oltodo@msn.com",
  "nicolas@bazille.fr",
  "nbazille@synthesio.com",
  "nicolas.bazille@ipsos.com",
  "nicolas.bazille@egliselyongerland.org",
];

export function sendEmail(options: {
  subject: string;
  body: string;
  to: Address | Address[];
  grouped?: boolean;
}) {
  const { subject, body, grouped = true } = options;

  let { to } = options;

  if (process.env.NODE_ENV !== "production") {
    to = Array.isArray(to)
      ? devAddresses
          .slice(0, to.length)
          .map((address) => ({ name: "Nicolas Bazille", address }))
      : {
          name: "Nicolas Bazille",
          address: devAddresses[0],
        };
  }

  const config: Parameters<typeof transporter.sendMail>[0] = {
    subject,
    html: body,
    from: {
      name: "En Avent la prière !",
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
