import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useLocalSearchParams } from 'expo-router';

// Import 2 màn hình con
import MapScreen from './(tabs)/map';
import PatientInfoScreen from './patient-info';

const PRIMARY = '#D4494F';
const { width } = Dimensions.get('window');

export default function IncidentTabsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = React.useRef<PagerView>(null);
  const params = useLocalSearchParams();

  const goToTab = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.tabActive]}
          onPress={() => goToTab(0)}
        >
          <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>
            🗺️ Bản đồ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 1 && styles.tabActive]}
          onPress={() => goToTab(1)}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>
            📋 Hồ sơ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable content */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >
        {/* Tab 0: Map */}
        <View key="map" style={styles.page}>
          <MapScreen />
        </View>

        {/* Tab 1: Patient Info */}
        <View key="patient" style={styles.page}>
          <PatientInfoScreen />
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 4,
    gap: 8,
  },
  tab: {
    flex: 1, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  tabActive: { backgroundColor: PRIMARY },
  tabText: { fontSize: 14, fontWeight: '600', color: '#757575' },
  tabTextActive: { color: '#fff' },
  pager: { flex: 1 },
  page: { flex: 1 },
});