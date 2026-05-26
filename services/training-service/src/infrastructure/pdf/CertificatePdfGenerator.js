import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export class CertificatePdfGenerator {
  async generate({ userName, email, trainingTitle, result }) {
    const certificatesDir = path.resolve("certificates");

    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir);
    }

    const fileName = `certificate-${result.id}.pdf`;
    const filePath = path.join(certificatesDir, fileName);

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0
    });

    doc.pipe(fs.createWriteStream(filePath));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    const primary = "#32373D";
    const secondary = "#6F86A3";
    const accent = "#D7C900";
    const light = "#BACEE5";

    doc.rect(0, 0, pageWidth, pageHeight).fill("#F3F7FC");

    doc
      .lineWidth(8)
      .strokeColor(accent)
      .roundedRect(28, 28, pageWidth - 56, pageHeight - 56, 18)
      .stroke();

    doc
      .lineWidth(2)
      .strokeColor(secondary)
      .roundedRect(46, 46, pageWidth - 92, pageHeight - 92, 14)
      .stroke();

    doc
      .circle(95, 95, 32)
      .fill(accent);

    doc
      .fillColor("#FFFFFF")
      .fontSize(30)
      .text("", 76, 76, {
        width: 40,
        align: "center"
      });

    doc
      .fillColor(primary)
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("SICIT", 132, 78);

    doc
      .fillColor(secondary)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Sistema Corporativo de Treinamentos", 132, 102);

    doc
      .fillColor(primary)
      .fontSize(42)
      .font("Helvetica-Bold")
      .text("CERTIFICADO", 0, 135, {
        align: "center"
      });

    doc
      .moveTo(pageWidth / 2 - 120, 190)
      .lineTo(pageWidth / 2 + 120, 190)
      .lineWidth(3)
      .strokeColor(accent)
      .stroke();

    doc
      .fillColor(secondary)
      .fontSize(16)
      .font("Helvetica")
      .text("Certificamos que", 0, 220, {
        align: "center"
      });

    doc
      .fillColor(primary)
      .fontSize(32)
      .font("Helvetica-Bold")
      .text(userName || email || "Usuário", 90, 255, {
        width: pageWidth - 180,
        align: "center"
      });

    doc
      .fillColor(secondary)
      .fontSize(16)
      .font("Helvetica")
      .text("concluiu com êxito a trilha de treinamento", 0, 315, {
        align: "center"
      });

    doc
      .fillColor(primary)
      .fontSize(26)
      .font("Helvetica-Bold")
      .text(trainingTitle, 90, 350, {
        width: pageWidth - 180,
        align: "center"
      });

    doc
      .roundedRect(pageWidth / 2 - 190, 410, 380, 54, 12)
      .fill(light);

    doc
      .fillColor(primary)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(
        `Aproveitamento: ${result.attendancePercent || result.completionPercent || 0}%   •   Status: ${result.status || "Aprovado"}`,
        pageWidth / 2 - 190,
        428,
        {
          width: 380,
          align: "center"
        }
      );

    doc
      .fillColor(secondary)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, 80, 505);

    doc
      .moveTo(pageWidth - 270, 510)
      .lineTo(pageWidth - 90, 510)
      .lineWidth(1.5)
      .strokeColor(primary)
      .stroke();

    doc
      .fillColor(primary)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Coordenação de Treinamentos", pageWidth - 270, 520, {
        width: 180,
        align: "center"
      });

    doc.end();

    return {
      fileName,
      filePath
    };
  }
}