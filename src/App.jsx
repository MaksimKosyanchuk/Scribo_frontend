import { useEffect, Suspense, useState, createContext, lazy } from 'react';

import DefaultContainer from './layouts/DefaultContainer/index';

const ApiDocs = lazy(() => import('./pages/Api/index.jsx'));

const PageNotFound = lazy(() => import('./pages/PageNotFound/index.jsx'));
const HomePage = lazy(() => import('./pages/HomePage/index.jsx'));
const Article = lazy(() => import('./pages/Article/index.jsx'));
const Profile = lazy(() => import('./pages/Profile/index.jsx'));
const Settings = lazy(() => import('./pages/Settings/index.jsx'));
const Login = lazy(() => import('./pages/Login/index.jsx'));
const Register = lazy(() => import('./pages/Register/index.jsx'));
const CreatePost = lazy(() => import('./pages/CreatePost/index.jsx'));
const EditPost = lazy(() => import('./pages/EditPost/index.jsx'));
const AdminPanel = lazy(() => import('./pages/AdminPanel/index.jsx'));

import AppLayout from './layouts/AppLayout/index.jsx';
import FullContainer from './layouts/FullContainer/index.jsx';
import PageLayout from './layouts/PageLayout/index.jsx';

import ModalWindow from './components/ModalWindow/index.jsx';
import Header from './components/Header/index.jsx';
import Footer from './components/Footer/index.jsx';
import Toast from './components/Ui/Toast/index.jsx';

import MobileNavigationBar from './components/MobileNavigationBar/index.jsx';

import { CATEGORY_COLORS } from './styles/constants.js';

import "./styles/common.scss";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

const AppContext = createContext()

function App() {
  let lsTheme = localStorage.getItem('theme');
  const [ profile, setProfile ] = useState(null)
  const [ profileLoading, setProfileLoading ] = useState(true)
  let [ isDarkTheme, setIsDarkTheme ] = useState(lsTheme ? JSON.parse(lsTheme) : true);
  let [ toast, showToast ] = useState(false);
  let [ modalWindow, showModalWindow ] = useState(false)
  const [ modalCloseRequest, setModalCloseRequest ] = useState(0)
  const requestCloseModal = () => setModalCloseRequest(c => c + 1)


  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(isDarkTheme));

    document.body.classList.toggle('dark-theme', isDarkTheme);

    const metaThemeColor = document.querySelector(
      'meta[name="theme-color"]'
    );

    metaThemeColor?.setAttribute(
      'content',
      isDarkTheme ? '#1e1e1e' : '#ffffff'
    );
  }, [isDarkTheme]);

  useEffect(() => {
    Object.values(CATEGORY_COLORS).forEach(color => {
        document.body.style.setProperty(
            color.variable,
            isDarkTheme ? color.dark : color.light
        );
    });
  }, [isDarkTheme]);

  return (
    <AppContext.Provider value={{profile, setProfile, isDarkTheme, setIsDarkTheme, profileLoading, setProfileLoading, toast, showToast, modalWindow, showModalWindow, requestCloseModal }}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className={"App"} id="app-root">
          <AppLayout>
            <ModalWindow
              modalWindow={modalWindow}
              showModalWindow={showModalWindow}
              modalCloseRequest={modalCloseRequest}
            />
            <Header/>
            <MobileNavigationBar/>
            
            <Suspense fallback={null}>
                <Routes>
                    <Route element={<PageLayout/>}>
                        <Route element={<DefaultContainer/>}>

                            <Route
                                path="*"
                                element={<Navigate to="/404" replace />}
                            />

                            <Route
                                path="/"
                                element={<Navigate to="/posts" replace />}
                            />

                            <Route path="posts/:id/edit" Component={EditPost}/>
                            <Route path="/auth/login" Component={Login}/>
                            <Route path="/api" Component={ApiDocs}/>
                            <Route path="/auth/register" Component={Register}/>
                            <Route path="/404" Component={PageNotFound}/>
                            <Route path="/posts/" Component={HomePage}/>
                            <Route path="/create-post" Component={CreatePost}/>
                            <Route path="/users/:id" Component={Profile}/>
                            <Route path="/posts/:id" Component={Article}/>
                            <Route path="/settings" Component={Settings}/>

                        </Route>

                        <Route element={<FullContainer/>}>
                            <Route path="admin-panel" Component={AdminPanel}/>
                        </Route>
                    </Route>
                </Routes>
            </Suspense>            
            <Footer></Footer>
            <Toast toast={toast} showToast={showToast}/>
          </AppLayout>
        </div>
      </Router>
    </AppContext.Provider>
  )
}

export { App, AppContext };
