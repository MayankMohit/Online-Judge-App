import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import UserProfile from "../../components/UserProfile";
import ConfirmToggleDialog from "../../components/Admin/ConfirmToggleDialog";
import { useAdminUserDashboard } from "../../hooks/adminHooks/useAdminUserDashboard";
import { useToggleUserRole } from "../../hooks/adminHooks/useToggleUserRole";

export default function UserManagementPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [showDialog, setShowDialog] = useState(false);
  const [optimisticRole, setOptimisticRole] = useState(null);

  const {
    userData,
    submissionsList,
    problemsList,
    loading,
    error,
  } = useAdminUserDashboard(userId); 

  const {
    loading: toggleLoading,
    success: toggleSuccess,
    error: toggleError,
    triggerToggleRole,
    resetState,
  } = useToggleUserRole();

  const handleBack = () => navigate("/admin");

  const handleViewAllSubmissions = () =>
    navigate(`/admin/users/${userId}/submissions`);

  const handleToggleAdmin = () => setShowDialog(true);

  const confirmToggle = () => {
    if (!userData) return;

    const oldRole = userData.role;
    const newRole = oldRole === "admin" ? "user" : "admin";

    setOptimisticRole(newRole);

    toast.loading(
      `${oldRole === "admin" ? "Demoting" : "Promoting"} user...`,
      { id: "toggleRole" }
    );

    triggerToggleRole(userId);
  };

  useEffect(() => {
    if (toggleSuccess) {
      toast.success("Role updated successfully.", { id: "toggleRole" });
      setShowDialog(false);
      setOptimisticRole(null);
      resetState();
      navigate(0); 
    } else if (toggleError) {
      toast.error("Failed to toggle role.", { id: "toggleRole" });
      setShowDialog(false);
      setOptimisticRole(null);
      resetState();
    }
  }, [toggleSuccess, toggleError]);

  if (loading) return <div className="p-4 text-lg">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!userData) return null;

  const effectiveUserData = optimisticRole
    ? { ...userData, role: optimisticRole }
    : userData;

  return (
    <>
      <UserProfile
        title={`${userData.name}'s Profile`}
        userData={effectiveUserData}
        problemsList={problemsList}
        submissionsList={submissionsList}
        onBack={handleBack}
        onViewAllSubmissions={handleViewAllSubmissions}
        onToggleAdmin={handleToggleAdmin}
        loadingToggle={toggleLoading}
      />

      <ConfirmToggleDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={confirmToggle}
        user={userData}
      />
    </>
  );
}
