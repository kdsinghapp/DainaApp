import { createSlice, PayloadAction } from '@reduxjs/toolkit';

 interface UserState {
    userGetData: any;      
    loading: boolean;
    error: string | null;
    isSuccess?: boolean;
    isError?: boolean;
}

 const initialState: UserState = {
    userGetData: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
};

// Payload के लिए टाइप
interface GetSuccessPayload {
    userGetData: any;  
}

// Slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        getSuccess(state, action: PayloadAction<GetSuccessPayload>) {
            state.isSuccess = true;
            state.isError = false;
            state.userGetData = action.payload.userGetData;
        },
    },
});

export const { getSuccess } = userSlice.actions;
export default userSlice.reducer;
