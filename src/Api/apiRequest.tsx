
import { base_url } from './index';
import ScreenNameEnum from '../routes/screenName.enum';
import { loginSuccess, logout } from '../redux/feature/authSlice';
import { errorToast, successToast } from '../utils/customToast';
 import AsyncStorage from '@react-native-async-storage/async-storage';
 import { Toast } from '../utils/Toast';
import { color } from '../constant';
 const handleLogout = async (dispatch: any) => {
  try {
     dispatch(logout());    // reset Redux state
   } catch (error) {
    console.error('Error during logout:', error);
  }
};

 const saveAuthData = async (userData:any, token:any) => {
  try {
    await AsyncStorage.setItem('authData', JSON.stringify({ userData, token }));
    console.log('Auth data saved successfully');
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};
 const getAuthData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('authData');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error reading auth data:', error);
    return null;
  }
};

const LogiApi = async (
  param: any,
  setLoading: (loading: boolean) => void,
) => {
  setLoading(true);

  try {
    // ✅ Create FormData object
    const formdata = new FormData();
    formdata.append('countryCode', param?.code || '');
    formdata.append('phoneNumber', param?.phone || '');
    formdata.append('Type', param?.type || '');

    console.log('FormData:', {
      countryCode: param?.code,
      phoneNumber: param?.phone,
      Type: param?.type,
    });

    // ✅ Send FormData instead of JSON
    const response = await fetch(`${base_url}/register`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        // ❌ Do NOT set Content-Type manually for FormData
        // The browser/react-native will handle the correct boundary automatically
      },
      body: formdata,
    });

    const textResponse = await response.text();

    // ✅ Try parsing response safely
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(textResponse);
    } catch (error) {
      errorToast('Invalid server response');
      return;
    }

    // ✅ Handle API response
    if (parsedResponse?.status === 1) {
      successToast(parsedResponse.message);
      param.navigation.navigate(ScreenNameEnum.OtpScreen, {
        code: param?.code,
        phone: param?.phone,
      });
      return parsedResponse;
    } else {
      errorToast(parsedResponse.message);
      return parsedResponse;
    }

  } catch (error) {
    console.error('Login error:', error);
    errorToast('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};

const Verifyotp = async (param: any, setLoading: any, dispatch: any) => {
  setLoading(true);

  try {
    // ✅ Create FormData
    const formdata = new FormData();
    formdata.append('countryCode', param?.code || '');
    formdata.append('phoneNumber', param?.phone || '');
    formdata.append('otp', param?.otp || '');
        // formdata.append('otp', "9999" || '');

    const response = await fetch(`${base_url}/verify-otp`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
       },
      body: formdata,
    });

    const textResponse = await response.text();
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(textResponse);
    } catch (error) {
      errorToast('Invalid server response');
      return;
    }
    if (parsedResponse?.status == 1) {
      successToast(parsedResponse?.message);
      await AsyncStorage.setItem('token', parsedResponse?.token);
      dispatch(loginSuccess({ userData: parsedResponse, token: parsedResponse?.token }));
       await saveAuthData(parsedResponse, parsedResponse?.token);
      //  if(parsedResponse?.type === "Delivery"){
      //   param.navigation.navigate(ScreenNameEnum.DeliveryTabNavigator);
      //  }else{
      //   param.navigation.navigate(ScreenNameEnum.TabNavigator);
      //  }
         param.navigation.navigate(ScreenNameEnum.ProfileSetup);
     
     } else {
      errorToast(parsedResponse?.message);
    }

  } catch (error: any) {
    console.error('Login error:', error);
    errorToast('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};

const Resend_otp = async (param: any, setLoading: any) => {
  setLoading(true);
  try {
    // ✅ Create FormData
    const formdata = new FormData();
    formdata.append('countryCode', param?.code || '');
    formdata.append('phoneNumber', param?.phone || '');

    console.log('FormData:', {
      countryCode: param?.code,
      phoneNumber: param?.phone,
    });

    // ✅ Send FormData
    const response = await fetch(`${base_url}/resend-otp`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        // ❌ Do NOT set Content-Type manually for FormData
      },
      body: formdata,
    });

    const textResponse = await response.text();

    // ✅ Parse safely
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(textResponse);
    } catch (error) {
      errorToast('Invalid server response');
      return;
    }

    console.log('parsedResponse', parsedResponse);

    // ✅ Handle response
    if (parsedResponse?.status === 1) {
      successToast(parsedResponse?.message);
    } else {
      errorToast(parsedResponse?.message);
    }

  } catch (error: any) {
    console.error('Resend OTP error:', error);
    errorToast('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};

 const UpdateProfile = async (
  param: any,
  setLoading: (loading: boolean) => void
) => {
  try {
    setLoading(true);

    const token = await AsyncStorage.getItem("token");

    const formdata = new FormData();

    if (param.username) formdata.append("firstName", param.username);
    if (param.email) formdata.append("email", param.email);
    if (param.address) formdata.append("address", param.address);

    // ✅ Append image only if exists
    if (param.imagePrfoile && param.imagePrfoile.uri) {
      const fileName = param.imagePrfoile.fileName || "profile.jpg";
      const fileType = param.imagePrfoile.type || "image/jpeg";

      formdata.append("imageFile", {
        uri: param.imagePrfoile.uri,
        name: fileName,
        type: fileType,
      });
    }

    // ✅ Do NOT manually set 'Content-Type' header
    const headers: any = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    // ✅ Use POST (most servers expect POST for FormData upload)
    const response = await fetch(`${base_url}/setup-profile`, {
      method: "POST",
      headers,
      body: formdata,
    });

    const textResponse = await response.text();
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(textResponse);
    } catch {
      throw new Error("Invalid server response");
    }

    if (parsedResponse.status == "1") {
      successToast(parsedResponse.message);
      return parsedResponse;
    } else {
      errorToast(parsedResponse.message);
      return parsedResponse;
    }
  } catch (error) {
    console.error("UpdateProfile error:", error);
    errorToast("Something went wrong. Please try again.");
    return null;
  } finally {
    setLoading(false);
  }
};

  
    
const GetProfileApi = async (
  setLoading: (loading: boolean) => void
): Promise<any | null> => {
  setLoading(true);
  const token = await AsyncStorage.getItem('token');
  console.log("token", token);
  try {
    const response = await fetch(`${base_url}/setup-profile`, {
      method: 'GET',  // agar get ho toh GET use karna
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    console.log("responseData", responseData);

    if (responseData.status === "1" || responseData.status === 1) {
      return responseData;
    } else {
      Toast(responseData.error || responseData.message || "Something went wrong", color.red, 10);
      return null;
    }
  } catch (error) {
    console.error("API call error:", error);
    errorToast("Network error");
    return null;
  } finally {
    setLoading(false);
  }
};

 
 const Privacypolicy = async (setLoading: any) => {
  setLoading(true);
  try {
    const response = await fetch(`${base_url}/privacy-policy`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const textResponse = await response.text();
    const parsedResponse = JSON.parse(textResponse);

    console.log("parsedResponse", parsedResponse);

    if (parsedResponse?.status === 1) {
      successToast(parsedResponse?.message);
      return parsedResponse; // ✅ Return the data
    } else {
      errorToast(parsedResponse?.message);
      return null; // Optional: return null on failure
    }

  } catch (error: any) {
    console.error('Privacy Policy error:', error);
    errorToast(error.message);
    return null;
  } finally {
    setLoading(false);
  }
};


 const Termsconditions = async (setLoading: any) => {
  setLoading(true);
  try {
    const response = await fetch(`${base_url}/terms-and-conditions`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const textResponse = await response.text();
    const parsedResponse = JSON.parse(textResponse);

    console.log("parsedResponse", parsedResponse);

    if (parsedResponse?.status === 1) {
      successToast(parsedResponse?.message);
      return parsedResponse; // ✅ Return the data
    } else {
      errorToast(parsedResponse?.message);
      return null; // Optional: return null on failure
    }

  } catch (error: any) {
    console.error('Privacy Policy error:', error);
    errorToast(error.message);
    return null;
  } finally {
    setLoading(false);
  }
};


 const DeliveryUploadDocument = async (
  param: any,
  setLoading: (loading: boolean) => void
) => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");

    const formdata = new FormData();

    if (param.drivingLicense?.uri) {
      formdata.append("drivingLicense", {
        uri: param.drivingLicense.uri,
        name: param.drivingLicense.name || "license.jpg",
        type: param.drivingLicense.type || "image/jpeg",
      });
    }

    if (param.idDocument?.uri) {
      formdata.append("idDocument", {
        uri: param.idDocument.uri,
        name: param.idDocument.name || "id.jpg",
        type: param.idDocument.type || "image/jpeg",
      });
    }

    if (param.vehiclePapers?.uri) {
      formdata.append("vehiclePapers", {
        uri: param.vehiclePapers.uri,
        name: "profile.jpg",
        type:"image/jpeg",
      });
    }

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${base_url}/upload-document`, {
      method: "POST",
      headers,
      body: formdata,
    });

    const textResponse = await response.text();
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(textResponse);
    } catch {
      throw new Error("Invalid server response");
    }
    console.log("parsedResponse", parsedResponse);
    if (parsedResponse.status == "1") {
      successToast(parsedResponse.message);
    }  

    return parsedResponse;
  } catch (error) {
    console.error("DeliveryUploadDocument error:", error);
    errorToast("Something went wrong. Please try again.");
    return null;
  } finally {
    setLoading(false);
  }
};


 const DeliveryVehicleDocument = async (
  param: any,
  setLoading: (loading: boolean) => void
) => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");

    const formdata = new FormData();

    if (param.vehicleType) {
      formdata.append("vehicleType", param.vehicleType);
    }

    if (param.vehicleNumber) {
      formdata.append("vehicleNumber", param.vehicleNumber);
    }

    if (param.vehicleRegistration?.uri) {
      formdata.append("vehicleRegistration", {
        uri: param.vehicleRegistration.uri,
        name: param.vehicleRegistration.name || "vehicle_registration.jpg",
        type: param.vehicleRegistration.type || "image/jpeg",
      });
    }
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${base_url}/vehicle-setup`, {
      method: "POST",
      headers,
      body: formdata,
    });

    const textResponse = await response.text();
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(textResponse);
    } catch {
      throw new Error("Invalid server response");
    }

    console.log("Vehicle Upload Response:", parsedResponse);

    if (parsedResponse.status == "1") {
      successToast(parsedResponse.message || "Document uploaded successfully!");
    } else {
      errorToast(parsedResponse.message || "Upload failed.");
    }

    return parsedResponse;
  } catch (error) {
    console.error("DeliveryVehicleDocument error:", error);
    errorToast("Something went wrong. Please try again.");
    return null;
  } finally {
    setLoading(false);
  }
};

const GetuploadDocument = async (
  setLoading: (loading: boolean) => void
): Promise<any | null> => {
  setLoading(true);
  const token = await AsyncStorage.getItem('token');
  console.log("token", token);
  try {
    const response = await fetch(`${base_url}/upload-document`, {
      method: 'GET',  // agar get ho toh GET use karna
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    console.log("responseData", responseData);

    if (responseData.status === "1" || responseData.status === 1) {
      return responseData;
    } else {
      Toast(responseData.error || responseData.message || "Something went wrong", color.red, 10);
      return null;
    }
  } catch (error) {
    console.error("API call error:", error);
    errorToast("Network error");
    return null;
  } finally {
    setLoading(false);
  }
};
const AddParcelApi = async (param: any, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const formdata = new FormData();
    if (param?.image && param?.image?.uri) {
      const fileName = param.image.fileName || "profile.jpg";
      const fileType = param.image.type || "image/jpeg";
      formdata.append("imageFile", {
        uri: param.image.uri,
        name: fileName,
        type: fileType,
      });
    }
    if (param?.pickupLocation) formdata.append("pickupLocation", param.pickupLocation);
    if (param?.dropLocation) formdata.append("dropLocation", param.dropLocation);
// image
    if (param?.pickupLat?.latitude) formdata.append("pickupLocationLat", param.pickupLat.latitude);
    if (param?.pickupLat?.longitude) formdata.append("pickupLocationLon", param.pickupLat.longitude);
 if (param?.droplat?.latitude) formdata.append("dropLocationLat", param.droplat.latitude);
    if (param?.droplat.longitude) formdata.append("dropLocationLon", param.droplat.longitude);
    if (param.shipmentType) formdata.append("shipmentType", param.shipmentType);
    if (param.senderName) formdata.append("senderName", param.senderName);
    if (param.senderMobile) formdata.append("senderMobile", param.senderMobile);
    if (param.senderAddress) formdata.append("senderAddress", param.senderAddress);
    if (param.pickupDate) {
       formdata.append("pickupDate", param.pickupDate instanceof Date ? param.pickupDate.toISOString() : param.pickupDate);
    }
    if (param.pickupTime) {
      formdata.append("pickupTime", param.pickupTime instanceof Date ? param.pickupTime.toISOString() : param.pickupTime);
    }
    if (param.consignmentType) formdata.append("consignmentType", param.consignmentType);
    if (param.packageSize) formdata.append("packageSize", param.packageSize);
    if (param.deliveryType) formdata.append("deliveryType", param.deliveryType);
    if (param.price) formdata.append("price", param.price);

    if (param.receiverName) formdata.append("receiverName", param.receiverName);
    if (param.receiverMobile) formdata.append("receiverMobileNumber", param.receiverMobile);
    if (param.receiverAddress) formdata.append("receiverAddress", param.receiverAddress);
    if (param.extraMessage) formdata.append("message", param.extraMessage);

    if (param.pickupLat) formdata.append("pickupLat", param.pickupLat.toString());
     if (param.droplat) formdata.append("droplat", param.droplat.toString());

    const headers: any = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${base_url}/parcel-details`, {
      method: "POST",
      headers,
      body: formdata,
    });

    const textResponse = await response.text();
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(textResponse);
    } catch {
      throw new Error("Invalid server response");
    }
     if (parsedResponse.status == "1") {
      successToast(parsedResponse.message);
      return parsedResponse;
    } else {
      errorToast(parsedResponse.message);
      return parsedResponse;
    }
  } catch (error) {
    console.error("AddParcelApi error:", error);
    errorToast("Something went wrong. Please try again.");
    return null;
  } finally {
    setLoading(false);
  }
};




    
const Parceldetails = async (
  setLoading: (loading: boolean) => void
): Promise<any | null> => {
  setLoading(true);
  const token = await AsyncStorage.getItem('token');
   try {
    const response = await fetch(`${base_url}/parcel-details`, {
      method: 'GET',  // agar get ho toh GET use karna
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    console.log("responseData", responseData);

    if (responseData.status == "1" || responseData.status == 1) {
      return responseData;
    } else {
      Toast(responseData.error || responseData.message || "Something went wrong", color.red, 10);
      return null;
    }
  } catch (error) {
    console.error("API call error:", error);
    errorToast("Network error");
    return null;
  } finally {
    setLoading(false);
  }
};





    
const DeliveryAvailableRequests = async (
  setLoading: (loading: boolean) => void
): Promise<any | null> => {
  setLoading(true);
  const token = await AsyncStorage.getItem('token');
   try {
    const response = await fetch(`${base_url}/delivery/available-requests`, {
      method: 'GET',  // agar get ho toh GET use karna
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const responseData = await response.json();
    console.log("responseData", responseData);

    if (responseData.status === "1" || responseData.status === 1) {
      return responseData;
    } else {
      Toast(responseData.error || responseData.message || "Something went wrong", color.red, 10);
      return null;
    }
  } catch (error) {
     errorToast("Network error");
    return null;
  } finally {
    setLoading(false);
  }
};

 export {
  LogiApi,  
   Verifyotp,
handleLogout,
getAuthData,
Termsconditions,
saveAuthData,
Resend_otp,
     GetProfileApi,  
 Privacypolicy,
UpdateProfile ,
DeliveryUploadDocument,
DeliveryVehicleDocument,
GetuploadDocument,
AddParcelApi,
Parceldetails ,
DeliveryAvailableRequests
}  