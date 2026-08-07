import PDFDocument from 'pdfkit';
import fs from 'fs';

try {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream('test-receipt.pdf');
  doc.pipe(stream);

  doc.fontSize(20).text('GRAVITON ROBOTICS', { align: 'center' });
  doc.end();

  stream.on('finish', () => {
    console.log('PDF generated successfully!');
  });
  stream.on('error', (err) => {
    console.error('Stream error:', err);
  });
} catch (err) {
  console.error('PDFKit error:', err);
}
