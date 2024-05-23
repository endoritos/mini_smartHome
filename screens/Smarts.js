import { StyleSheet, Text, View, ImageBackground, Button, Switch, Image } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { db, ref, onValue, set } from "../firebase";

import background from "../assets/bbl.png";
import windowOpen from "../assets/windowOpen.webp";
import windowClosed from "../assets/windowClosed.webp";

const Smarts = () => {
  const [windows, setwindows] = useState(false);
  const [current, setcurrent] = useState('0');
  const [usageTime, setUsageTime] = useState(0); // in seconds

  const [dailyUsage, setDailyUsage] = useState(0);
  const [monthlyUsage, setMonthlyUsage] = useState(0);
  const [yearlyUsage, setYearlyUsage] = useState(0);

  const [isEnabled, setIsEnabled] = useState(false); 
  const timerRef = useRef(null);

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

      if (newState) {
        startTimer();
      } else {
        stopTimer();
      }

      return newState;
    });
  };

  const startTimer = () => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setUsageTime(prevTime => prevTime + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    const data = ref(db);

    onValue(data, (snapshot) => {
      setIsEnabled(snapshot.val().light);
      setwindows(snapshot.val().windows);
      setcurrent(snapshot.val().current);
      setDailyUsage(snapshot.val().dailyUsage || 0);
      setMonthlyUsage(snapshot.val().monthlyUsage || 0);
      setYearlyUsage(snapshot.val().yearlyUsage || 0);

      if (snapshot.val().light) {
        startTimer();
      } else {
        stopTimer();
      }
    });

    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetDailyUsage(); // Reset daily usage at midnight
      }
      if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        resetMonthlyUsage(); // Reset monthly usage on the first day of the month
      }
      if (now.getMonth() === 0 && now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        resetYearlyUsage(); // Reset yearly usage on the first day of the year
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(interval);
      stopTimer();
    };
  }, [db]);

  useEffect(() => {
    const watts = current * 230;
    const energyUsage = (watts * (usageTime / 3600)) / 1000; // in kWh

    setDailyUsage(prevUsage => {
      const newDailyUsage = prevUsage + energyUsage;
      updateDatabase('dailyUsage', newDailyUsage);
      return newDailyUsage;
    });
    setMonthlyUsage(prevUsage => {
      const newMonthlyUsage = prevUsage + energyUsage;
      updateDatabase('monthlyUsage', newMonthlyUsage);
      return newMonthlyUsage;
    });
    setYearlyUsage(prevUsage => {
      const newYearlyUsage = prevUsage + energyUsage;
      updateDatabase('yearlyUsage', newYearlyUsage);
      return newYearlyUsage;
    });
  }, [usageTime, current]);

  const updateDatabase = (path, value) => {
    const dbRef = ref(db, path);
    set(dbRef, value).catch(error => console.error(`Error updating ${path}: `, error));
  };

  const resetDailyUsage = () => {
    setDailyUsage(0);
    setUsageTime(0); // Optionally reset usage time as well
    updateDatabase('dailyUsage', 0);
  };

  const resetMonthlyUsage = () => {
    setMonthlyUsage(0);
    updateDatabase('monthlyUsage', 0);
  };

  const resetYearlyUsage = () => {
    setYearlyUsage(0);
    updateDatabase('yearlyUsage', 0);
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
            <Text style={styles.dataText}>{dailyUsage.toFixed(2)} kWh</Text>
            <Text style={styles.title}>Dag</Text>
          </View>
          <View style={styles.humid}>
            <Text style={styles.dataText}>{monthlyUsage.toFixed(2)} kWh</Text>
            <Text style={styles.title}>Maand</Text>
          </View>
          <View style={styles.pressure}>
            <Text style={styles.dataText}>{yearlyUsage.toFixed(2)} kWh</Text>
            <Text style={styles.title}>Jaar</Text>
          </View>
        </View>

        <Text style={styles.title}>Geld Gebruik</Text>

        <View style={styles.dataWrapper}>
          <View style={styles.humid}>
            <Text style={styles.dataText}>{(dailyUsage * 0.2).toFixed(2)} €</Text>
            <Text style={styles.title}>Dag</Text>
          </View>
          <View style={styles.humid}>
            <Text style={styles.dataText}>{(monthlyUsage * 0.2).toFixed(2)} €</Text>
            <Text style={styles.title}>Maand</Text>
          </View>
          <View style={styles.pressure}>
            <Text style={styles.dataText}>{(yearlyUsage * 0.2).toFixed(2)} €</Text>
            <Text style={styles.title}>Jaar</Text>
          </View>
        </View>
        
        {/* Add buttons to reset usage */}
        <Button title="Reset Daily Usage" onPress={resetDailyUsage} />
        
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
