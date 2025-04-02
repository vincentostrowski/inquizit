import { BookProvider } from "../data/bookContext";
import { AuthProvider } from "../data/authContext";
import { LoadingProvider } from "../data/loadingContext";
import RootLayout from "../screens/rootlayout";

export default function _layout() {

  return (
    <AuthProvider>
      <LoadingProvider>
        <BookProvider>
          <RootLayout/>
        </BookProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}
