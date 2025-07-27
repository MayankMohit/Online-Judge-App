import { useNavigate } from "react-router-dom";
import UserProfile from "../../components/UserProfile";

export default function UserManagementPage() {
  const navigate = useNavigate();

  // Dummy User Data
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    totalProblemsSolved: 12,
    role: "user", // default role
    difficultyStats: { Easy: 5, Medium: 4, Hard: 3 },
  };

  // Dummy Problems List
  const problemsList = [
    { _id: "p1", title: "Two Sum", problemNumber: 1 },
    { _id: "p2", title: "Reverse Linked List", problemNumber: 2 },
    { _id: "p3", title: "Binary Search", problemNumber: 3 },
    { _id: "p4", title: "Word Ladder", problemNumber: 4 },
  ];

  // Dummy Submissions List
  const submissionsList = [
    {
      _id: "s1",
      problem: { title: "Two Sum" },
      language: "JavaScript",
      verdict: "accepted",
      submittedAt: "2025-07-26T12:00:00Z",
    },
    {
      _id: "s2",
      problem: { title: "Reverse Linked List" },
      language: "Python",
      verdict: "wrong answer",
      submittedAt: "2025-07-25T09:00:00Z",
    },
    {
      _id: "s1",
      problem: { title: "Two Sum" },
      language: "JavaScript",
      verdict: "accepted",
      submittedAt: "2025-07-26T12:00:00Z",
    },
    {
      _id: "s2",
      problem: { title: "Reverse Linked List" },
      language: "Python",
      verdict: "wrong answer",
      submittedAt: "2025-07-25T09:00:00Z",
    },
    {
      _id: "s1",
      problem: { title: "Two Sum" },
      language: "JavaScript",
      verdict: "accepted",
      submittedAt: "2025-07-26T12:00:00Z",
    },
    {
      _id: "s2",
      problem: { title: "Reverse Linked List" },
      language: "Python",
      verdict: "wrong answer",
      submittedAt: "2025-07-25T09:00:00Z",
    },
    {
      _id: "s1",
      problem: { title: "Two Sum" },
      language: "JavaScript",
      verdict: "accepted",
      submittedAt: "2025-07-26T12:00:00Z",
    },
    {
      _id: "s2",
      problem: { title: "Reverse Linked List" },
      language: "Python",
      verdict: "wrong answer",
      submittedAt: "2025-07-25T09:00:00Z",
    },
    {
      _id: "s1",
      problem: { title: "Two Sum" },
      language: "JavaScript",
      verdict: "accepted",
      submittedAt: "2025-07-26T12:00:00Z",
    },
    {
      _id: "s2",
      problem: { title: "Reverse Linked List" },
      language: "Python",
      verdict: "wrong answer",
      submittedAt: "2025-07-25T09:00:00Z",
    },
  ];

  const handleBack = () => navigate("/admin");
  const handleViewAllSubmissions = () =>
    navigate(`/admin/users/${userData._id || "123"}/submissions`);
  const handleToggleAdmin = () => {
    alert(
      userData.role === "admin"
        ? "Demoting user to normal user."
        : "Promoting user to admin."
    );
  };

  return (
    <UserProfile
      title={`${userData.name}'s Profile`}
      userData={userData}
      problemsList={problemsList}
      submissionsList={submissionsList}
      onBack={handleBack}
      onViewAllSubmissions={handleViewAllSubmissions}
      onToggleAdmin={handleToggleAdmin}
    />
  );
}
