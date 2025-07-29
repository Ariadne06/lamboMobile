import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

type Column = {
  title: string;
  dataIndex: string;
  flex?: number; // Optional: allows custom flex for each column
  render?: (value: any, row: any) => React.ReactNode; // Optional: custom cell rendering
};

type CustomTableProps = {
  columns: Column[];
  data: { [key: string]: any }[];
};

export default function CustomTable({ columns, data }: CustomTableProps) {
  return (
    <ScrollView style={styles.container} horizontal={false}>
      <View style={styles.tableHeader}>
        {columns.map((col, idx) => (
          <ThemedText
            key={col.dataIndex || idx}
            type="defaultSemiBold"
            style={[
              styles.tableHeaderText,
              styles.cell,
              { flex: col.flex ?? 1 },
            ]}
          >
            {col.title}
          </ThemedText>
        ))}
      </View>
      {data.map((row, rowIdx) => (
        <View key={row.key || rowIdx} style={styles.tableRow}>
          {columns.map((col, colIdx) => (
            <ThemedText
              key={col.dataIndex || colIdx}
              style={[
                styles.tableCell,
                styles.cell,
                { flex: col.flex ?? 1 },
              ]}
            >
              {col.render
                ? col.render(row[col.dataIndex], row)
                : row[col.dataIndex]}
            </ThemedText>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFA333',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 6,
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
  },
  tableHeaderText: {
    color: '#374151',
    fontSize: 16,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  tableCell: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});