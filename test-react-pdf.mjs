import React from 'react';
import { renderToStream, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import fs from 'fs';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
});

const Receipt = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>GRAVITON ROBOTICS</Text>
      <Text>Receipt No: 12345</Text>
    </Page>
  </Document>
);

async function test() {
  try {
    const stream = await renderToStream(<Receipt />);
    const fileStream = fs.createWriteStream('test-react-pdf.pdf');
    stream.pipe(fileStream);
    console.log("React PDF generated successfully!");
  } catch (err) {
    console.error("React PDF Error:", err);
  }
}

test();
