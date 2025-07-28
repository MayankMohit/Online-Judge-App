import { useDispatch, useSelector } from "react-redux";
import { toggleUserRole, resetToggleRoleState } from "../../features/dashboard/adminToggleRoleSlice";

export const useToggleUserRole = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.adminToggleRole);

  const triggerToggleRole = (userId) => {
    dispatch(toggleUserRole(userId));
  };

  const resetState = () => {
    dispatch(resetToggleRoleState());
  };

  return {
    ...state,
    triggerToggleRole,
    resetState,
  };
};
