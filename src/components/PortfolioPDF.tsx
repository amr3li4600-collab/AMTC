import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#ffffff" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    borderBottom: "2px solid #0A192F", 
    paddingBottom: 20,
    marginBottom: 30
  },
  logoText: { fontSize: 24, fontWeight: "bold", color: "#0A192F" },
  logoSub: { fontSize: 12, color: "#D4AF37", marginTop: 4 },
  title: { fontSize: 16, color: "#64748B", textAlign: "right" },
  date: { fontSize: 10, color: "#94A3B8", textAlign: "right", marginTop: 4 },
  
  candidateCard: {
    flexDirection: "row",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#F8FAFC"
  },
  photoPlaceholder: {
    width: 80,
    height: 100,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginRight: 15
  },
  photo: {
    width: 80,
    height: 100,
    borderRadius: 4,
    marginRight: 15,
    objectFit: "cover" as const
  },
  infoCol: { flex: 1 },
  name: { fontSize: 14, fontWeight: "bold", color: "#0A192F", marginBottom: 6 },
  metricsRow: { flexDirection: "row" as const, marginBottom: 4 },
  metricLabel: { fontSize: 10, color: "#64748B", width: 70 },
  metricValue: { fontSize: 10, color: "#0F172A", fontWeight: "bold" },
  languages: { fontSize: 10, color: "#0F172A", marginTop: 6, fontStyle: "italic" as const }
});

export interface StudentForPDF {
  fullName: string;
  gender: string;
  height: number;
  weight: number;
  bmi: number;
  armReach: number;
  hasTattoos: boolean;
  photoUrl: string | null;
  languages: { name: string; level: string }[];
}

/** PDF labels – passed from the API route based on the user's language cookie */
export interface PDFLabels {
  academy: string;
  crewEligible: string;
  preparedFor: string;
  gender: string;
  height: string;
  weight: string;
  armReach: string;
  tattoos: string;
  languages: string;
  yes: string;
  no: string;
}

/** Default English labels used when none are provided */
const defaultLabels: PDFLabels = {
  academy: "AMTC Academy",
  crewEligible: "CrewEligible Candidates",
  preparedFor: "Prepared for",
  gender: "Gender:",
  height: "Height:",
  weight: "Weight:",
  armReach: "Arm Reach:",
  tattoos: "Tattoos:",
  languages: "Languages:",
  yes: "Yes",
  no: "No",
};

export function PortfolioPDF({ students, airlineName, labels }: { students: StudentForPDF[]; airlineName: string; labels?: PDFLabels }) {
  const l = labels || defaultLabels;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>{l.academy}</Text>
            <Text style={styles.logoSub}>{l.crewEligible}</Text>
          </View>
          <View>
            <Text style={styles.title}>{l.preparedFor} {airlineName}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Candidates List */}
        {students.map((s, i) => (
          <View key={i} style={styles.candidateCard}>
            {s.photoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={s.photoUrl} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder} />
            )}
            
            <View style={styles.infoCol}>
              <Text style={styles.name}>{s.fullName.toUpperCase()}</Text>
              
              <View style={styles.metricsRow}>
                <Text style={styles.metricLabel}>{l.gender}</Text>
                <Text style={styles.metricValue}>{s.gender}</Text>
              </View>
              <View style={styles.metricsRow}>
                <Text style={styles.metricLabel}>{l.height}</Text>
                <Text style={styles.metricValue}>{s.height} cm</Text>
              </View>
              <View style={styles.metricsRow}>
                <Text style={styles.metricLabel}>{l.weight}</Text>
                <Text style={styles.metricValue}>{s.weight} kg (BMI: {s.bmi})</Text>
              </View>
              <View style={styles.metricsRow}>
                <Text style={styles.metricLabel}>{l.armReach}</Text>
                <Text style={styles.metricValue}>{s.armReach} cm</Text>
              </View>
              <View style={styles.metricsRow}>
                <Text style={styles.metricLabel}>{l.tattoos}</Text>
                <Text style={styles.metricValue}>{s.hasTattoos ? l.yes : l.no}</Text>
              </View>
              
              <Text style={styles.languages}>
                {l.languages} {s.languages.map((lang: { name: string; level: string }) => `${lang.name} (${lang.level})`).join(', ')}
              </Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}
