import { StyleSheet, Text, View, ImageBackground, Button, Switch, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { db, ref, onValue, set } from "../firebase";

import background from "../assets/bbl.png";
import windowOpen from "../assets/windowOpen.webp";
import windowClosed from "../assets/windowClosed.webp";

const Smarts = () => {
  const [temp, settemp] = useState('0');
  const [humidity, sethumidity] = useState('0');
  const [pressure, setpressure] = useState('0');
  const [windows, setwindows] = useState(false);
  const [current, setcurrent] = useState('0');
  const [usageHoursPerDay, setUsageHoursPerDay] = useState(5); // Usage hours per day

  const [isEnabled, setIsEnabled] = useState(false); 

  const toggleSwitch = () => {
    setIsEnabled(previousState => {
      const newState = !previousState;
      // Update value from client side to database 
      const switchRef = ref(db, 'light');
      set(switchRef, newState).then(() => {
        console.log("Light switch state updated in database successfully.");
      }).catch((error) => {
        console.error("Error updating light switch state in database: ", error);
      });

      return newState;
    });
  };

  // Import data from database and update state
  useEffect(() => {
    const data = ref(db);

    onValue(data, (snapshot) => {
      settemp(snapshot.val().temp);
      sethumidity(snapshot.val().humidity);
      setpressure(snapshot.val().pressure);
      setIsEnabled(snapshot.val().light);
      setwindows(snapshot.val().windows);
      setcurrent(snapshot.val().current);
    });
  }, [db]); // Checks db for changes then updates 

  // Calculate energy usage
  const watts = current * 230
  
  const dailyEnergyUsage = (watts * usageHoursPerDay) / 1000; // in kWh
  const monthlyEnergyUsage = dailyEnergyUsage * 30; //  30 days in a month
  const yearlyEnergyUsage = dailyEnergyUsage * 365; //  365 days in a year

  return (
    // Containers
    <ImageBackground source={background} style={styles.backgroundImage}>
      <View style={styles.spacer1}></View>
      {/* Welcome text */}
      <View style={styles.container}>
        <Text style={styles.text}>Smart home</Text>
      </View>

      {/* Light switch */}
      <View styles={styles.dataWrapperOne}>
        <Text style={styles.color}>Lichten</Text>
        <Switch 
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>

      <View>
        <Text style={styles.color}>Window</Text>
        <Image
          source={windows ? windowOpen : windowClosed}
          style={styles.windowImage}
        />
      </View>

      <View style={styles.data}>
        <View style={styles.spacer}></View>

        <Text style={styles.title}>Energie Gebruik</Text>

        {/* Energy usage */}
        <View style={styles.dataWrapperM}>
          <View style={styles.humid}>
            <Text style={styles.dataText}>{dailyEnergyUsage.toFixed(2)} kWh</Text>
            <Text style={styles.title}>Dag</Text>
          </View>
          <View style={styles.humid}>
            <Text style={styles.dataText}>{monthlyEnergyUsage.toFixed(2)} kWh</Text>
            <Text style={styles.title}>Maand</Text>
          </View>
          <View style={styles.pressure}>
            <Text style={styles.dataText}>{yearlyEnergyUsage.toFixed(2)} kWh</Text>
            <Text style={styles.title}>Jaar</Text>
          </View>
        </View>

        <Text style={styles.title}>Geld Gebruik</Text>

        <View style={styles.dataWrapper}>
          <View style={styles.humid}>
            <Text style={styles.dataText}>{(dailyEnergyUsage * 0.2).toFixed(2)} €</Text>
            <Text style={styles.title}>Dag</Text>
          </View>
          <View style={styles.humid}>
            <Text style={styles.dataText}>{(monthlyEnergyUsage * 0.2).toFixed(2)} €</Text>
            <Text style={styles.title}>Maand</Text>
          </View>
          <View style={styles.pressure}>
            <Text style={styles.dataText}>{(yearlyEnergyUsage * 0.2).toFixed(2)} €</Text>
            <Text style={styles.title}>Jaar</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Smarts;

// Styling for containers
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  windowImage: {
    width: 100,
    height: 100,
    margin: 20,
  },
  text: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingRight: 35,
  },
  data: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  spacer: {
    height: "30%",
  },
  spacer1: {
    height: "15%",
  },
  dataWrapperM: {
    backgroundColor: "#72777a",
    flexDirection: "row",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "white",
    marginBottom: 15,
  },
  dataWrapper: {
    backgroundColor: "#72777a",
    flexDirection: "row",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "white",
  },
  dataWrapperOne: {
    backgroundColor: "gray",
    flexDirection: "row",
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "white",
    marginTop: 15,
  },
  humid: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pressure: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dataText: {
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    textAlign: "center",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    fontFamily: "Helvetica",
  },
  color: {
    color: "white",
    marginLeft: 100,
  },
});
