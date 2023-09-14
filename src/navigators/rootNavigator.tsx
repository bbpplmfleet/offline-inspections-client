import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UploadPosts from "../pages/uploadPosts";
import AllPosts from "../pages/allPosts";

export default function RootNavigator() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={UploadPosts} />
        <Route path="/photos" Component={AllPosts} />
      </Routes>
    </Router>
  );
}
