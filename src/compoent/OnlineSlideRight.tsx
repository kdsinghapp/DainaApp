// SlideButton.tsx
import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from "react-native";
import SvgIndex from "../assets/svgIndex";
import font from "../theme/font";
import imageIndex from "../assets/imageIndex";
 
const { width } = Dimensions.get("window");

interface SlideButtonProps {
  title?: string;
  onSlideSuccess: () => void;
}

const OnlineSlideRight: React.FC<SlideButtonProps> = ({
  title = "Continue",
  onSlideSuccess,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const maxSlide = width * 0.75; // slider area ka width

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gesture) => {
        if (gesture.dx >= 0 && gesture.dx <= maxSlide - 70) {
          translateX.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > maxSlide - 120) {
          Animated.timing(translateX, {
            toValue: maxSlide - 70,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            console.log("Slide complete!");

            onSlideSuccess();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.slider}>
        {/* Background text */}

        {/* Arrow indicator */}
        <View style={styles.arrowWrapper}>
 <View style={{
  marginLeft:15
}}>
       <Text style={{
        color:"#FFCC00",
        fontSize:18 ,
        }}>online </Text>
          </View>
         </View>

        {/* Sliding button */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.button, { transform: [{ translateX }] }]}
        >
          <View style={{
            flexDirection:"row" ,
            alignItems:"center" ,
            right:15
          }}>
          <Image source={imageIndex.go} 
          style={{
            height:50,
            width:50 ,
 
          }}
          />
          <Image source={imageIndex.rightaArrow} 
          style={{
            height:22,
            width:22 ,
            left:8
 
          }}
          />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

export default OnlineSlideRight;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
   },
  slider: {
    width: "100%",
    height: 58,
    backgroundColor: "#000000",
    borderRadius: 40,
    justifyContent: "center",
 
  },
  hintText: {
     fontSize: 16,
     color: "black",
     fontFamily:font.MonolithRegular
  },
  arrowWrapper: {
    position: "absolute",
    right: 25,
    flexDirection: "row",
    alignItems: "center",
   },
  button: {
    position: "absolute",
    left: 0,
    width: 140,
    height: 50,
    backgroundColor: "black",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
});
