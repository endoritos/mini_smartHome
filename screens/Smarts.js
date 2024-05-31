import React, { useEffect, useState, useRef } from 'react'; 
import { StyleSheet, Text, View, ImageBackground, Button, Switch, Image } from 'react-native'; 
import { db, ref, onValue, set, get, child } from "../firebase"; 
import background from "../assets/bbl.png"; 
import windowOpen from "../assets/windowOpen.webp"; 
import windowClosed from "../assets/windowClosed.webp"; 

const Smarts = () => {
  const [windows, setWindows] = useState(false);
  const [current, setCurrent] = useState(0);
  const [dailykWh, setDailykWh] = useState(0);
  const [monthlykWh, setMonthlykWh] = useState(0);
  const [yearlykWh, setYearlykWh] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [usageTime, setUsageTime] = useState(0);
  const [usageHistory, setUsageHistory] = useState({});
  const intervalRef = useRef(null);

  const toggleSwitch = () => {
    setIsEnabled(previousState => {
      const newState = !previousState;
      const switchRef = ref(db, 'light');
      set(switchRef, newState).then(() => {
        console.log("Light switch state updated in database successfully.");
      }).catch((error) => {
        console.error("Error updating light switch state in database: ", error);
      });
      return newState;
    });
  };

  useEffect(() => {
    const dataRef = ref(db);
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Firebase Data:", data);

      setIsEnabled(data.light);
      setWindows(data.windows);
      setCurrent(data.current);
      setUsageTime(data.usageTime || 0);
      setDailykWh(data.dailykWh || 0);
      setMonthlykWh(data.monthlykWh || 0);
      setYearlykWh(data.yearlykWh || 0);

      // Load usage history
      if (data.usageHistory) {
        setUsageHistory(data.usageHistory);
      }
    });

    intervalRef.current = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetDailyUsage();
      }
      if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        resetMonthlyUsage();
      }
      if (now.getMonth() === 0 && now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        resetYearlyUsage();
      }
    }, 60000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const resetDailyUsage = () => {
    setDailykWh(0);
    setUsageTime(0);
    const dailykWhRef = ref(db, 'dailykWh');
    const usageTimeRef = ref(db, 'usageTime');
    set(dailykWhRef, 0).catch(error => console.error("Error resetting daily kWh: ", error));
    set(usageTimeRef, 0).catch(error => console.error("Error resetting usage time: ", error));
  };

  const updateDatabase = (path, value) => {
    const dbRef = ref(db, path);
    set(dbRef, value).catch(error => console.error(`Error updating ${path}: `, error));
  };

  const resetMonthlyUsage = () => {
    setMonthlykWh(0);
    updateDatabase('monthlykWh', 0);
  };

  const resetYearlyUsage = () => {
    const currentYear = new Date().getFullYear();
    const usageHistoryRef = ref(db, `usageHistory/${currentYear}`);
    set(usageHistoryRef, yearlykWh).then(() => {
      console.log("Yearly usage saved to history successfully.");
      setYearlykWh(0);
      updateDatabase('yearlykWh', 0);
    }).catch(error => {
      console.error("Error saving yearly usage to history: ", error);
    });
  };

  return (
    <ImageBackground source={background} style={styles.backgroundImage}> 
      <View style={styles.spacer1}></View> 
      <View style={styles.container}>
        <Text style={styles.text}>Smart home</Text> 
      </View>

      <View style={styles.verticalContainer}> 
        <View style={styles.centeredContainer}>
          <Text style={styles.color}>Lichten</Text> 
          <Switch 
            trackColor={{ false: "#767577", true: "#81b0ff" }} 
            thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"} 
            ios_backgroundColor="#3e3e3e" 
            onValueChange={toggleSwitch} 
            value={isEnabled} 
          />
        </View>
        <View style={styles.centeredContainer}>
          <Text style={styles.color}>Raam</Text> 
          <Image 
            source={windows ? windowOpen : windowClosed} 
            style={styles.windowImage} 
          />
        </View>
      </View>

      <View style={styles.data}> 
        <View style={styles.spacer}></View>

        <Text style={styles.title}>Energie Gebruik</Text>

        <View style={styles.dataWrapperM}> 
          <View style={styles.humid}>
            <Text style={styles.dataText}>{dailykWh.toFixed(2)} kWh</Text> 
            <Text style={styles.title}>Dag</Text> 
          </View>
          <View style={styles.humid}>
            <Text style={styles.dataText}>{monthlykWh.toFixed(2)} kWh</Text> 
            <Text style={styles.title}>Maand</Text> 
          </View>
          <View style={styles.pressure}>
            <Text style={styles.dataText}>{yearlykWh.toFixed(2)} kWh</Text> 
            <Text style={styles.title}>Jaar</Text> 
          </View>
        </View>

        <Text style={styles.title}>Geld Gebruik</Text>

        <View style={styles.dataWrapper}> 
          <View style={styles.humid}>
            <Text style={styles.dataText}>{(dailykWh * 0.2).toFixed(2)} €</Text> 
            <Text style={styles.title}>Dag</Text> 
          </View>
          <View style={styles.humid}>
            <Text style={styles.dataText}>{(monthlykWh * 0.2).toFixed(2)} €</Text> 
            <Text style={styles.title}>Maand</Text> 
          </View>
          <View style={styles.pressure}>
            <Text style={styles.dataText}>{(yearlykWh * 0.2).toFixed(2)} €</Text> 
            <Text style={styles.title}>Jaar</Text> 
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button title=" Daily Demo" onPress={resetDailyUsage} />
          <Button title=" Yearly Demo" onPress={resetYearlyUsage} />
      </View>
      </View>

      {/* <View style={styles.data}>
        <Text style={styles.title}>Historisch Energie Gebruik</Text>
        {Object.keys(usageHistory).map((year) => (
          <View key={year} style={styles.humid}>
            <Text style={styles.dataText}>{year}: {usageHistory[year]} kWh</Text>
          </View>
        ))}
      </View> */}
    </ImageBackground>
  );
};

export default Smarts;

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
  verticalContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  centeredContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  windowImage: {
    width: 100, 
    height: 100, 
    margin: 20,
  },
  text: {
    color: 'white', 
    fontSize: 50, 
    fontWeight:'bold',
    textAlign:'center',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
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
    color: "Black",
    textAlign: "center",
    fontFamily: "Helvetica",
  },
  color: {
    color: "white",
  },
});