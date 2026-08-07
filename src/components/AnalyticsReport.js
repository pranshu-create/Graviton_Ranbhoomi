"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 24, textAlign: 'center', marginBottom: 20, color: '#B829EA' },
  subHeader: { fontSize: 14, textAlign: 'center', marginBottom: 30, color: '#666' },
  sectionTitle: { fontSize: 16, borderBottom: '1 solid #ccc', paddingBottom: 5, marginBottom: 15, marginTop: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, fontSize: 10 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottom: '1 solid #eee', paddingBottom: 5, fontSize: 10, fontWeight: 'bold' },
  col1: { width: '40%' },
  col2: { width: '30%', textAlign: 'center' },
  col3: { width: '30%', textAlign: 'right' },
  col4: { width: '25%', textAlign: 'right' },
  kpiContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  kpiBox: { width: '23%', padding: 10, backgroundColor: '#f5f5f5', textAlign: 'center' },
  kpiLabel: { fontSize: 10, color: '#666', marginBottom: 5 },
  kpiValue: { fontSize: 14, fontWeight: 'bold' }
});

const ReportDocument = ({ teams, expenses, sponsorsList, eventsList, totalRevenue, totalSponsorIncome, totalExpenses, netProfit }) => {
  
  // Aggregate data for Event Breakdown
  const eventBreakdown = eventsList.map(event => {
    const verifiedTeams = teams.filter(t => 
      (t.event || "").trim().toUpperCase() === event.name.toUpperCase() && 
      t.status === 'VERIFIED'
    );
    const feeMatch = event.fees ? event.fees.match(/\d+/) : null;
    const feeAmount = feeMatch ? parseInt(feeMatch[0], 10) : 0;
    const eventRev = verifiedTeams.reduce((sum, t) => sum + (t.amountPaid || feeAmount), 0);
    
    return {
      name: event.name,
      registrations: teams.filter(t => (t.event || "").trim().toUpperCase() === event.name.toUpperCase()).length,
      verified: verifiedTeams.length,
      revenue: eventRev
    };
  });

  // Top Institutions
  const instCounts = {};
  teams.filter(t => t.status === 'VERIFIED').forEach(t => {
    const inst = t.institution || "Unknown";
    instCounts[inst] = (instCounts[inst] || 0) + 1;
  });
  const topInstitutions = Object.entries(instCounts).sort((a,b) => b[1] - a[1]).slice(0, 10);

  const verifiedTeams = teams.filter(t => t.status === 'VERIFIED');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>RANBHOOMI 2.0</Text>
        <Text style={styles.subHeader}>EXECUTIVE MISSION REPORT</Text>
        <Text style={{ fontSize: 10, textAlign: 'center', marginBottom: 30, color: '#999' }}>Generated: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>1. FINANCIAL OVERVIEW</Text>
        <View style={styles.kpiContainer}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>TEAM REV</Text>
            <Text style={styles.kpiValue}>Rs.{totalRevenue}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>SPONSORS</Text>
            <Text style={styles.kpiValue}>Rs.{totalSponsorIncome}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>EXPENSES</Text>
            <Text style={styles.kpiValue}>Rs.{totalExpenses}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>NET P&L</Text>
            <Text style={styles.kpiValue}>Rs.{netProfit}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>2. EVENT PERFORMANCE</Text>
        <View style={styles.rowHeader}>
          <Text style={styles.col1}>Event</Text>
          <Text style={styles.col2}>Total Reg</Text>
          <Text style={styles.col3}>Verified</Text>
          <Text style={styles.col4}>Revenue</Text>
        </View>
        {eventBreakdown.map((ev, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.col1}>{ev.name}</Text>
            <Text style={styles.col2}>{ev.registrations}</Text>
            <Text style={styles.col3}>{ev.verified}</Text>
            <Text style={styles.col4}>Rs.{ev.revenue}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>3. TOP INSTITUTIONS</Text>
        {topInstitutions.map(([inst, count], i) => (
          <View key={i} style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, fontSize: 10}}>
            <Text>{i+1}. {inst}</Text>
            <Text>{count} teams</Text>
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
         <Text style={styles.sectionTitle}>4. VERIFIED OPERATIVES LOG</Text>
         <View style={styles.rowHeader}>
          <Text style={styles.col1}>Team Name</Text>
          <Text style={styles.col2}>Event</Text>
          <Text style={styles.col3}>Institution</Text>
        </View>
        {verifiedTeams.map((team, i) => (
           <View key={i} style={styles.row}>
            <Text style={styles.col1}>{team.name}</Text>
            <Text style={styles.col2}>{team.event || "N/A"}</Text>
            <Text style={styles.col3}>{team.institution || "N/A"}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default function AnalyticsReport(props) {
  return (
    <PDFDownloadLink 
      document={<ReportDocument {...props} />} 
      fileName={`Ranbhoomi_Report_${new Date().toISOString().split('T')[0]}.pdf`}
      className="bg-electric-purple/20 text-electric-purple border border-electric-purple px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-electric-purple hover:text-white transition-colors"
    >
      {({ blob, url, loading, error }) =>
        loading ? 'GENERATING PDF...' : '📊 DOWNLOAD MISSION REPORT (PDF)'
      }
    </PDFDownloadLink>
  );
}
