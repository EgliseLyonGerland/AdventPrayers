import crypto from "crypto";
import fs from "fs";

import PDFDocument from "pdfkit";

import type { getDraw } from "~/models/draw.server.js";

type Draw = Awaited<ReturnType<typeof getDraw>>;
type Doc = typeof PDFDocument;

const width = 2480;
const height = 3508;
const paddings = [12, 76];
const topMargin = 350;
const contentWidth = width - paddings[0] * 2;
const contentHeight = height - paddings[1] * 2;

const publicPath = `${__dirname}/../public`;

function addPage(doc: Doc, type: "recto" | "verso" = "recto") {
  doc
    .addPage()
    .save()
    .rect(0, 0, width, height)
    .fill("#fff")
    .restore()
    .image(`${publicPath}/assets/images/${type}.png`, 0, 0, {
      fit: [width, height],
      align: "center",
      valign: "center",
    });
}

function addVersoPage(doc: Doc, year: number) {
  addPage(doc, "verso");

  for (let index = 0; index < 8; index += 1) {
    const rowIndex = Math.floor((index % 8) / 2);
    const columnIndex = Math.floor(index % 2);

    const x = (contentWidth / 2) * columnIndex + paddings[0];
    const y = (contentHeight / 4) * rowIndex + 210 + paddings[1];

    doc
      .save()
      .font(`${publicPath}/assets/fonts/Iowan.ttf`)
      .fontSize(32)
      .fill("#000000")
      .opacity(0.5)
      .text(`~ Édition ${year} ~`, x, y, {
        width: contentWidth / 2,
        align: "center",
      })
      .restore();
  }
}

export async function getFileVersion(year: number) {
  const path = `${publicPath}/exports/draw${year}.pdf`;

  if (!fs.existsSync(path)) {
    return null;
  }

  const stat = fs.statSync(path);

  return crypto.createHash("md5").update(JSON.stringify(stat)).digest("hex");
}

export async function generate(draw: NonNullable<Draw>) {
  const outputPath = `${publicPath}/exports/draw${draw.year}.pdf`;

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  const doc = new PDFDocument({
    size: [width, height],
    autoFirstPage: false,
  });

  doc.pipe(fs.createWriteStream(outputPath));

  draw.players.forEach((player, index) => {
    if (index % 8 === 0) {
      addPage(doc, "recto");
    }

    const rowIndex = Math.floor((index % 8) / 2);
    const columnIndex = Math.floor(index % 2);

    const x = (contentWidth / 2) * columnIndex + paddings[0];
    const y = (contentHeight / 4) * rowIndex + topMargin + paddings[1];

    const { firstName, lastName } = player.person;

    doc
      .save()
      .font(`${publicPath}/assets/fonts/Zapfino.ttf`)
      .fontSize(56)
      .fill("#32251C")
      .text(`${firstName} ${lastName}`, x, y, {
        width: contentWidth / 2,
        align: "center",
      })
      .restore();

    if ((index + 1) % 8 === 0) {
      addVersoPage(doc, draw.year);
    }
  });

  doc.end();

  return new Promise((resolve) => setTimeout(resolve, 2000));
}
