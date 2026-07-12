import "server-only";
import QRCode from "qrcode";

// 1024px at errorCorrectionLevel M: sharp enough to print and tape to a
// table without pixelating, while M (not the max H) keeps the modules
// larger/more scan-reliable for a plain (non-logo) code — see the Stage 11
// report for why a logo overlay was skipped.
const QR_SIZE_PX = 1024;

export async function generateQrPng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    width: QR_SIZE_PX,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
