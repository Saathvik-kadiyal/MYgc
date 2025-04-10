import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import {store} from './store/index';
import { selectUser } from './store/slices/authSlice';

const ProfileRedirect = () => {
  const user = useSelector(selectUser);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/profile/${user.username}`} replace />;
};


import CreatorTypePage from './pages/CreatorTypePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import OnboardingPage from './pages/OnboardingPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import SearchOptionsPage from './pages/SearchOptionsPage';
import UploadPostPage from './pages/UploadPostPage';
import MainLayout from './components/layout/MainLayout';
import CompanySignupPage from './pages/CompanySignupPage';




function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/profile">
              <Route path=":username" element={<ProfilePage />} />
              <Route index element={<ProfileRedirect />} />
            </Route>
            <Route path="search" element={<SearchPage />} />
            <Route path="search-options" element={<SearchOptionsPage />} />
            <Route path="upload" element={<UploadPostPage />} />
          </Route>
          <Route path="/creator-type" element={<CreatorTypePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/companySignup" element={<CompanySignupPage/>}/>
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
