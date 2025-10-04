import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import imageIndex from "../../../assets/imageIndex";
import { useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import font from "../../../theme/font";
 
interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hey there! 👋", sender: "other", time: "10:10" },
    {
      id: "2",
      text: "This is your delivery driver from Speedy Chow. I'm just around the corner.",
      sender: "other",
      time: "10:10",
    },
    { id: "3", text: "Hi!", sender: "me", time: "10:12" },
    {
      id: "4",
      text: "Awesome, thanks for letting me know! Can’t wait for my delivery. 🎉",
      sender: "me",
      time: "10:12",
    },
    { id: "5", text: "No problem at all! I’ll be there in about 15 minutes.", sender: "other", time: "10:13" },
    { id: "6", text: "I’ll text you when I arrive.", sender: "other", time: "10:14" },
    { id: "7", text: "Great! 😊", sender: "me", time: "10:15" },
  ]);

  const [inputText, setInputText] = useState("");

  const sendMessage = () => {
    if (inputText.trim().length === 0) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMsg]);
    setInputText("");
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "me" ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={item.sender === "me" ? styles.myMessageText : styles.otherMessageText}>
        {item.text}
      </Text>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  );
const navgtaion = useNavigation()
  return (
    <SafeAreaView style={styles.container}>
        <StatusBarComponent/>
       <View style={styles.header}>
        <TouchableOpacity onPress={()=>{
            navgtaion.goBack()
        }}>
        <Image
          source={imageIndex.back}
          style={{
            height:30,
            width:30,
          }}
        />
        </TouchableOpacity>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={[styles.avatar,{
            marginLeft:11
          }]}
        />
        <View>
          <Text style={styles.name}>Jenny Wilson</Text>
          <Text style={styles.status}>Online</Text>
        </View>
      </View>

      {/* Chat messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.chatContainer}
      />

      {/* Input box */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText} 
            placeholderTextColor={"black"}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Image source={imageIndex.voies} 
            
            style={{
                height:55,
                width:55
            }}
            />
           </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  name: {  fontFamily:font.MonolithRegular, fontSize: 16 },
  status: { fontSize: 12, color: "green",fontFamily:font.MonolithRegular, },
  chatContainer: { padding: 10 },
  messageBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FFCC00",
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F6F6F6",
    borderBottomLeftRadius: 0,
  },
  myMessageText: { color: "white",fontFamily:font.MonolithRegular, fontSize:14 },
  otherMessageText: { color: "#2C2D3A",fontFamily:font.MonolithRegular,fontSize:14 },
  timeText: { fontSize: 10, fontFamily:font.MonolithRegular, marginTop: 5, textAlign: "right" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
     borderTopWidth: 1,
    borderTopColor: "#eee",
    height:55 ,
    justifyContent:"center" ,
    marginHorizontal:10 ,
    marginBottom:30
  },
  input: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    height:60 ,
    justifyContent:"center" ,
    marginTop:15


  },
  sendButton: {
 justifyContent:"center",
 alignItems:"center" ,
 marginTop:30
   
  },
});

export default ChatScreen;
