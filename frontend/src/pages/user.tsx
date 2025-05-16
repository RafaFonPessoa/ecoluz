import { Navbar } from "../components/Navbar";
import { UserProfile } from "../components/UserProfile";

export function User() {
  return (
    <div id="container-UserPage">
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <UserProfile />
      </div>
    </div>
  );
}
