import { StyleSheet, Text, View, ImageBackground ,Button, Switch } from 'react-native';
import {useEffect,useState} from 'react';
import { db, ref, onValue } from "../firebase";

import background from "../assets/background.webp";
// import { DataSnapshot } from 'firebase/database'; idk what this does ik can be just snap snapshots


// inport form a database and updata static for user 
const Smarts = () => {
  const [temp ,settemp] = useState('0');
  const [humdity, sethumidiy] = useState('0');
  const [pressure, setpressure]= useState('0')
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  useEffect(()=>{
    const data = ref(db)

    onValue(data, (snapshot)=>{
      settemp(snapshot.val().temp)
      sethumidiy(snapshot.val().humid)
      setpressure(snapshot.val().pressue)
    })
  },[db])
  
  return (   
    <ImageBackground source={background} style={styles.backgroundImage}>
      {/* welcome text? */}
    <View style={styles.container}>
        <Text style={styles.text}>
          {temp}°          
        </Text>
    </View>

    {/* light swith  */}

    <View styles={styles.top}>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />

      
    </View>

    <View style={styles.data}>
      <View style={styles.spacer}></View>

      <Text style={styles.title}>Enegie usage</Text>

        {/* day  */}
      <View style={styles.dataWrapperM}>
        <View style={styles.humid}>
          <Text style={styles.dataText}>trun{humdity}</Text>
          <Text style={styles.title}>Day</Text>
        </View>
          {/* week */}
        <View style={styles.humid}>
          <Text style={styles.dataText}>trun{humdity}</Text>
          <Text style={styles.title}>Week</Text>
        </View>
          {/* month */}
        <View style={styles.humid}>
          <Text style={styles.dataText}>trun{humdity}</Text>
          <Text style={styles.title}>Month</Text>
        </View>
            {/* year */}
        <View style={styles.pressure}>
          <Text style={styles.title}>{pressure}</Text>
          <Text style={styles.dataText}>Year</Text>
          </View>
      </View>

      <Text style={styles.title}>Money usage</Text>

      <View style={styles.dataWrapper}>
      <View style={styles.humid}>
          <Text style={styles.dataText}>trun{humdity}</Text>
          <Text style={styles.title}>Day</Text>
        </View>
          {/* week */}
        <View style={styles.humid}>
          <Text style={styles.dataText}>trun{humdity}</Text>
          <Text style={styles.title}>Week</Text>
        </View>
          {/* month */}
        <View style={styles.humid}>
          <Text style={styles.dataText}>trun{humdity}</Text>
          <Text style={styles.title}>Month</Text>
        </View>
            {/* year */}
        <View style={styles.pressure}>
          <Text style={styles.title}>{pressure}</Text>
          <Text style={styles.dataText}>Year</Text>
          </View>
      </View>

    </View>
    </ImageBackground>
  );
};

export default Smarts;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the container fills the whole screen
    alignItems: 'center', // Centers the content horizontally
  },
  backgroundImage: {
    width: '100%', // Makes sure the background image covers the width of the screen
    height: '100%', // Makes sure the background image covers the height of the screen
    justifyContent: 'center', // Centers the child content vertically
    alignItems: 'center', // Centers the child content horizontally
  },
  text: {
    color: 'white', 
    fontSize: 80, // Sets the size of the text
    fontWeight:'bold',
    textAlign:'left',
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
  top :{
    textAlign:'left',
    paddingRight: 35,
  }
});
