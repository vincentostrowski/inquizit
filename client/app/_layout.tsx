import { BookProvider } from "../data/bookContext";
import { AuthProvider } from "../data/authContext";
import RootLayout from "../screens/rootlayout";

export default function _layout() {

  return (
    <AuthProvider>
      <BookProvider>
        <RootLayout/>
      </BookProvider>
    </AuthProvider>
  );
}
