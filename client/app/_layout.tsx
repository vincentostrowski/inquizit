import { BookProvider } from "../data/bookContext";
import { AuthProvider } from "../data/authContext";
import { LoadingProvider } from "../data/loadingContext";
import { QuizitProvider } from "../data/quizitContext";
import RootLayout from "../screens/rootlayout";

export default function _layout() {

  return (
    <AuthProvider>
      <LoadingProvider>
        <BookProvider>
          <QuizitProvider>
            <RootLayout/>
          </QuizitProvider>
        </BookProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}
