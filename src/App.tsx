import "./index.css";
import { ToastContainer } from "react-toastify";
import RootNavigator from "./navigators/rootNavigator";
import { ChakraProvider } from "@chakra-ui/react";
import "react-toastify/dist/ReactToastify.css";
export const serverUrl = "https://server.clean-really-bullfrog.ngrok-free.app";
function App() {
  return (
    <>
      <ChakraProvider>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <RootNavigator />
      </ChakraProvider>
    </>
  );
}

export default App;
