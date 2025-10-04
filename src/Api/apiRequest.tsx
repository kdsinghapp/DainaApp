

import { base_url } from './index';
import ScreenNameEnum from '../routes/screenName.enum';
import { loginSuccess } from '../redux/feature/authSlice';
import { errorToast, successToast } from '../utils/customToast';
 import AsyncStorage from '@react-native-async-storage/async-storage';
 import { Toast } from '../utils/Toast';
import { color } from '../constant';
const LogiApi = async (
  param: any,
  setLoading: (loading: boolean) => void,
  dispatch: any
) => {
  setLoading(true);

  try {
    const body = {
      email: param?.email,
      full_name: param?.full_name
    };

    const response = await fetch(`https://server-php-8-3.technorizen.com/chewbe/api/auth/google`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json', // Important
      },
      body: JSON.stringify(body),
    });

    const textResponse = await response.text();

    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(textResponse);
      console.log("parsedResponse", parsedResponse);
    } catch (error) {
      errorToast('Invalid server response');
      return;
    }    
    if (parsedResponse.status == '1') {
      const token = parsedResponse.data?.token;
      const userData = parsedResponse.data;
       if (token) {
        await AsyncStorage.setItem('token', token);
        dispatch(loginSuccess({ userData, token }));
        param.navigation.reset({
          index: 0,
          routes: [{ name: ScreenNameEnum.GeneralInfo }],
        });
        successToast(parsedResponse?.message)
        return parsedResponse;
      } else {
        errorToast('Token not received');
      }
      // Handle success (e.g., save token, navigate)
    } else {
      errorToast('Login failed');
    }

    return parsedResponse;
  } catch (error) {
    console.error('Login error:', error);
    errorToast('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};


  
  const Signupupdate = async (
    param: any,
    setLoading: (loading: boolean) => void,
    dispatch: any
  ) => {
    const dateObj = new Date(param.dob);
    const isoDate = dateObj.toISOString();
  
    try {
      setLoading(true);
  
      const myHeaders = new Headers();
      myHeaders.append('Accept', 'application/json');
  
      const formdata = new FormData();
      formdata.append('user_id', param.id);
  
      if (param.gender) {
        formdata.append('gender', param.gender);
      }
  
      if (param.dob) {
        formdata.append('dob', isoDate);
      }
  
      if (param.diabetes) {
        formdata.append('diabetes', param.diabetes);
      }
  
      if (param.selectedType1) {
        formdata.append('body_type', param.selectedType1);
      }
  
      if (param.selectedType2) {
        formdata.append('sleep', param.selectedType2);
      }
  
      if (param.selectedType3) {
        formdata.append('exercise_type', param.selectedType3);
      }
  
      if (param.weight) {
        formdata.append('weight', param.weight);
      }
  
      if (param.height) {
        formdata.append('height', param.height);
      }
      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
      };
  
      const response = await fetch(`${base_url}/common/signup_update`, requestOptions);
      const textResponse = await response.text();
      const parsedResponse = JSON.parse(textResponse);
  
      if (parsedResponse.status === '1') {
        const token = parsedResponse.data?.token;
        const userData = parsedResponse.data;
         if (token) {
          await AsyncStorage.setItem('token', token);
          dispatch(loginSuccess({ userData, token }));
        }
  
        successToast(parsedResponse.message);
        Toast(parsedResponse?.message, '#4CBCA6', 10); // Blue snackbar with margin

        param.navigation.reset({
          index: 0,
          routes: [{ name: ScreenNameEnum.FinishAccount }],
        });
  
        return parsedResponse;
      } else {
        errorToast(parsedResponse.message);
        return parsedResponse;
      }
    } catch (error) {
      console.error("Signupupdate error:", error);
      errorToast("Something went wrong. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const UpdateProfile = async (
    param: any,
    setLoading: (loading: boolean) => void,
   ) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const formdata = new FormData();
      // full_name
      if (param.gender) formdata.append('gender', param.gender);
      if (param.username) formdata.append('full_name', param.username);
   if (param.dob) formdata.append('dob', param.dob);
   if (param.sleep) formdata.append('sleep', param.sleep);

      if (param.diabetes) formdata.append('diabetes', param.diabetes);
      if (param.bodyType) formdata.append('body_type', param.bodyType);
      if (param.activity_level) formdata.append('activity_level', param.activity_level);
      if (param.measurement_system) formdata.append('measurement_system', param.measurement_system);
      if (param.selectedType3) formdata.append('exercise_type', param.selectedType3);
      if (param.weight) formdata.append('weight', param.weight);
      if (param.height) formdata.append('height', param.height);
 
       if (param.imagePrfoile) {
        formdata.append('image', {
          uri:param.imagePrfoile.uri,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any); // Cast as any for RN FormData
      }
  
      const myHeaders = new Headers();
      myHeaders.append('Accept', 'application/json');
  
      // ✅ Include token if available
      if (token) {
        myHeaders.append('Authorization', `Bearer ${token}`);
      }
  
      console.log("FormData to send:", formdata);
  
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
      };
  
      const response = await fetch(`${base_url}/auth/update-profile`, requestOptions);
      const textResponse = await response.text();
  
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(textResponse);
      } catch (jsonError) {
         throw new Error("Invalid server response");
      }
      if (parsedResponse.status === '1') {
          Toast(parsedResponse?.message, color.primary, 10); // Blue snackbar with margin
        return parsedResponse;
      } else {
         Toast(parsedResponse?.message,color.primary, 10); // Blue snackbar with margin
        return parsedResponse;
      }
    } catch (error) {
       errorToast("Something went wrong. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
    
    const Get_post_Api = async (
     setLoading: (loading: boolean) => void
  ): Promise<any | null> => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
     try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };
  
      const response = await fetch(`${base_url}/auth/get-profile`, requestOptions);
      const responseData = await response.json();
      console.log("responseData",responseData)
      if (responseData.status === "1") {
         return responseData;
      } else {
        Toast(responseData.error || "Something went wrong", color.red, 10); // Blue snackbar with margin
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
  
 ;

 

 
const GethelpApi = async (
    setLoading,
) => {
    try {
        setLoading(true)

        const requestOptions = {
            method: "GET",
        };
        const respons = await fetch(`${base_url}/common/get_help`, requestOptions)
            .then((response) => response.text())
            .then((res) => {
                const response = JSON.parse(res);
                if (response.status == '1') {
                    setLoading(false)
                    return response
                } else {
                    setLoading(false)
                    Toast(response.error, color.red, 10); // Blue snackbar with margin
 
                    return response
                }
            })
            .catch((error) =>
              
                console.error(error));
                setLoading(false)

        return respons
    } catch (error) {
        setLoading(false)
        errorToast(
            'Network error',
        );
    }
};
const Getphysicaldata = async (
    setLoading,
) => {
    try {
        setLoading(true)

        const requestOptions = {
            method: "GET",
        };
        const respons = await fetch(`${base_url}/common/get_physical_data`, requestOptions)
            .then((response) => response.text())
            .then((res) => {
                const response = JSON.parse(res);
                if (response.status == '1') {
                    setLoading(false)
                    return response
                } else {
                    setLoading(false)
                    Toast(response.error, color.red, 10); // Blue snackbar with margin
 
                    return response
                }
            })
            .catch((error) =>
              
                console.error(error));
                setLoading(false)

        return respons
    } catch (error) {
        setLoading(false)
        errorToast(
            'Network error',
        );
    }
};
const get_tasksMainAll = async (
  setLoading,
) => {
  try {
      setLoading(true)

      const requestOptions = {
          method: "GET",
      };
      const respons = await fetch(`${base_url}/common/get_tasks`, requestOptions)
          .then((response) => response.text())
          .then((res) => {
              const response = JSON.parse(res);
              if (response.status == '1') {
                  setLoading(false)
                  return response
              } else {
                  setLoading(false)
                  Toast(response.error, color.red, 10); // Blue snackbar with margin

                  return response
              }
          })
          .catch((error) =>
            
              console.error(error));
              setLoading(false)

      return respons
  } catch (error) {
      setLoading(false)
      errorToast(
          'Network error',
      );
  }
};

const GetPurchaseplan = async (setLoading:any) => {
  try {
    setLoading(true);

    const response = await fetch(`${base_url}/common/get_purchase_plan`, {
      method: "GET",
    });

    const res = await response.json();
 
    if (res.status === "1") {
      return res; // success
    } else {
      Toast(res.error || "Something went wrong", color.red, 10);
      return res;
    }
  } catch (error) {
    console.error("Network Error:", error);
    errorToast("Network error");
    return null;
  } finally {
    setLoading(false);
  }
};

const Get_health = async (
    setLoading,
) => {
    try {
        setLoading(true)

        const requestOptions = {
            method: "GET",
        };
        const respons = await fetch(`${base_url}/common/get_health`, requestOptions)
            .then((response) => response.text())
            .then((res) => {
                const response = JSON.parse(res);
                if (response.status == '1') {
                    setLoading(false)
                    return response
                } else {
                    setLoading(false)
                    Toast(response.error, color.red, 10); // Blue snackbar with margin
 
                    return response
                }
            })
            .catch((error) =>
              
                console.error(error));
                setLoading(false)

        return respons
    } catch (error) {
        setLoading(false)
        errorToast(
            'Network error',
        );
    }
};
const getAddPhysicalData = async (userId, setLoading) => {
  try {
    setLoading(true);

    const url = `${base_url}/common/get_add_physical_data`;

    const formData = new FormData();
    formData.append('user_id', userId);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const resText = await response.text();
    const resJson = JSON.parse(resText);

    setLoading(false);

    if (resJson.status === '1') {
      return resJson;
    } else {
      Toast(resJson.error, color.red, 10);
      return resJson;
    }
  } catch (error) {
    console.error("Network error:", error);
    setLoading(false);
    errorToast('Network error');
  }
};


const Getcontactinfo = async (
  setLoading,
) => {
  try {
      setLoading(true)

      const requestOptions = {
          method: "GET",
      };
      const respons = await fetch(`${base_url}/common/get_contact_info`, requestOptions)
          .then((response) => response.text())
          .then((res) => {
              const response = JSON.parse(res);
              if (response.status == '1') {
                  setLoading(false)
                  return response
              } else {
                  setLoading(false)
                  Toast(response.error, color.red, 10); // Blue snackbar with margin

                  return response
              }
          })
          .catch((error) =>
              console.error(error));
      return respons
  } catch (error) {
      setLoading(false)
      errorToast(
          'Network error',
      );
  }
}; 







const Add_physical_data = async (
  param: any,
  setLoading: (loading: boolean) => void,
) => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    const formdata = new FormData();
    // Validate required parameters
    if (!param?.useid || !param?.phyid) {
      errorToast("Missing user_id or physical_id");
      return null;
    }
     formdata.append('user_id', param?.useid);
    formdata.append('physical_id', param?.phyid);
    formdata.append('data', param?.data);  // Replace '44' with dynamic value if needed

    const myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');

    // ✅ Uncomment if Authorization is needed
    if (token) {
      myHeaders.append('Authorization', `Bearer ${token}`);
    }

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    };

    const response = await fetch(`${base_url}/common/add_physical_data`, requestOptions);
    const textResponse = await response.text();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textResponse);
    } catch (jsonError) {
      throw new Error("Invalid server response");
    }
    if (parsedResponse.status == '1') {
      Toast(parsedResponse?.message, color.primary, 30);
      return parsedResponse;
    } else {
      Toast(parsedResponse?.message, color.primary, 10);
      return parsedResponse;
    }

  } catch (error) {
    console.error("Error in Add_physical_data:", error);
    errorToast("Something went wrong. Please try again.");
    return null;
  } finally {
    setLoading(false);
  }
};

const Getcategories = async (setLoading, categoryType) => {
  try {
    setLoading(true);

    const requestOptions = {
      method: "GET",
    };

    const response = await fetch(
      `${base_url}/common/get_categories?category_type=${categoryType}`,
      requestOptions
    );

    const result = await response.json();

    setLoading(false);

    if (result.status === "1") {
      return result; // Success response
    } else {
      Toast(result.error || "Something went wrong", color.red, 10);
      return result; // Failure response bhi return karte hain
    }
  } catch (error) {
    setLoading(false);
    errorToast("Network error");
    console.error("GetCategories Error:", error);
    return null;
  }
};



 
const GetsubcategorCategory_id = async (
  category_id:any,
  // setLoading: (loading: boolean) => void,
) => {
  try {
    // setLoading(true);
    const formdata = new FormData();
    formdata.append("category_id", category_id);
 
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");

 
    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
    };

    const response = await fetch(
      `${base_url}/common/get_sub_category_by_category_id`,
      requestOptions
    );

    // ✅ Parse response
    const textResponse = await response.text();
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textResponse);
    } catch (err) {
      throw new Error("Invalid server response. Please try again later.");
    }

 
    if (parsedResponse?.status === "1") {
       return parsedResponse?.data ?? [];
    } else {
       return [];
    }
  } catch (error: any) {
    console.error("Error in GetsubcategorCategory_id:", error);
    errorToast(error.message || "Something went wrong. Please try again.");
    return [];
  } finally {
   }
};



const AddMealRequest = async (
  param: any,
  setLoading: (loading: boolean) => void,
 ) => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
     const formdata = new FormData();
     if (param.user_id) formdata.append('user_id', param.user_id);
    if (param.name) formdata.append('name', param.name);
    if (param.date) formdata.append('date', param.date);
    if (param.mealrequests) formdata.append('meal_requests', param.mealrequests);
   if (param.utensil_type) formdata.append('utensil_type', param.utensil_type);
      if (param.img) {
      formdata.append('image', {
        uri:param.img.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any); // Cast as any for RN FormData
    }
    formdata.append('type',param?.type);
    
     const myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');

  
    if (token) {
      myHeaders.append('Authorization', `Bearer ${token}`);
    }

 
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    };
console.log("Sss",formdata)
    const response = await fetch(`${base_url}/common/add_meal_request`, requestOptions);
    const textResponse = await response.text();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textResponse);
     } catch (jsonError) {
       throw new Error("Invalid server response");
    }
    console.log("parsedResponse",parsedResponse)
    if (parsedResponse?.status == '1') {
      successToast(
        parsedResponse?.message || "Success", 
      
      );
      return parsedResponse;
    } else {
      errorToast(parsedResponse?.message || "Something went wrong")
      
      return parsedResponse;
    }
    
  } catch (error) {
     errorToast("Something went wrong. Please try again.");
    return null;
  } finally {
    setLoading(false);
  }
};




const VideoUplodApi = async (
  param: any,
  setLoading: (loading: boolean) => void,
 ) => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
     const formdata = new FormData();
     if (param.meal_id) formdata.append('meal_id',param.meal_id);
     formdata.append('utensil_type',"utensil_type");
     
      if (param.typeVideo) {
      formdata.append('video', {
        uri:param.typeVideo,
        name: 'video.mp4', // You can use actual file name if available
        type: 'video/mp4', // Change this according to your file type
      } as any); // Cast as any for RN FormData
    }
     
     const myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');

  
    if (token) {
      myHeaders.append('Authorization', `Bearer ${token}`);
    }

 
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    };
console.log("Sss",formdata)
    const response = await fetch(`${base_url}/common/add_meal_video`, requestOptions);
    const textResponse = await response.text();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textResponse);
     } catch (jsonError) {
       throw new Error("Invalid server response");
    }
    console.log("parsedResponse",parsedResponse)
    if (parsedResponse?.status == '1') {
      successToast(
        parsedResponse?.message || "Success", 
      
      );
      return parsedResponse;
    } else {
      errorToast(parsedResponse?.message || "Something went wrong")
      
      return parsedResponse;
    }
    
  } catch (error) {
     errorToast("Something went wrong. Please try again.");
    return null;
  } finally {
    setLoading(false);
  }
};
export {
  Getcontactinfo,
   
    Get_post_Api,  
   LogiApi,  
  Signupupdate
,
GethelpApi ,
Get_health,
UpdateProfile ,
Getphysicaldata ,
Add_physical_data ,
getAddPhysicalData ,
GetPurchaseplan ,
get_tasksMainAll ,
Getcategories ,
GetsubcategorCategory_id ,
AddMealRequest ,
VideoUplodApi

}  