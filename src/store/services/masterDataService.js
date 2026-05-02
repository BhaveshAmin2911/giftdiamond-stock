import api from "../../api/axios";
import { setCategory } from "../slices/categorySlice";
import { setKarigars } from "../slices/karigarSlice";
import { setColors } from "../slices/colorSlice";
import { setBoxes } from "../slices/boxesSlice";
import { setSettingTypes } from "../slices/settingTypeSlice";
import { setWorkTypes } from "../slices/workTypeSlice";
import { setuserData } from "../slices/authSlice";

export const loadMasterData = async (dispatch) => {

  try {
    const res = await api.get("/auth/get-user-info.php");

    const data = res?.data?.data;
    if (res?.data?.status) {
      setTimeout(() => {
        dispatch(setuserData({ 'user': res?.data?.user, 'quote': res?.data?.quote }));
        dispatch(setKarigars(data?.karigars));
        dispatch(setColors(data?.colors));
        dispatch(setBoxes(data?.boxes));
        dispatch(setCategory(data?.categories));
        dispatch(setWorkTypes(data?.work_types));
        dispatch(setSettingTypes(data?.setting_types));
      }, 800);
    } else {
      localStorage.clear();
      window.location.pathname = '/login'
    }

  } catch (err) {
    console.error("Master data load failed", err);
    localStorage.clear();
    window.location.pathname = '/login'
  }
};