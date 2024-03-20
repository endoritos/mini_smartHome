import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Smarts from './screens/Smarts';

export default function App() {
  return (
    <View style={styles.container}>
      <Smarts/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
