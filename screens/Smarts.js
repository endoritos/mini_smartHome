import React, { useEffect, useState, useRef } from 'react'; 
// Importeer React en verschillende hooks van React

import { StyleSheet, Text, View, ImageBackground, Button, Switch, Image } from 'react-native'; 
// Importeer componenten van react-native

import { db, ref, onValue, set } from "../firebase"; 
// Importeer functies van de Firebase configuratie

import background from "../assets/bbl.png"; 
// Importeer de achtergrondafbeelding

import windowOpen from "../assets/windowOpen.webp"; 
// Importeer de afbeelding voor open raam

import windowClosed from "../assets/windowClosed.webp"; 
// Importeer de afbeelding voor gesloten raam

const Smarts = () => {
  const [windows, setWindows] = useState(false); 
  // Definieer state voor ramen, initialiseer als false

  const [current, setCurrent] = useState(0); 
  // Definieer state voor huidige stroom, initialiseer als 0

  const [dailykWh, setDailykWh] = useState(0); 
  // Definieer state voor dagelijks kWh, initialiseer als 0

  const [monthlykWh, setMonthlykWh] = useState(0); 
  // Definieer state voor maandelijks kWh, initialiseer als 0

  const [yearlykWh, setYearlykWh] = useState(0); 
  // Definieer state voor jaarlijks kWh, initialiseer als 0

  const [isEnabled, setIsEnabled] = useState(false); 
  // Definieer state voor schakelaar, initialiseer als false

  const [usageTime, setUsageTime] = useState(0); 
  // Definieer state voor gebruikstijd, initialiseer als 0

  const intervalRef = useRef(null); 
  // Declareer intervalRef met useRef

  const toggleSwitch = () => { 
    // Functie om de schakelaar om te zetten
    setIsEnabled(previousState => { 
      // Wijzig de state van de schakelaar
      const newState = !previousState; 
      // Nieuwe toestand is het tegenovergestelde van de vorige

      const switchRef = ref(db, 'light'); 
      // Verwijzing naar de 'light' database

      set(switchRef, newState).then(() => { 
        // Update de database met de nieuwe schakelaarstand
        console.log("Light switch state updated in database successfully."); 
        // Log een succesbericht
      }).catch((error) => { 
        console.error("Error updating light switch state in database: ", error); 
        // Log een foutbericht bij mislukking
      });

      return newState; 
      // Retourneer de nieuwe toestand
    });
  };

  useEffect(() => { 
    // Gebruik useEffect om side-effects te beheren
    const data = ref(db); 
    // Verwijzing naar de gehele database

    onValue(data, (snapshot) => { 
      // Voeg een listener toe voor wijzigingen in de database
      const data = snapshot.val(); 
      // Verkrijg de huidige waarden uit de snapshot

      console.log("Firebase Data:", data); 
      // Log de ontvangen gegevens

      setIsEnabled(data.light); 
      // Stel de schakelaarstand in volgens de database

      setWindows(data.windows); 
      // Stel de raamstand in volgens de database

      setCurrent(data.current); 
      // Stel de huidige stroom in volgens de database

      setUsageTime(data.usageTime || 0); 
      // Stel de gebruikstijd in, of 0 als niet aanwezig

      setDailykWh(data.dailykWh || 0); 
      // Stel het dagelijks kWh in, of 0 als niet aanwezig

      setMonthlykWh(data.monthlykWh || 0); 
      // Stel het maandelijks kWh in, of 0 als niet aanwezig

      setYearlykWh(data.yearlykWh || 0); 
      // Stel het jaarlijks kWh in, of 0 als niet aanwezig
    });

    intervalRef.current = setInterval(() => { 
      // Stel een interval in dat elke minuut wordt uitgevoerd
      const now = new Date(); 
      // Verkrijg de huidige datum en tijd

      if (now.getHours() === 0 && now.getMinutes() === 0) { 
        resetDailyUsage(); 
        // Reset dagelijks gebruik om middernacht
      }

      if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) { 
        resetMonthlyUsage(); 
        // Reset maandelijks gebruik op de eerste dag van de maand
      }

      if (now.getMonth() === 0 && now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) { 
        resetYearlyUsage(); 
        // Reset jaarlijks gebruik op de eerste dag van het jaar
      }
    }, 60000); 
    // Controleer elke minuut

    return () => { 
      clearInterval(intervalRef.current); 
      // Maak de interval schoon bij component unmount
    };
  }, []);

  const resetDailyUsage = () => { 
    setDailykWh(0); 
    // Reset dagelijks kWh

    setUsageTime(0); 
    // Reset gebruikstijd

    const dailykWhRef = ref(db, 'dailykWh'); 
    // Verwijzing naar dailykWh in de database

    const usageTimeRef = ref(db, 'usageTime'); 
    // Verwijzing naar usageTime in de database

    set(dailykWhRef, 0).catch(error => console.error("Error resetting daily kWh: ", error)); 
    // Reset dailykWh in de database en log eventuele fouten

    set(usageTimeRef, 0).catch(error => console.error("Error resetting usage time: ", error)); 
    // Reset usageTime in de database en log eventuele fouten
  };

  const updateDatabase = (path, value) => { 
    const dbRef = ref(db, path); 
    // Verwijzing naar een specifiek pad in de database

    set(dbRef, value).catch(error => console.error(`Error updating ${path}: `, error)); 
    // Update de waarde in de database en log eventuele fouten
  };

  const resetMonthlyUsage = () => { 
    setMonthlykWh(0); 
    // Reset maandelijks kWh

    updateDatabase('monthlykWh', 0); 
    // Update de database voor maandelijks kWh
  };

  const resetYearlyUsage = () => { 
    setYearlykWh(0); 
    // Reset jaarlijks kWh

    updateDatabase('yearlykWh', 0); 
    // Update de database voor jaarlijks kWh
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
          </

View>
          <View style={styles.pressure}>
            <Text style={styles.dataText}>{(yearlykWh * 0.2).toFixed(2)} €</Text> 
            <Text style={styles.title}>Jaar</Text> 
          </View>
        </View>

        <Button title="Reset Daily Usage" onPress={resetDailyUsage} /> 
        // Knop om het dagelijks gebruik te resetten
      </View>
    </ImageBackground>
  );
};

export default Smarts; 
// Exporteer de Smarts component

// Styling voor de containers
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
