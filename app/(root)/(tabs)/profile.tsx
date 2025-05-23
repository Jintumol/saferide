import {View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity, ImageSourcePropType, Alert} from 'react-native'
import React from 'react'
import icons from "@/constants/icons";
import images from "@/constants/images";
import {settings} from "@/constants/data";
import {useGlobalContext} from "@/lib/global-provider";
import {firebaseLogout, logout} from "@/lib/appwrite";
import { StyleSheet } from "react-native";


interface SettingsItemProp{
    icon: ImageSourcePropType;
    title: string;
    onPress?: () => void;
    textStyle?: string;
    showArrow?:boolean;
}

const SettingsItem = ({icon,title,onPress,textStyle,showArrow=true}:SettingsItemProp)=>(
    <TouchableOpacity onPress={onPress} className="flex flex-row items-center justify-between py-3">
        <View className="flex flex-row items-center gap-3">
            <Image source={icon} className="size-6"/>

            <Text className={`text-lg font-rubik-medium text-black-300 ${textStyle}`}>{title}</Text>
        </View>

        {showArrow && <Image source={icons.rightArrow} className="size-5"/>}
    </TouchableOpacity>
)

const Profile = () => {
    const {user}=useGlobalContext()
   const handleLogout=async()=>{
       const result=await firebaseLogout();
       if(result){
           Alert.alert("Success","You have successfully logged out");
           
       }else{
           Alert.alert("Error","Something went wrong");
       }
   }
    return (
       <SafeAreaView className="h-full bg-white">
          <ScrollView showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-32 px-7">
              <View className="flex flex-row items-center justify-between mt-5">
                  <Text className="text-xl font-rubik-bold">Profile</Text>
                  <Image source={icons.bell} className="size-5"/>
              </View>

              <View className="flex-row justify-center flex mt-5">
                  <View className="flex flex-col items-center relative mt-5">
                      <Image source={user?.avatar} className="size-44 relative rounded-full"/>
                      <TouchableOpacity className="absolute bottom-11 right-2" onPress={() => Profile()}>
                          <Image source={icons.edit} className="size-9"/>
                      </TouchableOpacity>
                      <Text className="text-2xl font-rubik-bold mt-2">{user?.name}</Text>
                  </View>
              </View>





              <View style={styles.container}>
                  <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                      <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
              </View>



          </ScrollView>
       </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end", // Moves it towards the bottom
        alignItems: "center",
        paddingBottom: 100, // Adjust this to move it further down
    },
    logoutButton: {
        backgroundColor: "red", // Red background
        paddingVertical: 12, // Vertical padding for better touch area
        paddingHorizontal: 30, // Horizontal padding for width
        borderRadius: 25, // Rounded corners
        width: "80%", // Button width (adjust as needed)
        alignItems: "center",
        marginTop: 20,
    },
    logoutText: {
        color: "white", // White text color
        fontSize: 18,
        fontWeight: "bold",
    },
});


export default Profile
