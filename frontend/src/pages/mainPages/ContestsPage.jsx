import ComingSoon from "../../components/ComingSoon";

const ContestsPage = () => {
  return (
    <ComingSoon
      title="Contests"
      description="Compete in timed coding contests, climb the rankings, and test your skills under pressure."
      features={[
        "Timed contests with live leaderboard",
        "Rated & unrated contest modes",
        "Post-contest editorial & solutions",
        "Contest history & performance stats",
      ]}
    />
  );
};

export default ContestsPage;