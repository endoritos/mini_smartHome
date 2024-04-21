import { StyleSheet, Text, View, ImageBackground ,Button, Switch , Image } from 'react-native';
import {useEffect,useState} from 'react';
import { db, ref, onValue ,set} from "../firebase";

import background from "../assets/background.webp";
import windowOpen from "../assets/windowOpen.webp";
import windowClosed from "../assets/windowClosed.webp";

const Smarts = () => {
  const [temp ,settemp] = useState('0');
  const [humdity, sethumidiy] = useState('0');
  const [pressure, setpressure]= useState('0');
  const [windows, setwindows] = useState(false);

  const [isEnabled, setIsEnabled] = useState(false); 

  const toggleSwitch = () => {
    setIsEnabled(previousState => {
      const newState = !previousState;
      
      // updating value form clintside to database 
      const switchRef = ref(db,'light'); // after db the name of the value aka the path
      set(switchRef, newState).then(() => {
        console.log("Light switch state updated in database successfully.");
      }).catch((error) => {
        console.error("Error updating light switch state in database: ", error);
      });

      return newState;
    });
  };

  // inport form a database and updata static for user
  useEffect(()=>{
    const data = ref(db)

    onValue(data, (snapshot)=>{
      settemp(snapshot.val().temp)
      sethumidiy(snapshot.val().humid)
      setpressure(snapshot.val().pressue)
      setIsEnabled(snapshot.val().light)
      setwindows(snapshot.val().windows)
    })
  },[db])
  
  return (   
    <ImageBackground source={background} style={styles.backgroundImage}>
    <View style={styles.spacer1}></View>
      {/* welcome text? */}
    <View style={styles.container}>
        <Text style={styles.text}>
          Smart home
        </Text>
    </View>

    {/* light swith  */}

    <View styles={styles.dataWrapperOne}>
    <Text>Lichten</Text>
      <Switch 
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>

    <View>
    <Image
          source={windows ? windowOpen : windowClosed}
          style={styles.windowImage}
        />
        <Text>Window</Text>
    </View>

    <View style={styles.data}>
      <View style={styles.spacer}></View>

      <Text style={styles.title}>Energie Gebruik</Text>

        {/* Dag  */}
      <View style={styles.dataWrapperM}>
        <View style={styles.humid}>
          <Text style={styles.dataText}>{humdity}kwa</Text>
          <Text style={styles.title}>Dag</Text>
        </View>
          {/* week */}
        <View style={styles.humid}>
          <Text style={styles.dataText}>{humdity}kwa</Text>
          <Text style={styles.title}>Week</Text>
        </View>
          {/* month */}
        <View style={styles.humid}>
          <Text style={styles.dataText}>{humdity}kwa</Text>
          <Text style={styles.title}>Maand</Text>
        </View>
            {/* year */}
        <View style={styles.pressure}>
          <Text style={styles.title}>{pressure}kwa</Text>
          <Text style={styles.dataText}>Jaar</Text>
          </View>
      </View>

      <Text style={styles.title}>Geld Gebruik</Text>

      <View style={styles.dataWrapper}>
      <View style={styles.humid}>
          <Text style={styles.dataText}>{humdity}€</Text>
          <Text style={styles.title}>Dag</Text>
        </View>
          {/* week */}
        <View style={styles.humid}>
          <Text style={styles.dataText}>{humdity}€</Text>
          <Text style={styles.title}>Week</Text>
        </View>
          {/* month */}
        <View style={styles.humid}>
          <Text style={styles.dataText}>{humdity}€</Text>
          <Text style={styles.title}>Maand</Text>
        </View>
            {/* year */}
        <View style={styles.pressure}>
          <Text style={styles.title}>{pressure}€</Text>
          <Text style={styles.dataText}>Jaar</Text>
          </View>
      </View>
    </View>
    </ImageBackground>
  );
};

export default Smarts;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Centers the content horizontally
  },
  backgroundImage: {
    width: '100%', // Makes sure the background image covers the width of the screen
    height: '100%', // Makes sure the background image covers the height of the screen
    justifyContent: 'center', // Centers the child content vertically
    alignItems: 'center', // Centers the child content horizontally
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
    textAlign:'left',
    paddingRight: 35,
  },
  top :{
    flex: 1,
    textAlign:'right',
    paddingRight: 35,
    alignItems: 'right',
    borderRadius: 20,
    borderWidth: 5,
    borderColor: "yellow",
    color: 'red',
    justifyContent:'flex-end',
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
});